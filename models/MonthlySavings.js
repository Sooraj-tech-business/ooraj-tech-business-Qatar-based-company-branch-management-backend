const mongoose = require('mongoose');

const monthlySavingsSchema = mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  savings: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// Create compound index for branch, month, year
monthlySavingsSchema.index({ branchId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySavings', monthlySavingsSchema);