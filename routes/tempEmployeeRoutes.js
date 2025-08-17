const express = require('express');
const router = express.Router();
const {
  getTempEmployees,
  createTempEmployee,
  updateTempEmployee,
  deleteTempEmployee
} = require('../controllers/tempEmployeeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTempEmployees)
  .post(protect, createTempEmployee);

router.route('/:id')
  .put(protect, updateTempEmployee)
  .delete(protect, deleteTempEmployee);

module.exports = router;