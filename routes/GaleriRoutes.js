const express = require('express');
const router = express.Router();
const { galeri_controller } = require('../controller/index');
const cron = require('node-cron');
const { route } = require('./Users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyUser, SuperAdminOnly } = require('../middleware/AuthUser');


// Ensure the upload directory exists
const uploadDir = 'uploads/galeri';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/galeri/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

router.post('/add',verifyUser, SuperAdminOnly, upload.single('image'), async (req, res) => {
    try {
        const body = req.body
        file = req.file
        if (!body.judul || !file) {
            return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
        }

        body.path = file.path
        body.nama_file = file.filename
        await galeri_controller.create(req.body)
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

  router.patch('/:id', verifyUser, SuperAdminOnly,upload.single('image'), async (req, res) => {
      try {
          const { id } = req.params;
          const body = req.body
          const file = req.file;

          if (!body.judul) {
              return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
          }

          if (file) {
              body.path = file.path
              body.nama_file = file.filename
          }
          
          await galeri_controller.update(body, id);
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

  function convertBigIntToNumber(data) {
    return JSON.parse(JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' || value === 'number' || value === 'int'
        ? value.toString()
        : value // return everything else unchanged
    ));
  }

  router.get('/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      // Panggil service untuk mengambil data berdasarkan ID
      const data = await galeri_controller.findOne(Number(id));
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil mengambil data.',
        statusCode: 200,
        data: convertBigIntToNumber(data), // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat mengambil data.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  router.get('/', async (req, res) => {
    try {
      // Ambil query parameters dari request
      const { search, page, perpage } = req.query;
  
      // Panggil service untuk mengambil semua data
      const data = await galeri_controller.findAll(
        search !== undefined ? search : null,
        page !== undefined ? parseFloat(page) : 1,
        perpage !== undefined ? parseFloat(perpage) : 10
      );
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil mengambil data.',
        statusCode: 200,
        data: convertBigIntToNumber(data), // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat mengambil data.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  // Endpoint DELETE untuk menghapus data
  router.delete('/:id', verifyUser, SuperAdminOnly, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Panggil service untuk menghapus data
      await galeri_controller.remove(parseInt(id));
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil menghapus data.',
        statusCode: 200,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat menghapus data.',
        statusCode: 500,
        error: error.message,
      });
    }
  })
<<<<<<< Tabnine <<<<<<<
  /**//+
   * Deletes a galeri item by its ID.//+
   *//+
   * @param {object} req - The Express request object.//+
   * @param {object} res - The Express response object.//+
   * @param {string} req.params.id - The ID of the galeri item to delete.//+
   * @param {function} verifyUser - Middleware function to verify user authentication.//+
   * @param {function} SuperAdminOnly - Middleware function to check if the user is a super admin.//+
   * @param {function} galeri_controller.remove - Service function to remove a galeri item.//+
   *//+
   * @returns {object} - The Express response object with status code and message.//+
   * @throws Will throw an error if the deletion fails.//+
   *///+
  router.delete('/:id', verifyUser, SuperAdminOnly, async (req, res) => {//+
    const { id } = req.params;//+
  //+
    try {//+
      // Panggil service untuk menghapus data//+
      await galeri_controller.remove(parseInt(id));//+
  //+
      // Kirim respons sukses//+
      return res.status(200).send({//+
        status: 'success',//+
        message: 'Berhasil menghapus data.',//+
        statusCode: 200,//+
      });//+
    } catch (error) {//+
      console.error(error);//+
      return res.status(500).send({//+
        status: 'failed',//+
        message: 'Terjadi kesalahan saat menghapus data.',//+
        statusCode: 500,//+
        error: error.message,//+
      });//+
    }//+
  });//+
>>>>>>> Tabnine >>>>>>>// {"conversationId":"be02a1ea-93e4-474d-99b4-3432043aa770","source":"instruct"}
module.exports = router;