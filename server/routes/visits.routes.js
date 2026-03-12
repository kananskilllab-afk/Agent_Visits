const express = require('express');
const router = express.Router();
const {
    getVisits,
    createVisit,
    getVisitById,
    updateVisit,
    deleteVisit
} = require('../controllers/visits.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
    .get(getVisits)
    .post(createVisit);

router.route('/:id')
    .get(getVisitById)
    .put(updateVisit)
    .delete(deleteVisit);

module.exports = router;
