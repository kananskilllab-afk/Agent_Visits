const express = require('express');
const router = express.Router();
const { uploadPhoto } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, uploadPhoto);

module.exports = router;
