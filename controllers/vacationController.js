const Vacation = require('../models/Vacation');
const Employee = require('../models/Employee');
const asyncHandler = require('express-async-handler');

// @desc    Get all vacations
// @route   GET /api/vacations
// @access  Private
const getVacations = asyncHandler(async (req, res) => {
  try {
    const vacations = await Vacation.find({}).sort({ startDate: -1 });
    res.json(vacations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching vacations',
      error: error.message
    });
  }
});

// @desc    Add a new vacation
// @route   POST /api/vacations
// @access  Private
const addVacation = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;

  if (!employeeId || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide employee, start date, and end date');
  }

  // Get employee details
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Determine status based on dates
  const today = new Date();
  let status = 'Upcoming';
  if (today >= start && today <= end) {
    status = 'Active';
  } else if (today > end) {
    status = 'Completed';
  }

  try {
    const vacation = await Vacation.create({
      employeeId,
      employeeName: employee.name,
      startDate,
      endDate,
      totalDays,
      reason,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Vacation added successfully',
      vacation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Failed to add vacation: ${error.message}`
    });
  }
});

// @desc    Update vacation
// @route   PUT /api/vacations/:id
// @access  Private
const updateVacation = asyncHandler(async (req, res) => {
  const { employeeId, startDate, endDate, reason } = req.body;

  if (!employeeId || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide employee, start date, and end date');
  }

  const vacation = await Vacation.findById(req.params.id);
  if (!vacation) {
    res.status(404);
    throw new Error('Vacation not found');
  }

  // Get employee details
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Calculate total days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Determine status based on dates
  const today = new Date();
  let status = 'Upcoming';
  if (today >= start && today <= end) {
    status = 'Active';
  } else if (today > end) {
    status = 'Completed';
  }

  try {
    const updatedVacation = await Vacation.findByIdAndUpdate(
      req.params.id,
      {
        employeeId,
        employeeName: employee.name,
        startDate,
        endDate,
        totalDays,
        reason,
        status
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Vacation updated successfully',
      vacation: updatedVacation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: `Failed to update vacation: ${error.message}`
    });
  }
});

// @desc    Delete vacation
// @route   DELETE /api/vacations/:id
// @access  Private
const deleteVacation = asyncHandler(async (req, res) => {
  const vacation = await Vacation.findById(req.params.id);
  
  if (vacation) {
    await Vacation.findByIdAndDelete(vacation._id);
    res.json({ message: 'Vacation removed' });
  } else {
    res.status(404);
    throw new Error('Vacation not found');
  }
});

module.exports = {
  getVacations,
  addVacation,
  updateVacation,
  deleteVacation
};