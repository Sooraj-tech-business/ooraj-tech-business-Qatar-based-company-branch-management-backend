const Branch = require('../models/Branch');
const asyncHandler = require('express-async-handler');
const { logActivity } = require('./activityController');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
const getBranches = asyncHandler(async (req, res) => {
  console.log('Getting all branches');
  
  try {
    const branches = await Branch.find({});
    console.log(`Found ${branches.length} branches`);
    
    if (branches.length === 0) {
      console.log('No branches found, creating default branch');
      
      // Create a default branch if none exist
      const defaultBranch = await Branch.create({
        name: 'Headquarters',
        location: 'Main Location',
        address: 'Main Street',
        manager: 'Admin',
        contactNumber: '+974 1234 5678',
        email: 'admin@company.com',
        documents: [],
        vehicles: [],
        assignedUsers: []
      });
      
      // Log activity
      await logActivity({
        type: 'branch_created',
        description: 'Default branch "Headquarters" was created',
        entityId: defaultBranch._id,
        entityName: defaultBranch.name,
        entityType: 'branch'
      });
      
      console.log('Default branch created:', defaultBranch);
      return res.json([defaultBranch]);
    }
    
    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching branches',
      error: error.message
    });
  }
});

// @desc    Add a new branch
// @route   POST /api/branches
// @access  Private
const addBranch = asyncHandler(async (req, res) => {
  console.log('Adding branch with data:', req.body);
  
  const { name, location, address, manager, contactNumber, email, documents, vehicles, assignedUsers, crNumber, crExpiry, ruksaNumber, ruksaExpiry, computerCardNumber, computerCardExpiry, certificationNumber, certificationExpiry, branchDocuments } = req.body;
  
  console.log('Branch documents received:', branchDocuments);

  // Name and location are no longer required
  
  // Process vehicles to ensure all fields are included
  const processedVehicles = Array.isArray(vehicles) ? vehicles.map(vehicle => ({
    type: vehicle.type || '',
    licenseNumber: vehicle.licenseNumber || '',
    licenseExpiry: vehicle.licenseExpiry || null,
    insuranceExpiry: vehicle.insuranceExpiry || null,
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: parseInt(vehicle.year) || 2025,
    color: vehicle.color || '',
    status: vehicle.status || 'active'
  })).filter(vehicle => vehicle.licenseNumber) : [];
  
  console.log('Processed vehicles:', processedVehicles);

  const branch = await Branch.create({
    name,
    location,
    address,
    manager,
    contactNumber,
    email,
    crNumber,
    crExpiry: crExpiry ? new Date(crExpiry) : null,
    ruksaNumber,
    ruksaExpiry: ruksaExpiry ? new Date(ruksaExpiry) : null,
    computerCardNumber,
    computerCardExpiry: computerCardExpiry ? new Date(computerCardExpiry) : null,
    certificationNumber,
    certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : null,
    branchDocuments: branchDocuments || {
      crDocument: null,
      ruksaDocument: null,
      computerCardDocument: null,
      certificationDocument: null
    },
    documents: documents || [],
    vehicles: processedVehicles,
    assignedUsers: assignedUsers || [],
    shareholders: req.body.shareholders || []
  });

  if (branch) {
    // Log activity
    await logActivity({
      type: 'branch_created',
      description: `Branch "${name}" was created`,
      entityId: branch._id,
      entityName: name,
      entityType: 'branch'
    });
    
    res.status(201).json(branch);
  } else {
    res.status(400);
    throw new Error('Invalid branch data');
  }
});

// @desc    Update a branch
// @route   PUT /api/branches/:id
// @access  Private
const updateBranch = asyncHandler(async (req, res) => {
  try {
    console.log('Updating branch with ID:', req.params.id);
    console.log('Update data received:', req.body);
    console.log('Branch documents in request:', req.body.branchDocuments);
    
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      res.status(404);
      throw new Error('Branch not found');
    }

    // Process vehicles to ensure all fields are included
    const processedVehicles = Array.isArray(req.body.vehicles) ? req.body.vehicles.map(vehicle => ({
      type: vehicle.type || '',
      licenseNumber: vehicle.licenseNumber || '',
      licenseExpiry: vehicle.licenseExpiry || null,
      insuranceExpiry: vehicle.insuranceExpiry || null,
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: parseInt(vehicle.year) || 2025,
      color: vehicle.color || '',
      status: vehicle.status || 'active'
    })).filter(vehicle => vehicle.licenseNumber) : branch.vehicles;
    
    console.log('Processed vehicles for update:', processedVehicles);
    
    // Update all fields including vehicles and documents
    const updateData = {
      name: req.body.name || branch.name,
      location: req.body.location || branch.location,
      address: req.body.address,
      manager: req.body.manager,
      contactNumber: req.body.contactNumber,
      email: req.body.email,
      crNumber: req.body.hasOwnProperty('crNumber') ? req.body.crNumber : branch.crNumber,
      crExpiry: req.body.hasOwnProperty('crExpiry') ? (req.body.crExpiry ? new Date(req.body.crExpiry) : null) : branch.crExpiry,
      ruksaNumber: req.body.hasOwnProperty('ruksaNumber') ? req.body.ruksaNumber : branch.ruksaNumber,
      ruksaExpiry: req.body.hasOwnProperty('ruksaExpiry') ? (req.body.ruksaExpiry ? new Date(req.body.ruksaExpiry) : null) : branch.ruksaExpiry,
      computerCardNumber: req.body.hasOwnProperty('computerCardNumber') ? req.body.computerCardNumber : branch.computerCardNumber,
      computerCardExpiry: req.body.hasOwnProperty('computerCardExpiry') ? (req.body.computerCardExpiry ? new Date(req.body.computerCardExpiry) : null) : branch.computerCardExpiry,
      certificationNumber: req.body.hasOwnProperty('certificationNumber') ? req.body.certificationNumber : branch.certificationNumber,
      certificationExpiry: req.body.hasOwnProperty('certificationExpiry') ? (req.body.certificationExpiry ? new Date(req.body.certificationExpiry) : null) : branch.certificationExpiry,
      branchDocuments: {
        ...branch.branchDocuments,
        ...(req.body.branchDocuments || {})
      },
      documents: req.body.documents || branch.documents,
      vehicles: processedVehicles,
      assignedUsers: req.body.assignedUsers || branch.assignedUsers,
      shareholders: req.body.shareholders || branch.shareholders
    };

    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      {
        new: true,
        runValidators: true
      }
    );

    console.log('Branch updated successfully:', updatedBranch);

    // Log activity
    await logActivity({
      type: 'branch_updated',
      description: `Branch "${updatedBranch.name}" was updated`,
      entityId: updatedBranch._id,
      entityName: updatedBranch.name,
      entityType: 'branch'
    });

    res.json(updatedBranch);
  } catch (error) {
    console.error('Error in updateBranch:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get all vehicles from all branches
// @route   GET /api/vehicles
// @access  Private
const getAllVehicles = asyncHandler(async (req, res) => {
  const branches = await Branch.find({});
  const allVehicles = [];
  
  branches.forEach(branch => {
    if (Array.isArray(branch.vehicles)) {
      branch.vehicles.forEach(vehicle => {
        allVehicles.push({
          type: vehicle.type,
          licenseNumber: vehicle.licenseNumber,
          licenseExpiry: vehicle.licenseExpiry,
          insuranceExpiry: vehicle.insuranceExpiry,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          status: vehicle.status,
          licenseDocument: vehicle.licenseDocument,
          insuranceDocument: vehicle.insuranceDocument,
          branchId: branch._id,
          branchName: branch.name
        });
      });
    }
  });
  
  res.json(allVehicles);
});

// @desc    Add a vehicle to a branch
// @route   POST /api/vehicles
// @access  Private
const addVehicle = asyncHandler(async (req, res) => {
  console.log('Adding vehicle with data:', req.body);
  console.log('License document from request:', req.body.licenseDocument);
  console.log('Insurance document from request:', req.body.insuranceDocument);
  
  const { branch: branchId, type, licenseNumber, licenseExpiry, insuranceExpiry, make, model, year, color, status } = req.body;
  
  if (!branchId || !licenseNumber) {
    res.status(400);
    throw new Error('Please provide branch ID and license number');
  }
  
  const branch = await Branch.findById(branchId);
  
  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }
  
  const vehicleData = {
    type: type || '',
    licenseNumber,
    licenseExpiry: licenseExpiry || null,
    insuranceExpiry: insuranceExpiry || null,
    make: make || '',
    model: model || '',
    year: parseInt(year) || 2025,
    color: color || '',
    status: status || 'active',
    licenseDocument: req.body.licenseDocument || null,
    insuranceDocument: req.body.insuranceDocument || null
  };
  
  console.log('Vehicle data to be saved:', vehicleData);
  
  // Check if vehicle already exists
  const existingVehicleIndex = branch.vehicles.findIndex(v => v.licenseNumber === licenseNumber);
  if (existingVehicleIndex >= 0) {
    // Update existing vehicle
    branch.vehicles[existingVehicleIndex] = vehicleData;
  } else {
    // Add new vehicle
    branch.vehicles.push(vehicleData);
  }
  
  await branch.save();
  
  // Log activity
  await logActivity({
    type: 'vehicle_added',
    description: `Vehicle "${licenseNumber}" was added to branch "${branch.name}"`,
    entityId: licenseNumber,
    entityName: licenseNumber,
    entityType: 'vehicle'
  });
  
  res.status(201).json({
    ...vehicleData,
    licenseDocument: req.body.licenseDocument || null,
    insuranceDocument: req.body.insuranceDocument || null,
    branchId: branch._id,
    branchName: branch.name
  });
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:licenseNumber
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const { licenseNumber } = req.params;
  const { branchId, originalBranchId, type, licenseExpiry, insuranceExpiry } = req.body;
  
  if (!branchId) {
    res.status(400);
    throw new Error('Branch ID is required');
  }
  
  // If vehicle is moved to a different branch
  if (branchId !== originalBranchId) {
    // Remove from original branch
    const originalBranch = await Branch.findById(originalBranchId);
    if (originalBranch) {
      originalBranch.vehicles = originalBranch.vehicles.filter(
        v => v.licenseNumber !== licenseNumber
      );
      await originalBranch.save();
    }
    
    // Add to new branch
    const newBranch = await Branch.findById(branchId);
    if (!newBranch) {
      res.status(404);
      throw new Error('New branch not found');
    }
    
    const vehicleData = {
      type: type || '',
      licenseNumber,
      licenseExpiry: licenseExpiry || null,
      insuranceExpiry: insuranceExpiry || null,
      make: req.body.make || '',
      model: req.body.model || '',
      year: parseInt(req.body.year) || 2025,
      color: req.body.color || '',
      status: req.body.status || 'active'
    };
    
    newBranch.vehicles.push(vehicleData);
    await newBranch.save();
    
    // Log activity
    await logActivity({
      type: 'vehicle_updated',
      description: `Vehicle "${licenseNumber}" was moved from "${originalBranch.name}" to "${newBranch.name}"`,
      entityId: licenseNumber,
      entityName: licenseNumber,
      entityType: 'vehicle'
    });
    
    res.json({
      ...vehicleData,
      branchId: newBranch._id,
      branchName: newBranch.name
    });
  } else {
    // Update in the same branch
    const branch = await Branch.findById(branchId);
    if (!branch) {
      res.status(404);
      throw new Error('Branch not found');
    }
    
    const vehicleIndex = branch.vehicles.findIndex(v => v.licenseNumber === licenseNumber);
    
    if (vehicleIndex === -1) {
      res.status(404);
      throw new Error('Vehicle not found');
    }
    
    // Preserve existing document fields
    const existingVehicle = branch.vehicles[vehicleIndex];
    
    branch.vehicles[vehicleIndex] = {
      type: type || '',
      licenseNumber,
      licenseExpiry: licenseExpiry || null,
      insuranceExpiry: insuranceExpiry || null,
      make: req.body.make || '',
      model: req.body.model || '',
      year: parseInt(req.body.year) || 2025,
      color: req.body.color || '',
      status: req.body.status || 'active',
      licenseDocument: req.body.licenseDocument || existingVehicle.licenseDocument || null,
      insuranceDocument: req.body.insuranceDocument || existingVehicle.insuranceDocument || null
    };
    
    await branch.save();
    
    // Log activity
    await logActivity({
      type: 'vehicle_updated',
      description: `Vehicle "${licenseNumber}" was updated in branch "${branch.name}"`,
      entityId: licenseNumber,
      entityName: licenseNumber,
      entityType: 'vehicle'
    });
    
    // MongoDB subdocuments don't have toObject method directly
    const updatedVehicle = branch.vehicles[vehicleIndex];
    res.json({
      type: updatedVehicle.type,
      licenseNumber: updatedVehicle.licenseNumber,
      licenseExpiry: updatedVehicle.licenseExpiry,
      insuranceExpiry: updatedVehicle.insuranceExpiry,
      make: updatedVehicle.make,
      model: updatedVehicle.model,
      year: updatedVehicle.year,
      color: updatedVehicle.color,
      status: updatedVehicle.status,
      licenseDocument: updatedVehicle.licenseDocument,
      insuranceDocument: updatedVehicle.insuranceDocument,
      branchId: branch._id,
      branchName: branch.name
    });
  }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:licenseNumber
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const { licenseNumber } = req.params;
  const { branchId } = req.query;
  
  if (!branchId) {
    res.status(400);
    throw new Error('Branch ID is required');
  }
  
  const branch = await Branch.findById(branchId);
  
  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }
  
  const vehicleIndex = branch.vehicles.findIndex(v => v.licenseNumber === licenseNumber);
  
  if (vehicleIndex === -1) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  branch.vehicles.splice(vehicleIndex, 1);
  await branch.save();
  
  // Log activity
  await logActivity({
    type: 'vehicle_deleted',
    description: `Vehicle "${licenseNumber}" was deleted from branch "${branch.name}"`,
    entityId: licenseNumber,
    entityName: licenseNumber,
    entityType: 'vehicle'
  });
  
  res.json({ message: 'Vehicle deleted successfully' });
});

module.exports = {
  getBranches,
  addBranch,
  updateBranch,
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
};