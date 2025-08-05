const express = require('express');
const router = express.Router();
const { getExpiringDocuments, getExpiredDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/expiring').get(protect, getExpiringDocuments);
router.route('/expired').get(protect, getExpiredDocuments);

module.exports = router;