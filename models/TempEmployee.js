const mongoose = require('mongoose');

const tempEmployeeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true
  },
  workLocation: {
    type: String,
    required: true
  },
  designation: String,
  doj: Date,
  qid: String,
  qidExpiry: Date,
  passportNumber: String,
  passportExpiry: Date,
  phone: String,
  nationality: String,
  salary: Number,
  medicalCardNumber: String,
  medicalCardExpiry: Date,
  status: {
    type: String,
    enum: ['Working', 'Vacation'],
    default: 'Working'
  },
  documents: {
    qidCopy: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    passportCopy: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    medicalCard: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    workAgreement: {
      url: String,
      fileName: String,
      uploadedAt: Date
    },
    profilePicture: {
      url: String,
      fileName: String,
      uploadedAt: Date
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TempEmployee', tempEmployeeSchema);