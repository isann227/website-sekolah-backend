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

const addJurusan = async (data) => {
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

const addUserByAdmin = async (nama, phone, email, password, role) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const jenis_user =  'operator'
        const result = await db.query(
            'INSERT INTO users (name, phone, email, password, role, jenis_user,email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [nama, phone, email, hashedPassword, role, jenis_user,new Date()]
        );

        if (result.rows.length > 0) {
            const newUserId = result.rows[0].id;
            return { id: newUserId, nama, email, role };
        }

        throw new Error('Failed to add user');
    } catch (error) {
        console.error('Error adding user by admin:', error);
        throw error;
    }
};


const getUserById = async (id) => {
    try {
        const userQuery = 'SELECT id, nama_lengkap, no_telp, email FROM users WHERE id = $1';
        const userResult = await db.query(userQuery, [id]);

        if (userResult.rows.length === 0) {
            return null;
        }

        const user = userResult.rows[0];

        const pesertaQuery = 'SELECT * FROM peserta WHERE id = $1';
        const pesertaResult = await db.query(pesertaQuery, [id]);

        const peserta = pesertaResult.rows.length > 0 ? pesertaResult.rows[0] : null;

        const auditQuery = 'SELECT * FROM audit WHERE id = $1';
        const auditResult = await db.query(auditQuery, [id]);

        const audit = auditResult.rows.length > 0 ? auditResult.rows[0] : null;

        return { user, peserta, audit };
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

const getUserProfile = async (userId) => {
    try {
        const result = await db.query('SELECT nama_lengkap, no_telp, email FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const verifikasi = async (email) => {
    try {
        console.log("Verifying user with email:", email);

        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error('Email not registered.');
        }
        const result = await db.query('UPDATE users SET is_verified = true WHERE email = $1', [email]);
        return result; 
    } catch (error) {
        console.error('Error verifying user:', error);
        throw error;
    }
};

const updatePassword = async (email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING *', 
            [hashedPassword, email]
        );
        
        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};

const updatePasswordByAdmin = async (userId, new_password) => {
    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        const result = await db.query(
            'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email, nama_lengkap',
            [hashedPassword, userId]
        );

        if (result.rows.length === 0) {
            throw new Error('User tidak ditemukan');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error updating password by admin:', error);
        throw error;
    }
};

module.exports = {
    addJurusan,
    addUserByAdmin,
    getUserById,
    getUserProfile,
    verifikasi,
    updatePassword,
    updatePasswordByAdmin,
    updateJurusan
};
