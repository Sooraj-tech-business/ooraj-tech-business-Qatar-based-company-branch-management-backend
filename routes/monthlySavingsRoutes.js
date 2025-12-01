const express = require('express');
const router = express.Router();
const { getMonthlySavings, updateMonthlySavings } = require('../controllers/monthlySavingsController');

router.route('/:branchId/:month/:year')
  .get(getMonthlySavings)
  .put(updateMonthlySavings);

module.exports = router;