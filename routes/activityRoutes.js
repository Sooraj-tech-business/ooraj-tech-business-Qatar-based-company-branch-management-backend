const express = require('express');
const router = express.Router();
const { getActivities, addActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/').get(protect, getActivities).post(protect, addActivity);

module.exports = router;