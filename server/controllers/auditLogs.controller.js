const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.userId) query.userId = req.query.userId;
        if (req.query.action) query.action = { $regex: req.query.action, $options: 'i' };

        const logs = await AuditLog.find(query)
            .populate('userId', 'name email employeeId')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            pages: Math.ceil(total / limit),
            data: logs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
