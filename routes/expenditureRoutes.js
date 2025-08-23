const express = require('express');
const router = express.Router();
const {
  getExpenditures,
  createExpenditure,
  updateExpenditure,
  deleteExpenditure,
  getExpenditureAnalytics
} = require('../controllers/expenditureController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getExpenditures)
  .post(protect, createExpenditure);

router.route('/analytics')
  .get(protect, getExpenditureAnalytics);

router.route('/:id')
  .put(protect, updateExpenditure)
  .delete(protect, deleteExpenditure);

module.exports = router;