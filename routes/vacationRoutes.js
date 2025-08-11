const express = require('express');
const router = express.Router();
const {
  getVacations,
  addVacation,
  updateVacation,
  deleteVacation
} = require('../controllers/vacationController');

router.route('/')
  .get(getVacations)
  .post(addVacation);

router.route('/:id')
  .put(updateVacation)
  .delete(deleteVacation);

module.exports = router;