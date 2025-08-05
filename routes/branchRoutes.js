const express = require('express');
const router = express.Router();
const { 
  getBranches, 
  addBranch, 
  updateBranch
} = require('../controllers/branchController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/').get(getBranches).post(protect, addBranch);
router.route('/:id').put(protect, updateBranch);

module.exports = router;