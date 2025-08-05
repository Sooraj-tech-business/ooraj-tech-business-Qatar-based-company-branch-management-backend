const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Active'
  }
}, {
  timestamps: true,
  collection: 'users'  // Explicitly set collection name
});

module.exports = mongoose.model('User', userSchema);