const express = require('express');
const router = express.Router();
const { audit_controller, jurusan_controller } = require('../controller/index');
const cron = require('node-cron');
const { route } = require('./Users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Ensure the upload directory exists
const uploadDir = 'uploads/jurusan';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/jurusan/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });


// router.get('/', async (req, res) => {
//     try {
//         const logs = await audit_controller.getAuditLogs();
//         res.json({
//             status: 'success',
//             data: logs
//         });
//     } catch (error) {
//         console.error('Error retrieving audit logs:', error);
//         res.status(500).json({
//             status: 'failed',
//             message: 'Internal Server Error',
//             error: error.message
//         });
//     }
// });

// router.get('/all', async (req, res) => {
//     try {
//         const allLogs = await audit_controller.getAllAuditLogs();
//         res.json({
//             status: 'success',
//             data: allLogs
//         });
//     } catch (error) {
//         console.error('Error retrieving all audit logs:', error);
//         res.status(500).json({
//             status: 'failed',
//             message: 'Internal Server Error',
//             error: error.message
//         });
//     }
// });

router.post('/add',  upload.single('logo'), async (req, res) => {
    try {
        const body = req.body
        file = req.file
        if (!body.nama || !body.sejarah_singkat || !file) {
            return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
        }

        body.logo_path = file.path
        body.logo = file.filename
        const addJurusan = await jurusan_controller.addJurusan(req.body)
        res.json({
            status: 'success',
            message: `Berhasil insert data`,
            data: body,
        });
    } catch (error) {
        console.error('error insert jurusan:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
})

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