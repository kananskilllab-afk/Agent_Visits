const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true // 'LOGIN', 'VISIT_SUBMIT', 'VISIT_EDIT', 'USER_CREATE', etc.
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    ipAddress: String,
    userAgent: String,
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
