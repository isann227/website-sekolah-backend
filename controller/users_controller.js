const db = require('../db.js');
const bcrypt = require('bcrypt');
const { sendResetPasswordEmail} = require('../services/mailer');

const getUsers = async () => {
    try {
        const result = await db.query("SELECT id, email, nama_lengkap FROM users ORDER BY nama_lengkap ASC");
        return result.rows;
    } catch (error) {
        console.error('Error fetching user list:', error);
        throw error;
    }
};

const findUserByEmail = async (email) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

const findUserById = async (userId) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (error) {
        console.error(`Error finding user with id ${userId}:`, error);
        throw error;
    }
};

const addUser = async (nama_lengkap, no_telp, email, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'USER'; 
        const userResult = await db.query(
            'INSERT INTO users (nama_lengkap, no_telp, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [nama_lengkap, no_telp, email, hashedPassword, role]
        );

        if (userResult && userResult.rows.length > 0) {
            const newUserId = userResult.rows[0].id;
            
            const pesertaResult = await db.query(
                'INSERT INTO peserta (id, email, nama_lengkap, no_telp, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [newUserId, email, nama_lengkap, no_telp, role]
            );

            const tanggalDibuat = new Date();
            const auditResult = await db.query(
                'INSERT INTO audit (id, nama_lengkap, role, action_made, tanggal_dibuat) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [newUserId, nama_lengkap, role, `Added User Registered with [id = ${newUserId}].`, tanggalDibuat]
            );

            return { id: newUserId, nama_lengkap, email, role };
        } else {
            throw new Error('Failed to insert user');
        }
    } catch (error) {
        console.error('Error saat menambahkan user: ', error);
        throw error;
    }
};

const addUserByAdmin = async (nama_lengkap, no_telp, email, password, role) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const is_verified = true;
        const result = await db.query(
            'INSERT INTO users (nama_lengkap, no_telp, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [nama_lengkap, no_telp, email, hashedPassword, role, is_verified]
        );

        if (result.rows.length > 0) {
            const newUserId = result.rows[0].id;

            await db.query(
                'INSERT INTO peserta (id, email, no_telp, nama_lengkap, role) VALUES ($1, $2, $3, $4, $5)',
                [newUserId, email, no_telp, nama_lengkap, role]
            );

            await db.query(
                'INSERT INTO audit (id, nama_lengkap, role, action_made) VALUES ($1, $2, $3, $4)',
                [newUserId, nama_lengkap, role, `Pengguna ini dibuatkan akun dari admin dengan (id = ${newUserId}).`]
            );

            return { id: newUserId, nama_lengkap, email, role };
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
    getUsers,
    findUserByEmail,
    findUserById,
    addUser,
    addUserByAdmin,
    getUserById,
    getUserProfile,
    verifikasi,
    updatePassword,
    updatePasswordByAdmin
};
