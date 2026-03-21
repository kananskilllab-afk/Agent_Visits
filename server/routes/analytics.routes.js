const express = require('express');
const router = express.Router();
const { getSummary, getUserPerformance, getDetailedAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/summary',   getSummary);
router.get('/performance', authorize('admin', 'superadmin'), getUserPerformance);
router.get('/detailed',    authorize('admin', 'superadmin'), getDetailedAnalytics);

module.exports = router;
