const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Employee = require('../models/Employee');
const { S3Client, ListBucketsCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.CUSTOM_REGION,
  credentials: {
    accessKeyId: process.env.CUSTOM_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUSTOM_SECRET_ACCESS_KEY,
  },
});

// Test S3 connection
router.get('/test-s3', async (req, res) => {
  try {
    const command = new ListBucketsCommand({});
    const result = await s3Client.send(command);
    res.json({ success: true, message: 'S3 connected', buckets: result.Buckets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'S3 connection failed', error: error.message });
  }
});

// Simple upload using AWS SDK v3 (no auth required)
router.post('/simple/:employeeId/:documentType', async (req, res) => {
  const memoryUpload = multer({ storage: multer.memoryStorage() });
  
  memoryUpload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Upload error', error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      const { employeeId, documentType } = req.params;
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `employees/${employeeId}/${documentType}-${Date.now()}.${fileExtension}`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CUSTOM_S3_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        },
      });
      
      const result = await upload.done();
      
      // Update employee document in database
      console.log('Updating employee document:', employeeId, documentType);
      const employee = await Employee.findById(employeeId);
      if (employee) {
        const updateData = {
          [`documents.${documentType}`]: {
            url: result.Location,
            uploadedAt: new Date(),
            fileName: req.file.originalname
          }
        };
        
        console.log('Update data:', updateData);
        const updatedEmployee = await Employee.findByIdAndUpdate(
          employeeId, 
          { $set: updateData }, 
          { new: true }
        );
        console.log('Employee updated successfully:', updatedEmployee.documents);
      } else {
        console.log('Employee not found:', employeeId);
      }
      
      res.json({
        success: true,
        message: `${documentType} uploaded successfully`,
        s3Url: result.Location,
        document: {
          fileName: req.file.originalname,
          uploadedAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  });
});

// Branch document upload
router.post('/branch/:documentType', async (req, res) => {
  const memoryUpload = multer({ storage: multer.memoryStorage() });
  
  memoryUpload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Upload error', error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      const { documentType } = req.params;
      const { branchName, branchId } = req.body;
      
      if (!branchName) {
        return res.status(400).json({ success: false, message: 'Branch name is required' });
      }
      
      const fileExtension = req.file.originalname.split('.').pop();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-');
      
      const fileName = `branches/${branchName}/${documentType}-${dateStr}.${fileExtension}`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CUSTOM_S3_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        },
      });
      
      const result = await upload.done();
      
      // Update branch document in database if branchId is provided
      if (branchId) {
        const Branch = require('../models/Branch');
        console.log('Updating branch document:', branchId, documentType);
        
        const updateData = {
          [`branchDocuments.${documentType}`]: {
            url: result.Location,
            fileName: req.file.originalname,
            uploadedAt: new Date()
          }
        };
        
        console.log('Update data:', updateData);
        const updatedBranch = await Branch.findByIdAndUpdate(
          branchId, 
          { $set: updateData }, 
          { new: true }
        );
        console.log('Branch updated successfully:', updatedBranch?.branchDocuments);
      }
      
      res.json({
        success: true,
        message: `${documentType} uploaded successfully`,
        s3Url: result.Location,
        document: {
          fileName: req.file.originalname,
          uploadedAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Branch upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  });
});

// Direct S3 upload without employee requirement
router.post('/direct/:documentType', async (req, res) => {
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
  
  memoryUpload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Upload error', error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      const { documentType } = req.params;
      const { email, vehicleId } = req.body;
      
      const fileExtension = req.file.originalname.split('.').pop();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-'); // dd-mm-yyyy format
      
      let fileName;
      if (vehicleId && vehicleId !== 'temp-upload') {
        // Vehicle document upload
        fileName = `vehicles/${vehicleId}/${documentType}-${dateStr}.${fileExtension}`;
      } else if (email) {
        // Employee document upload
        fileName = `employees/${email}/${documentType}-${dateStr}.${fileExtension}`;
      } else {
        // Temporary upload
        fileName = `temp/${documentType}-${Date.now()}.${fileExtension}`;
      }
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CUSTOM_S3_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        },
      });
      
      const result = await upload.done();
      
      res.json({
        success: true,
        message: `${documentType} uploaded successfully`,
        s3Url: result.Location,
        document: {
          fileName: req.file.originalname,
          uploadedAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  });
});

// Upload single document
router.post('/document/:employeeId/:documentType', upload.single('document'), async (req, res) => {
  try {
    const { employeeId, documentType } = req.params;
    const validTypes = ['qidCopy', 'passportCopy', 'visa', 'medicalCard', 'contract', 'profilePicture'];
    
    console.log('Upload request:', { employeeId, documentType, file: req.file });
    
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('File uploaded to S3:', req.file.location);
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    const updateData = {
      [`documents.${documentType}`]: {
        url: req.file.location,
        uploadedAt: new Date(),
        fileName: req.file.originalname
      }
    };
    
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updateData },
      { new: true }
    );
    
    console.log('Document saved to DB:', updateData);
    
    res.json({
      success: true,
      message: `${documentType} uploaded successfully`,
      document: updatedEmployee.documents[documentType],
      s3Url: req.file.location
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// Remove document
router.delete('/document/:employeeId/:documentType', async (req, res) => {
  try {
    const { employeeId, documentType } = req.params;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    if (employee.documents && employee.documents[documentType] && employee.documents[documentType].url) {
      // Delete from S3
      const key = employee.documents[documentType].url.split('/').slice(-2).join('/');
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.CUSTOM_S3_BUCKET_NAME,
          Key: key
        });
        await s3Client.send(deleteCommand);
      } catch (deleteError) {
        console.log('Error deleting from S3:', deleteError);
      }
      
      // Remove from database
      await Employee.findByIdAndUpdate(
        employeeId,
        { $unset: { [`documents.${documentType}`]: 1 } },
        { new: true }
      );
      
      res.json({
        success: true,
        message: `${documentType} removed successfully`
      });
    } else {
      res.status(404).json({ success: false, message: 'Document not found' });
    }
    
  } catch (error) {
    console.error('Remove error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove document',
      error: error.message
    });
  }
});

// Get employee documents
router.get('/documents/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({
      success: true,
      documents: employee.documents || {}
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get documents',
      error: error.message
    });
  }
});

// Get document URL
router.get('/document/:employeeId/:documentType', async (req, res) => {
  try {
    const { employeeId, documentType } = req.params;
    
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.documents || !employee.documents[documentType]) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({
      url: employee.documents[documentType].url,
      fileName: employee.documents[documentType].fileName,
      uploadedAt: employee.documents[documentType].uploadedAt
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving document', error: error.message });
  }
});

// Vehicle document upload
router.post('/vehicle/:documentType', async (req, res) => {
  const memoryUpload = multer({ storage: multer.memoryStorage() });
  
  memoryUpload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Upload error', error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    try {
      const { documentType } = req.params;
      const { vehicleId, branchId } = req.body;
      
      if (!vehicleId) {
        return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
      }
      
      const fileExtension = req.file.originalname.split('.').pop();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB').replace(/\//g, '-');
      
      const fileName = `vehicles/${vehicleId}/${documentType}-${dateStr}.${fileExtension}`;
      
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.CUSTOM_S3_BUCKET_NAME,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype
        },
      });
      
      const result = await upload.done();
      
      // Update vehicle document in database
      if (branchId) {
        const Branch = require('../models/Branch');
        console.log('Updating vehicle document in branch:', { branchId, vehicleId, documentType });
        
        try {
          const branch = await Branch.findById(branchId);
          console.log('Branch found:', !!branch);
          console.log('Vehicles count:', branch?.vehicles?.length);
          
          if (branch && branch.vehicles) {
            const vehicleIndex = branch.vehicles.findIndex(v => v.licenseNumber === vehicleId);
            console.log('Vehicle index:', vehicleIndex);
            
            if (vehicleIndex !== -1) {
              console.log('Before update:', branch.vehicles[vehicleIndex][documentType]);
              
              // Use MongoDB $set operator to update nested document
              const updateQuery = {};
              updateQuery[`vehicles.${vehicleIndex}.${documentType}`] = {
                url: result.Location,
                fileName: req.file.originalname,
                uploadedAt: new Date()
              };
              
              const updatedBranch = await Branch.findByIdAndUpdate(
                branchId,
                { $set: updateQuery },
                { new: true }
              );
              
              console.log('Vehicle document updated successfully');
              console.log('Updated document:', updatedBranch.vehicles[vehicleIndex][documentType]);
            } else {
              console.log('Vehicle not found with licenseNumber:', vehicleId);
            }
          }
        } catch (error) {
          console.error('Error updating vehicle document in branch:', error);
        }
      }
      
      res.json({
        success: true,
        message: `${documentType} uploaded successfully`,
        s3Url: result.Location,
        document: {
          fileName: req.file.originalname,
          uploadedAt: new Date()
        }
      });
      
    } catch (error) {
      console.error('Vehicle upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      });
    }
  });
});

// Test endpoint to check employee documents
router.get('/check/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({
      success: true,
      employee: {
        _id: employee._id,
        name: employee.name,
        documents: employee.documents || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;