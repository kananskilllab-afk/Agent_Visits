const mongoose = require('mongoose');

const pinCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    region: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// code already indexed via unique: true above
pinCodeSchema.index({ city: 1 });
pinCodeSchema.index({ isActive: 1 });

module.exports = mongoose.model('PinCode', pinCodeSchema);
