const express = require('express');
const router = express.Router();
const { getFormConfig, updateFormConfig } = require('../controllers/formConfig.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/', protect, getFormConfig);
router.put('/', protect, authorize('superadmin'), updateFormConfig);

module.exports = router;
