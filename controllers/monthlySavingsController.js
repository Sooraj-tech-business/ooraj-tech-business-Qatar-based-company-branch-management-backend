const MonthlySavings = require('../models/MonthlySavings');
const asyncHandler = require('express-async-handler');

// @desc    Get monthly savings for a branch
// @route   GET /api/monthly-savings/:branchId/:month/:year
// @access  Private
const getMonthlySavings = asyncHandler(async (req, res) => {
  const { branchId, month, year } = req.params;
  
  const savings = await MonthlySavings.findOne({
    branchId,
    month: parseInt(month),
    year: parseInt(year)
  });
  
  res.json(savings || { branchId, month: parseInt(month), year: parseInt(year), savings: [] });
});

// @desc    Update monthly savings for a branch
// @route   PUT /api/monthly-savings/:branchId/:month/:year
// @access  Private
const updateMonthlySavings = asyncHandler(async (req, res) => {
  const { branchId, month, year } = req.params;
  const { savings } = req.body;
  
  const updatedSavings = await MonthlySavings.findOneAndUpdate(
    {
      branchId,
      month: parseInt(month),
      year: parseInt(year)
    },
    {
      branchId,
      month: parseInt(month),
      year: parseInt(year),
      savings
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
  
  res.json(updatedSavings);
});

module.exports = {
  getMonthlySavings,
  updateMonthlySavings
};