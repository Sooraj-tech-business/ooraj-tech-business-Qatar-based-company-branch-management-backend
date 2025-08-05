const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String
  },
  doj: {
    type: Date
  },
  qid: {
    type: String
  },
  doe: {
    type: Date
  },
  passportNumber: {
    type: String
  },
  workLocation: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Working'
  },
  bankName: {
    type: String
  },
  bankAccountNumber: {
    type: String
  },
  emergencyContact: {
    type: String
  },
  emergencyContact2: {
    type: String
  },
  nativeAddress: {
    type: String
  },
  medicalCardNumber: {
    type: String
  },
  medicalCardExpiry: {
    type: Date
  },
  visaNumber: {
    type: String
  },
  visaExpiry: {
    type: Date
  },
  visaAddedBranch: {
    type: String
  },
  branch: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  qidExpiry: {
    type: Date
  },
  passportExpiry: {
    type: Date
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  nationality: {
    type: String
  },
  salary: {
    type: Number
  },
  documents: {
    qidCopy: {
      url: String,
      uploadedAt: Date,
      fileName: String
    },
    passportCopy: {
      url: String,
      uploadedAt: Date,
      fileName: String
    },
    visa: {
      url: String,
      uploadedAt: Date,
      fileName: String
    },
    medicalCard: {
      url: String,
      uploadedAt: Date,
      fileName: String
    },
    contract: {
      url: String,
      uploadedAt: Date,
      fileName: String
    },
    profilePicture: {
      url: String,
      uploadedAt: Date,
      fileName: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);