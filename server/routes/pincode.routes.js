const express = require('express');
const router = express.Router();
const { getAllPinCodes, createPinCode, bulkCreatePinCodes, deletePinCode } = require('../controllers/pincode.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', getAllPinCodes);

// Admin/Superadmin only for management
router.post('/', authorize('admin', 'superadmin'), createPinCode);
router.post('/bulk', authorize('admin', 'superadmin'), bulkCreatePinCodes);
router.delete('/:id', authorize('admin', 'superadmin'), deletePinCode);

module.exports = router;
