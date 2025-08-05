const Activity = require('../models/Activity');
const asyncHandler = require('express-async-handler');

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private
const getActivities = asyncHandler(async (req, res) => {
  console.log('Getting recent activities');
  
  try {
    // Get the most recent 20 activities
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name email');
    
    console.log(`Found ${activities.length} activities`);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching activities',
      error: error.message
    });
  }
});

// @desc    Add a new activity
// @route   POST /api/activities
// @access  Private
const addActivity = asyncHandler(async (req, res) => {
  const { type, description, user, entityId, entityName, entityType } = req.body;

  if (!type || !description) {
    res.status(400);
    throw new Error('Please provide activity type and description');
  }

  try {
    const activity = await Activity.create({
      type,
      description,
      user,
      entityId,
      entityName,
      entityType
    });
    
    console.log('Activity created:', activity);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400);
    throw new Error(`Failed to create activity: ${error.message}`);
  }
});

// Helper function to log activity (can be used from other controllers)
const logActivity = async (activityData) => {
  try {
    const activity = await Activity.create(activityData);
    console.log('Activity logged:', activity);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

module.exports = {
  getActivities,
  addActivity,
  logActivity
};