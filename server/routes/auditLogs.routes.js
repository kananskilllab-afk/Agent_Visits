const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogs.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, authorize('superadmin'), getAuditLogs);

module.exports = router;
