const express = require('express');
const router = express.Router();
const { exportXlsx, exportPdf } = require('../controllers/reports.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/export/xlsx', authorize('admin', 'superadmin'), exportXlsx);
router.get('/export/pdf/:id', exportPdf);

module.exports = router;
