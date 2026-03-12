const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
        // We only log successful mutations (POST, PUT, DELETE)
        if (['POST', 'PUT', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
            const logEntry = {
                userId: req.user ? req.user._id : null,
                action: `${req.method}_${req.originalUrl.split('/')[2].toUpperCase()}`,
                targetId: req.params.id || null, // Best effort for ID
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                details: {
                    path: req.originalUrl,
                    body: req.method === 'DELETE' ? null : req.body, // Be careful with sensitive data if needed
                    statusCode: res.statusCode
                },
                timestamp: new Date()
            };

            // Special handling for some routes to make action name cleaner
            if (req.originalUrl.includes('/auth/login')) logEntry.action = 'LOGIN';
            if (req.originalUrl.includes('/auth/logout')) logEntry.action = 'LOGOUT';

            AuditLog.create(logEntry).catch(err => console.error('Audit Log Error:', err));
        }

        originalSend.call(this, data);
    };

    next();
};

module.exports = auditLogger;
