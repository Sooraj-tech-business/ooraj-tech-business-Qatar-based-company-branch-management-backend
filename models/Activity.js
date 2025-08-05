const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['user_created', 'user_updated', 'user_deleted', 'employee_created', 'employee_updated', 'employee_deleted', 'branch_created', 'branch_updated', 'branch_deleted', 'vehicle_added', 'vehicle_updated', 'vehicle_deleted', 'login']
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entityId: {
    type: String
  },
  entityName: {
    type: String
  },
  entityType: {
    type: String,
    enum: ['user', 'employee', 'branch', 'vehicle']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);