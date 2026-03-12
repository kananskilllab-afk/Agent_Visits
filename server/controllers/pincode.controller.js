const PinCode = require('../models/PinCode');

exports.getAllPinCodes = async (req, res) => {
    try {
        const pinCodes = await PinCode.find({ isActive: true }).sort({ code: 1 });
        res.json({ success: true, count: pinCodes.length, data: pinCodes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPinCode = async (req, res) => {
    try {
        const pinCode = await PinCode.create(req.body);
        res.status(201).json({ success: true, data: pinCode });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.bulkCreatePinCodes = async (req, res) => {
    try {
        const pinCodes = await PinCode.insertMany(req.body.pinCodes);
        res.status(201).json({ success: true, count: pinCodes.length, data: pinCodes });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePinCode = async (req, res) => {
    try {
        const pinCode = await PinCode.findByIdAndDelete(req.params.id);
        if (!pinCode) return res.status(404).json({ success: false, message: 'Pincode not found' });
        res.json({ success: true, message: 'Pincode removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
