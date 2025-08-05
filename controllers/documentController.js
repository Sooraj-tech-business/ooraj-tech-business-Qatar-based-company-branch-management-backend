const Employee = require('../models/Employee');
const Branch = require('../models/Branch');
const asyncHandler = require('express-async-handler');

// @desc    Get all expiring documents
// @route   GET /api/documents/expiring
// @access  Private
const getExpiringDocuments = asyncHandler(async (req, res) => {
  const { category } = req.query;
  console.log('Getting expiring documents for category:', category);
  
  try {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setDate(today.getDate() + 30);
    
    const expiringDocuments = [];
    
    // Get employee documents that are expiring
    if (!category || category === 'all' || category === 'employee') {
      const employees = await Employee.find({});
      employees.forEach(employee => {
        // Check medical card expiry
        if (employee.medicalCardExpiry && new Date(employee.medicalCardExpiry) > today && new Date(employee.medicalCardExpiry) <= oneMonthFromNow) {
          expiringDocuments.push({
            type: 'Medical Card',
            number: employee.medicalCardNumber || 'N/A',
            expiryDate: employee.medicalCardExpiry,
            entityId: employee._id,
            entityName: employee.name,
            entityType: 'employee',
            category: 'employee'
          });
        }
        
        // Check visa expiry
        if (employee.visaExpiry && new Date(employee.visaExpiry) > today && new Date(employee.visaExpiry) <= oneMonthFromNow) {
          expiringDocuments.push({
            type: 'Visa',
            number: employee.visaNumber || 'N/A',
            expiryDate: employee.visaExpiry,
            entityId: employee._id,
            entityName: employee.name,
            entityType: 'employee',
            category: 'employee'
          });
        }
      });
    }
    
    // Get branch documents that are expiring
    if (!category || category === 'all' || category === 'branch' || category === 'vehicle') {
      const branches = await Branch.find({});
      branches.forEach(branch => {
        // Branch documents
        if ((!category || category === 'all' || category === 'branch') && branch.documents && branch.documents.length > 0) {
          branch.documents.forEach(doc => {
            if (doc.expiryDate && new Date(doc.expiryDate) > today && new Date(doc.expiryDate) <= oneMonthFromNow) {
              expiringDocuments.push({
                type: doc.type,
                number: doc.number,
                expiryDate: doc.expiryDate,
                entityId: branch._id,
                entityName: branch.name,
                entityType: 'branch',
                category: 'branch'
              });
            }
          });
        }
        
        // Vehicle documents
        if ((!category || category === 'all' || category === 'vehicle') && branch.vehicles && branch.vehicles.length > 0) {
          branch.vehicles.forEach(vehicle => {
            // Check license expiry
            if (vehicle.licenseExpiry && new Date(vehicle.licenseExpiry) > today && new Date(vehicle.licenseExpiry) <= oneMonthFromNow) {
              expiringDocuments.push({
                type: 'Vehicle License',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.licenseExpiry,
                entityId: branch._id,
                entityName: branch.name,
                vehicleId: vehicle._id || vehicle.licenseNumber,
                vehicleLicense: vehicle.licenseNumber,
                entityType: 'branch',
                category: 'vehicle'
              });
            }
            
            // Check insurance expiry
            if (vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) > today && new Date(vehicle.insuranceExpiry) <= oneMonthFromNow) {
              expiringDocuments.push({
                type: 'Vehicle Insurance',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.insuranceExpiry,
                entityId: branch._id,
                entityName: branch.name,
                vehicleId: vehicle._id || vehicle.licenseNumber,
                vehicleLicense: vehicle.licenseNumber,
                entityType: 'branch',
                category: 'vehicle'
              });
            }
          });
        }
      });
    }
    
    // Sort by expiry date (closest first)
    expiringDocuments.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    
    console.log(`Found ${expiringDocuments.length} expiring documents for category: ${category || 'all'}`);
    res.json(expiringDocuments);
  } catch (error) {
    console.error('Error fetching expiring documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expiring documents',
      error: error.message
    });
  }
});

// @desc    Get all expired documents
// @route   GET /api/documents/expired
// @access  Private
const getExpiredDocuments = asyncHandler(async (req, res) => {
  const { category } = req.query;
  console.log('Getting expired documents for category:', category);
  
  try {
    const today = new Date();
    
    const expiredDocuments = [];
    
    // Get employee documents that are expired
    if (!category || category === 'all' || category === 'employee') {
      const employees = await Employee.find({});
      employees.forEach(employee => {
        // Check medical card expiry
        if (employee.medicalCardExpiry && new Date(employee.medicalCardExpiry) < today) {
          expiredDocuments.push({
            type: 'Medical Card',
            number: employee.medicalCardNumber || 'N/A',
            expiryDate: employee.medicalCardExpiry,
            entityId: employee._id,
            entityName: employee.name,
            entityType: 'employee',
            category: 'employee'
          });
        }
        
        // Check visa expiry
        if (employee.visaExpiry && new Date(employee.visaExpiry) < today) {
          expiredDocuments.push({
            type: 'Visa',
            number: employee.visaNumber || 'N/A',
            expiryDate: employee.visaExpiry,
            entityId: employee._id,
            entityName: employee.name,
            entityType: 'employee',
            category: 'employee'
          });
        }
      });
    }
    
    // Get branch documents that are expired
    if (!category || category === 'all' || category === 'branch' || category === 'vehicle') {
      const branches = await Branch.find({});
      branches.forEach(branch => {
        // Branch documents
        if ((!category || category === 'all' || category === 'branch') && branch.documents && branch.documents.length > 0) {
          branch.documents.forEach(doc => {
            if (doc.expiryDate && new Date(doc.expiryDate) < today) {
              expiredDocuments.push({
                type: doc.type,
                number: doc.number,
                expiryDate: doc.expiryDate,
                entityId: branch._id,
                entityName: branch.name,
                entityType: 'branch',
                category: 'branch'
              });
            }
          });
        }
        
        // Vehicle documents
        if ((!category || category === 'all' || category === 'vehicle') && branch.vehicles && branch.vehicles.length > 0) {
          branch.vehicles.forEach(vehicle => {
            // Check license expiry
            if (vehicle.licenseExpiry && new Date(vehicle.licenseExpiry) < today) {
              expiredDocuments.push({
                type: 'Vehicle License',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.licenseExpiry,
                entityId: branch._id,
                entityName: branch.name,
                vehicleId: vehicle._id || vehicle.licenseNumber,
                vehicleLicense: vehicle.licenseNumber,
                entityType: 'branch',
                category: 'vehicle'
              });
            }
            
            // Check insurance expiry
            if (vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < today) {
              expiredDocuments.push({
                type: 'Vehicle Insurance',
                number: vehicle.licenseNumber,
                expiryDate: vehicle.insuranceExpiry,
                entityId: branch._id,
                entityName: branch.name,
                vehicleId: vehicle._id || vehicle.licenseNumber,
                vehicleLicense: vehicle.licenseNumber,
                entityType: 'branch',
                category: 'vehicle'
              });
            }
          });
        }
      });
    }
    
    // Sort by expiry date (most recently expired first)
    expiredDocuments.sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate));
    
    console.log(`Found ${expiredDocuments.length} expired documents for category: ${category || 'all'}`);
    res.json(expiredDocuments);
  } catch (error) {
    console.error('Error fetching expired documents:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching expired documents',
      error: error.message
    });
  }
});

module.exports = {
  getExpiringDocuments,
  getExpiredDocuments
};