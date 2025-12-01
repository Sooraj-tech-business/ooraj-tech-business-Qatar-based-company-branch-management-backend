const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
  type: String,
  number: String,
  expiryDate: Date
});

const vehicleSchema = mongoose.Schema({
  type: String,
  licenseNumber: {
    type: String,
    required: true
  },
  licenseExpiry: Date,
  insuranceExpiry: Date,
  make: String,
  model: String,
  year: Number,
  color: String,
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  },
  licenseDocument: {
    type: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    default: null
  },
  insuranceDocument: {
    type: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    default: null
  }
});

const branchSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: String,
  manager: String,
  contactNumber: String,
  email: String,
  // Company CR
  crNumber: String,
  crExpiry: Date,
  // Ruksa
  ruksaNumber: String,
  ruksaExpiry: Date,
  // Computer Card
  computerCardNumber: String,
  computerCardExpiry: Date,
  // Certification
  certificationNumber: String,
  certificationExpiry: Date,
  // Tax Card
  taxCardNumber: String,
  taxCardExpiry: Date,
  // Baladiya
  baladiyaNumber: String,
  baladiyaExpiry: Date,
  // Bank Details
  bankName: String,
  bankAccountNumber: String,
  ibanNumber: String,
  // Document files
  branchDocuments: {
    crDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    ruksaDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    computerCardDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    certificationDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    taxCardDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    logoDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    letterheadDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    baladiyaDocument: {
      url: String,
      fileName: String,
      uploadedAt: Date
    }
  },
  documents: [documentSchema],
  vehicles: [vehicleSchema],
  assignedUsers: [String],
  zakathPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  shareholders: [{
    name: {
      type: String,
      required: true
    },
    quid: {
      type: String,
      required: true
    },
    sharePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Branch', branchSchema);