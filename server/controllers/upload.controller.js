const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Multer storage configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('photo');

const fs = require('fs');
const path = require('path');

exports.uploadPhoto = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        try {
            // Save file locally to server/uploads
            const fileName = `visit_${uuidv4()}_${Date.now()}.jpg`;
            const uploadPath = path.join(__dirname, '../uploads', fileName);

            // Write the buffer to disk
            await new Promise((resolve, reject) => {
                fs.writeFile(uploadPath, req.file.buffer, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Return the local server URL
            // In a production environment, you would use your domain here
            const host = req.get('host'); // e.g., 'localhost:5000'
            const protocol = req.protocol; // e.g., 'http'
            const fileUrl = `${protocol}://${host}/uploads/${fileName}`;

            res.status(200).json({
                success: true,
                url: fileUrl,
                fileName: fileName
            });
        } catch (error) {
            console.error('Local Upload Error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Upload to local storage failed', 
                error: error.message 
            });
        }
    });
};
