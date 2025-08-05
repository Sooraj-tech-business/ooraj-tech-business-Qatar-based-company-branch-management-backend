const Branch = require('../models/Branch');
const asyncHandler = require('express-async-handler');

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
          ...vehicle.toObject(),
          branchId: branch._id,
          branchName: branch.name,
          branchLocation: branch.location
        });
      });
    }
  });
  
  res.status(200).json({
    success: true,
    count: allVehicles.length,
    data: allVehicles
  });
});

// @desc    Add new vehicle to branch
// @route   POST /api/vehicles
// @access  Private
const addVehicle = asyncHandler(async (req, res) => {
  const { branch: branchId, type, licenseNumber, licenseExpiry, insuranceExpiry, make, model, year, color, status, licenseDocument, insuranceDocument } = req.body;
  
  if (!branchId || !licenseNumber) {
    res.status(400);
    throw new Error('Please provide branch ID and license number');
  }
  
  const branch = await Branch.findById(branchId);
  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }
  
  // Check if vehicle already exists in any branch
  const allBranches = await Branch.find({});
  const existingVehicle = allBranches.find(b => 
    b.vehicles.some(v => v.licenseNumber === licenseNumber)
  );
  
  if (existingVehicle) {
    res.status(400);
    throw new Error('Vehicle with this license number already exists');
  }
  
  const vehicleData = {
    type: type || '',
    licenseNumber,
    licenseExpiry: licenseExpiry || null,
    insuranceExpiry: insuranceExpiry || null,
    make: make || '',
    model: model || '',
    year: parseInt(year) || new Date().getFullYear(),
    color: color || '',
    status: status || 'active',
    licenseDocument: licenseDocument || null,
    insuranceDocument: insuranceDocument || null
  };
  
  branch.vehicles.push(vehicleData);
  await branch.save();
  
  const addedVehicle = branch.vehicles[branch.vehicles.length - 1];
  
  res.status(201).json({
    success: true,
    data: {
      ...addedVehicle.toObject(),
      branchId: branch._id,
      branchName: branch.name,
      branchLocation: branch.location
    }
  });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:licenseNumber
// @access  Private
const updateVehicle = asyncHandler(async (req, res) => {
  const { licenseNumber } = req.params;
  const { branch: newBranchId, type, licenseExpiry, insuranceExpiry, make, model, year, color, status, licenseDocument, insuranceDocument } = req.body;
  
  // Find the branch containing the vehicle
  const branches = await Branch.find({});
  let foundBranch = null;
  let vehicleIndex = -1;
  
  for (const branch of branches) {
    const index = branch.vehicles.findIndex(v => v.licenseNumber === licenseNumber);
    if (index !== -1) {
      foundBranch = branch;
      vehicleIndex = index;
      break;
    }
  }
  
  if (!foundBranch) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  const existingVehicle = foundBranch.vehicles[vehicleIndex];
  
  // Update vehicle data
  foundBranch.vehicles[vehicleIndex] = {
    ...existingVehicle.toObject(),
    type: type || existingVehicle.type,
    licenseExpiry: licenseExpiry !== undefined ? licenseExpiry : existingVehicle.licenseExpiry,
    insuranceExpiry: insuranceExpiry !== undefined ? insuranceExpiry : existingVehicle.insuranceExpiry,
    make: make || existingVehicle.make,
    model: model || existingVehicle.model,
    year: year ? parseInt(year) : existingVehicle.year,
    color: color || existingVehicle.color,
    status: status || existingVehicle.status,
    licenseDocument: licenseDocument || existingVehicle.licenseDocument,
    insuranceDocument: insuranceDocument || existingVehicle.insuranceDocument
  };
  
  await foundBranch.save();
  
  res.status(200).json({
    success: true,
    data: {
      ...foundBranch.vehicles[vehicleIndex].toObject(),
      branchId: foundBranch._id,
      branchName: foundBranch.name,
      branchLocation: foundBranch.location
    }
  });
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:licenseNumber
// @access  Private
const deleteVehicle = asyncHandler(async (req, res) => {
  const { licenseNumber } = req.params;
  
  // Find the branch containing the vehicle
  const branches = await Branch.find({});
  let foundBranch = null;
  let vehicleIndex = -1;
  
  for (const branch of branches) {
    const index = branch.vehicles.findIndex(v => v.licenseNumber === licenseNumber);
    if (index !== -1) {
      foundBranch = branch;
      vehicleIndex = index;
      break;
    }
  }
  
  if (!foundBranch) {
    res.status(404);
    throw new Error('Vehicle not found');
  }
  
  foundBranch.vehicles.splice(vehicleIndex, 1);
  await foundBranch.save();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
};