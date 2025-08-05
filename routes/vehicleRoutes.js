const express = require('express');
const router = express.Router();
const { 
  getAllVehicles, 
  addVehicle, 
  updateVehicle, 
  deleteVehicle 
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.route('/')
  .get(protect, getAllVehicles)
  .post(protect, addVehicle);

router.route('/:licenseNumber')
  .put(protect, updateVehicle)
  .delete(protect, deleteVehicle);

module.exports = router;