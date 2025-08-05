const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  addUser, 
  updateUser, 
  deleteUser, 
  loginUser 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/').get(protect, getUsers).post(protect, addUser);
router.route('/:id').get(protect, getUserById).put(protect, updateUser).delete(protect, deleteUser);
router.post('/login', loginUser);

module.exports = router;