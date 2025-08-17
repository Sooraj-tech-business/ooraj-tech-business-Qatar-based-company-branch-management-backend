const asyncHandler = require('express-async-handler');
const TempEmployee = require('../models/TempEmployee');

// @desc    Get all temporary employees
// @route   GET /api/temp-employees
// @access  Private
const getTempEmployees = asyncHandler(async (req, res) => {
  const tempEmployees = await TempEmployee.find({});
  res.json(tempEmployees);
});

// @desc    Create new temporary employee
// @route   POST /api/temp-employees
// @access  Private
const createTempEmployee = asyncHandler(async (req, res) => {
  const tempEmployee = await TempEmployee.create(req.body);
  res.status(201).json(tempEmployee);
});

// @desc    Update temporary employee
// @route   PUT /api/temp-employees/:id
// @access  Private
const updateTempEmployee = asyncHandler(async (req, res) => {
  const tempEmployee = await TempEmployee.findById(req.params.id);

  if (tempEmployee) {
    Object.assign(tempEmployee, req.body);
    const updatedTempEmployee = await tempEmployee.save();
    res.json(updatedTempEmployee);
  } else {
    res.status(404);
    throw new Error('Temporary employee not found');
  }
});

// @desc    Delete temporary employee
// @route   DELETE /api/temp-employees/:id
// @access  Private
const deleteTempEmployee = asyncHandler(async (req, res) => {
  const tempEmployee = await TempEmployee.findById(req.params.id);

  if (tempEmployee) {
    await TempEmployee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Temporary employee removed' });
  } else {
    res.status(404);
    throw new Error('Temporary employee not found');
  }
});

module.exports = {
  getTempEmployees,
  createTempEmployee,
  updateTempEmployee,
  deleteTempEmployee
};