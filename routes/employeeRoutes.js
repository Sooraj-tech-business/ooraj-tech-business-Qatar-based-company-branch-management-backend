const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  getEmployeeById, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Public route for employee self-registration
router.post('/public-register', addEmployee);

// Protected routes
router.route('/').get(protect, getEmployees).post(protect, addEmployee);
router.route('/:id').get(protect, getEmployeeById).put(protect, updateEmployee).delete(protect, deleteEmployee);

module.exports = router;