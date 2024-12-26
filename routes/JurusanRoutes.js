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
        const addJurusan = await jurusan_controller.createJurusan(req.body)
        res.json({
            statusCode: 201,
            status: 'success',
            message: `Berhasil insert data`,
            data: body,
        });
    } catch (error) {
        console.error('error insert jurusan:', error);
        res.status(500).json({
            statusCode: 500,
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
})

router.patch('/:id', upload.single('logo'), async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body
        const file = req.file;

        if (!body.nama || !body.sejarah_singkat) {
            return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
        }

        if (file) {
            body.logo = file.filename;
            body.path_logo = uploadDir; // Ganti dengan path yang sesuai
        }
        
        const updatedLogsCount = await jurusan_controller.updateJurusan(body, id);
        res.json({
            statusCode: 200,
            status: 'success',
            message: `Update data berhasil`,
            data: body
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
});


router.post('/galeri', upload.any(), async (req, res) => {
    const body = req.body;
    const files = req.files;
  
    try {
      // Validasi file
      if (!files || files.length === 0) {
        return res.status(400).send({
            status: 'failed',
            message: 'Gambar wajib diisi!',
            statusCode: 400,
        });
      }
      console.log(body.galeri);
  
      // Validasi jumlah file
      if (!body.galeri || body.galeri.length !== files.length) {
        return res.status(400).send({
            status: 'failed',
            message: 'Jumlah file tidak sesuai dengan data galeri!',
            statusCode: 400,
        });
      }
  
      const galeri = body.galeri; // Pastikan data galeri dikirim sebagai JSON string
    console.log(galeri);
      // Proses data galeri
      galeri.forEach((item, key) => {
        item.file = files[key].filename;
      });
  
      body.path = uploadDir;
      body.galeri = galeri;
  
      // Simpan data ke database melalui service
      await jurusan_controller.createGaleri(body);
  
      // Kirimkan respons sukses
      return res.status(201).send({
        message: 'Berhasil menyimpan data.',
        statusCode: 201,
        data: body, // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.warn(error);
      return res.status(500).send({
        message: 'Terjadi kesalahan.',
        statusCode: 500,
        error: error.message,
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