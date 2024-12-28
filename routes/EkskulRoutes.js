const express = require('express');
const router = express.Router();
const { ekskul_controller } = require('../controller/index');
const { route } = require('./Users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyUser, SuperAdminOnly } = require('../middleware/AuthUser');


// Ensure the upload directory exists
const uploadDir = 'uploads/ekskul';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/ekskul/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });



router.post('/add',verifyUser, SuperAdminOnly, upload.single('logo'), async (req, res) => {
    try {
        const body = req.body
        file = req.file
        if (!body.nama || !body.sejarah_singkat || !file) {
            return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
        }

        body.logo_path = file.path
        body.logo = file.filename
        const addEkskul = await ekskul_controller.createEkskul(req.body)
        res.json({
            statusCode: 201,
            status: 'success',
            message: `Berhasil insert data`,
            data: body,
        });
    } catch (error) {
        console.error('error insert ekskul:', error);
        res.status(500).json({
            statusCode: 500,
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
})

router.patch('/:id', verifyUser, SuperAdminOnly,upload.single('logo'), async (req, res) => {
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
        
        const updatedLogsCount = await ekskul_controller.updateEkskul(body, id);
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


router.post('/galeri',verifyUser, SuperAdminOnly, upload.any(), async (req, res) => {
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
      await ekskul_controller.createGaleri(body);
  
      // Kirimkan respons sukses
      return res.status(201).send({
        status: 'success',
        message: 'Berhasil menyimpan data.',
        statusCode: 201,
        data: body, // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.warn(error);
      return res.status(500).send({
        status: 'failed',
        message: 'Terjadi kesalahan.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  router.post('/struktur', verifyUser, SuperAdminOnly, upload.any(), async (req, res) => {
    const body = req.body;
    const files = req.files;
  
    try {
      // Validasi file
      if (!files || files.length === 0) {
        return res.status(400).send({
            status : 'failed',
            message: 'Gambar wajib diisi!',
            statusCode: 400,
        });
      }
  
      // Validasi jumlah file
      if (!body.struktur || body.struktur.length !== files.length) {
        return res.status(400).send({
            status : 'failed',
            message: 'Jumlah file tidak sesuai dengan data struktur!',
            statusCode: 400,
        });
      }
  
      const struktur = body.struktur; // Pastikan struktur dikirim sebagai JSON string
  
      // Proses data struktur
      struktur.forEach((item, key) => {
        if (files[key]) {
          item.file = files[key].filename;
        }
      });
  
      body.path = uploadDir;
      body.struktur = struktur;
  
      // Simpan data ke database melalui service
      await ekskul_controller.createStruktur(body);
  
      // Kirimkan respons sukses
      return res.status(201).send({
        status : 'success',
        message: 'Berhasil menyimpan data.',
        statusCode: 201,
        data: body, // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat menyimpan struktur.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  function mappingNullableFile(body, files){
    // Map files to struktur based on fieldname
   const mappedFiles = body.struktur.map((struktur, index) => {
     const matchingFile = files.find(file => file?.fieldname === `struktur[${index}][file]`);
     return matchingFile || null;
   });
   // Process the files and body
   for (let i = 0; i < body.struktur.length; i++) {
     if (mappedFiles[i]) {
       body.struktur[i].file = mappedFiles[i]; 
     } else {
       body.struktur[i].file = null;
     }
   }

   return body
 }


  router.patch('/:id/struktur',verifyUser, SuperAdminOnly, upload.any(), async (req, res) => {
    const id = req.params.id;
    let body = req.body;
    const files = req.files;
  
    try {
      // Mapping file yang null
      body = mappingNullableFile(body, files);
  
      // Parsing data struktur jika dikirim sebagai JSON string
      const struktur = Array.isArray(body.struktur) ? body.struktur : body.struktur;
  
      // Proses struktur
      struktur.forEach((item, key) => {
        if (item.file) {
          item.nama_foto = item.file.filename;
          item.path_foto = uploadDir; // Ganti dengan path yang sesuai
          console.log(`Mengisi file untuk item dengan index ${key}: ${item.file.filename}`);
        }
        delete item.file; // Hapus properti file setelah digunakan
      });
  
      body.struktur = struktur;
  
      // Panggil service untuk update struktur
      await ekskul_controller.updateStruktur(body);
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil menyimpan data.',
        statusCode: 200,
        data:body, // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat mengupdate struktur.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  router.patch('/:id/galeri', verifyUser, SuperAdminOnly, upload.any(), async (req, res) => {
    const id = req.params.id;
    let body = req.body;
    const files = req.files;
  
    try {
      // Mapping file yang null
      body = mappingNullableFile(body, files);
  
      // Parsing data galeri jika dikirim sebagai JSON string
      const galeri = Array.isArray(body.galeri) ? body.galeri :body.galeri;
  
      // Proses galeri
      galeri.forEach((item, key) => {
        if (item.file) {
          item.nama_foto = item.file.filename;
          item.path_foto = uploadDir; // Ganti dengan path yang sesuai
          console.log(`Mengisi file untuk item dengan index ${key}: ${item.file.filename}`);
        }
        delete item.file; // Hapus properti file setelah digunakan
      });
  
      body.galeri = galeri;
  
      // Panggil service untuk update galeri
      await ekskul_controller.updateGaleri(body);
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil menyimpan data.',
        statusCode: 200,
        data: body, // Sesuaikan fungsi ini
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status : 'failed',
        message: 'Terjadi kesalahan saat mengupdate galeri.',
        statusCode: 500,
        error: error.message,
      });
    }
  });

  router.get('/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      // Panggil service untuk mengambil data berdasarkan ID
      const data = await ekskul_controller.findOne(Number(id));
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil mengambil data.',
        statusCode: 200,
        data: data, // Sesuaikan fungsi ini
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
      const data = await ekskul_controller.findAll(
        search !== undefined ? search : null,
        page !== undefined ? parseFloat(page) : 1,
        perpage !== undefined ? parseFloat(perpage) : 10
      );
  
      // Kirim respons sukses
      return res.status(200).send({
        status : 'success',
        message: 'Berhasil mengambil data.',
        statusCode: 200,
        data: data, // Sesuaikan fungsi ini
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
  router.delete('/:id'), verifyUser, SuperAdminOnly, async (req, res) => {
    const { id } = req.params;
  
    try {
      // Panggil service untuk menghapus data
      await ekskul_controller.remove(parseInt(id));
  
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
  }
module.exports = router;