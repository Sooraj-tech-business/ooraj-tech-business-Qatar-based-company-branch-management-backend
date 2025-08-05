const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { logActivity } = require('./activityController');

// Log MongoDB connection state
console.log('MongoDB connection state:', mongoose.connection.readyState);
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  console.log('Getting all users');
  const users = await User.find({});
  console.log(`Found ${users.length} users`);
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Add a new user
// @route   POST /api/users
// @access  Private
const addUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, branch } = req.body;
  console.log('Adding new user:', email);

  if (!name || !email || !password || !role || !branch) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    branch,
    status: 'Active'
  });

  if (user) {
    console.log('User created successfully:', user._id);
    
    // Log activity
    await logActivity({
      type: 'user_created',
      description: `User ${name} was created`,
      entityId: user._id,
      entityName: name,
      entityType: 'user'
    });
    
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  // Check if ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid user ID format');
  }

  const user = await User.findById(req.params.id);
  
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.branch = req.body.branch || user.branch;
    user.status = req.body.status || user.status;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    // Log activity
    await logActivity({
      type: 'user_updated',
      description: `User ${updatedUser.name} was updated`,
      entityId: updatedUser._id,
      entityName: updatedUser.name,
      entityType: 'user'
    });
    
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    const userName = user.name;
    const userId = user._id;
    
    await User.findByIdAndDelete(user._id);
    
    // Log activity
    await logActivity({
      type: 'user_deleted',
      description: `User ${userName} was deleted`,
      entityId: userId,
      entityName: userName,
      entityType: 'user'
    });
    
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  
  try {
    // Check MongoDB connection
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // Try case-insensitive search
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User password:', user.password);
      console.log('Provided password:', password);
      
      if (password === user.password) {
        // Generate JWT token
        const token = generateToken(user._id);
        
        // Log activity
        await logActivity({
          type: 'login',
          description: `User ${user.name} logged in`,
          user: user._id,
          entityId: user._id,
          entityName: user.name,
          entityType: 'user'
        });
        
        res.json({ 
          success: true, 
          token,
          user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            branch: user.branch,
            status: user.status || 'Active'
          } 
        });
      } else {
        console.log('Password mismatch');
        res.status(401);
        throw new Error('Invalid credentials');
      }
    } else {
      // If user not found, check all collections
      console.log('User not found, checking all collections');
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'abc123', {
    expiresIn: '30d',
  });
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  loginUser
};