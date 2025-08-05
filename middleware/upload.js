const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.CUSTOM_REGION,
  credentials: {
    accessKeyId: process.env.CUSTOM_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUSTOM_SECRET_ACCESS_KEY,
  },
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.CUSTOM_S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const employeeId = req.params.employeeId || Date.now();
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `employees/${employeeId}/${file.fieldname}-${Date.now()}.${fileExtension}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

module.exports = upload;