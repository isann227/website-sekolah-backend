const express = require('express');
const router = express.Router();
const { visimisi_controller } = require('../controller/index');
const { route } = require('./Users');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyUser, SuperAdminOnly } = require('../middleware/AuthUser');


function convertBigIntToNumber(data) {
  return JSON.parse(JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' || value === 'number' || value === 'int'
      ? value.toString()
      : value // return everything else unchanged
  ));
}

router.post('/', verifyUser, SuperAdminOnly,async (req, res) => {
    try {
        const body = req.body

        if (!body.visi || !body.misi) {
            return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
        }
        await visimisi_controller.updateVisimisi(body);
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


router.get('/', async (req, res) => {
  try {
    
      const data = await visimisi_controller.findOne();
      console.log(data)
      res.json({
          statusCode: 200,
          status: 'success',
          message: `Update data berhasil`,
          data: convertBigIntToNumber(data)
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

module.exports = router;