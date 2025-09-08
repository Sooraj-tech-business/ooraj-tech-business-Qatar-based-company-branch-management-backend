const asyncHandler = require('express-async-handler');
const DailyExpenditure = require('../models/DailyExpenditure');
const mongoose = require('mongoose');

// @desc    Get all expenditures
// @route   GET /api/expenditures
// @access  Private
const getExpenditures = asyncHandler(async (req, res) => {
  const { branchId, month, year } = req.query;
  
  let filter = {};
  
  if (branchId) {
    filter.branchId = branchId;
  }
  
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  const expenditures = await DailyExpenditure.find(filter).sort({ date: -1 });
  res.json(expenditures);
});

// @desc    Create new expenditure
// @route   POST /api/expenditures
// @access  Private
const createExpenditure = asyncHandler(async (req, res) => {
  console.log('Received expenses:', req.body.expenses);
  req.body.expenses.forEach((exp, index) => {
    console.log(`Expense ${index}:`, exp);
    console.log(`Type field:`, exp.type);
  });
  
  const expenditure = await DailyExpenditure.create(req.body);
  console.log('Saved expenses:', expenditure.expenses);
  res.status(201).json(expenditure);
});

// @desc    Update expenditure
// @route   PUT /api/expenditures/:id
// @access  Private
const updateExpenditure = asyncHandler(async (req, res) => {
  const expenditure = await DailyExpenditure.findById(req.params.id);

  if (expenditure) {
    console.log('Update - Received expenses:', req.body.expenses);
    req.body.expenses?.forEach((exp, index) => {
      console.log(`Update Expense ${index}:`, exp);
      console.log(`Update Type field:`, exp.type);
    });
    
    Object.assign(expenditure, req.body);
    const updatedExpenditure = await expenditure.save();
    console.log('Update - Saved expenses:', updatedExpenditure.expenses);
    res.json(updatedExpenditure);
  } else {
    res.status(404);
    throw new Error('Expenditure not found');
  }
});

// @desc    Delete expenditure
// @route   DELETE /api/expenditures/:id
// @access  Private
const deleteExpenditure = asyncHandler(async (req, res) => {
  const expenditure = await DailyExpenditure.findById(req.params.id);

  if (expenditure) {
    await DailyExpenditure.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expenditure removed' });
  } else {
    res.status(404);
    throw new Error('Expenditure not found');
  }
});

// @desc    Get expenditure analytics
// @route   GET /api/expenditures/analytics
// @access  Private
const getExpenditureAnalytics = asyncHandler(async (req, res) => {
  const { branchId, month, year } = req.query;
  
  let matchFilter = {};
  
  if (branchId) {
    matchFilter.branchId = new mongoose.Types.ObjectId(branchId);
  }
  
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    matchFilter.date = { $gte: startDate, $lte: endDate };
  }
  
  const analytics = await DailyExpenditure.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: branchId ? '$branchId' : '$branchName',
        totalIncome: { $sum: '$income' },
        totalOnlineDelivery: { $sum: '$totalOnlineDelivery' },
        totalDeliveryMoney: { $sum: '$deliveryMoney' },
        totalExpenses: { $sum: '$totalExpenses' },
        totalEarnings: { $sum: '$earnings' },
        recordCount: { $sum: 1 },
        avgDailyIncome: { $avg: '$income' },
        avgDailyOnlineDelivery: { $avg: '$totalOnlineDelivery' },
        avgDailyDeliveryMoney: { $avg: '$deliveryMoney' },
        avgDailyExpenses: { $avg: '$totalExpenses' },
        branchName: { $first: '$branchName' }
      }
    }
  ]);
  
  res.json(analytics);
});

module.exports = {
  getExpenditures,
  createExpenditure,
  updateExpenditure,
  deleteExpenditure,
  getExpenditureAnalytics
};