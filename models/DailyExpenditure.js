const mongoose = require('mongoose');

const expenditureItemSchema = mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['NORMAL EXPENSE', 'GENERAL EXPENSE'],
    default: 'NORMAL EXPENSE'
  },
  description: String
});

const onlineDeliverySchema = mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['Talabat', 'Keeta', 'Snoonu', 'ATM']
  },
  amount: {
    type: Number,
    required: true
  },
  description: String
});



const dailyExpenditureSchema = mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  branchName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  income: {
    type: Number,
    required: true,
    default: 0
  },
  onlineDeliveries: [onlineDeliverySchema],
  totalOnlineDelivery: {
    type: Number,
    default: 0
  },
  deliveryMoney: {
    type: Number,
    default: 0
  },
  expenses: [expenditureItemSchema],
  totalExpenses: {
    type: Number,
    required: true,
    default: 0
  },
  earnings: {
    type: Number,
    required: true,
    default: 0
  },
  submittedBy: {
    type: String,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Calculate totals before saving
dailyExpenditureSchema.pre('save', function(next) {
  this.totalExpenses = this.expenses.reduce((total, expense) => total + expense.amount, 0);
  this.totalOnlineDelivery = this.onlineDeliveries.reduce((total, delivery) => total + delivery.amount, 0);
  this.earnings = this.income - this.totalExpenses;
  next();
});

module.exports = mongoose.model('DailyExpenditure', dailyExpenditureSchema);