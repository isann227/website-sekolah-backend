const express = require('express');
const router = express.Router();
const { audit_controller } = require('../controller/index');
const cron = require('node-cron')

router.get('/', async (req, res) => {
    try {
        const logs = await audit_controller.getAuditLogs();
        res.json({
            status: 'success',
            data: logs
        });
    } catch (error) {
        console.error('Error retrieving audit logs:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

router.get('/all', async (req, res) => {
    try {
        const allLogs = await audit_controller.getAllAuditLogs();
        res.json({
            status: 'success',
            data: allLogs
        });
    } catch (error) {
        console.error('Error retrieving all audit logs:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

router.post('/update-status', async (req, res) => {
    const { startDate, endDate } = req.body;
    try {
        const updatedLogsCount = await audit_controller.updateAuditStatus(startDate, endDate);
        res.json({
            status: 'success',
            message: `${updatedLogsCount} audit logs updated to true`,
        });
    } catch (error) {
        console.error('Error updating audit log status:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        const currentDate = new Date();
        await audit_controller.updateAuditStatus(null, currentDate); 
    } catch (error) {
        console.error('Error running cron job for audit log status update:', error);
    }
});

module.exports = router;