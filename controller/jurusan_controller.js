const db = require('../db.js');
const bcrypt = require('bcrypt');
const { sendResetPasswordEmail} = require('../services/mailer');
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
// use `prisma` in your application to read and write data in your DB

// const getUsers = async () => {
//     try {
//         const result = await db.query("SELECT id, email, nama_lengkap FROM users ORDER BY nama_lengkap ASC");
//         return result.rows;
//     } catch (error) {
//         console.error('Error fetching user list:', error);
//         throw error;
//     }
// };

// const findUserByEmail = async (email) => {
//     try {
//         const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
//         if (result.rows.length === 0) {
//             return null;
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error finding user by email:', error);
//         throw error;
//     }
// };

// const findUserById = async (userId) => {
//     try {
//         const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
//         if (result.rows.length === 0) {
//             return null;
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error(`Error finding user with id ${userId}:`, error);
//         throw error;
//     }
// };

const createJurusan = async (data) => {
    try {
        const result = await db.query(
            'INSERT INTO jurusan (nama, sejarah_singkat, path_logo, logo) VALUES ($1, $2, $3, $4) RETURNING id',
            [data.nama, data.sejarah_singkat, data.logo_path,  data.logo]
        );

        return { id: result.id, nama : data.nama, body : data.sejarah_singkat, logo:'logo' };
    } catch (error) {
        console.error('Error saat menambahkan user: ', error);
        throw error;
    }
};

const updateJurusan = async (data, id) => {
    try {
      if (!data.logo) {
        delete data.logo
        delete data.path_logo
      }
  
      // Panggil service untuk update data
      await prisma.jurusan.update({
        where : {
            id: id
        }, data : data
      });
  
      return data
    } catch (error) {
      console.warn(error);
        throw error
    }
  };

  const createGaleri = async (data) => {
    try {
        return prisma.$transaction(async (prisma) => {
          for (const item of data.galeri) {
            item.jurusan_id = +data.jurusan_id
            item.nama_file = item.file
            item.path = data.path
            delete item.file
            await prisma.galeri_jurusan.create({data : item})
          }
        })
    } catch (error) {
      throw error;
    }
};


module.exports = {
    createJurusan,
    updateJurusan,
    createGaleri
};
