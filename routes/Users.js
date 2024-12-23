const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyUser, SuperAdminOnly } = require('../middleware/AuthUser');
const { users_controller } = require('../controller/index');
const { sendConfirmationEmail, sendResetPasswordEmail } = require('../services/mailer');
const { createToken, verifyToken } = require('../controller/token_controller');


router.get('/', verifyUser, async (req, res) => {
    try {
        
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.post('/register', async (req, res) => {
    const { nama_lengkap, no_telp, email, password } = req.body;

    if (!nama_lengkap || !no_telp || !email || !password) {
        return res.status(400).json({ status: 'failed', error: 'Semua field harus diisi' });
    }

    try {
        const existingUser = await users_controller.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ status: 'failed', error: 'Email sudah terdaftar' });
        }

        const newUser = await users_controller.addUser(nama_lengkap, no_telp, email, password);
        const token = await createToken(email); 
        await sendConfirmationEmail(email, token); 

        res.status(201).json({ status: 'success', data: { user: newUser } });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.post('/add-by-admin', verifyUser, SuperAdminOnly, async (req, res) => {
    const { nama_lengkap, no_telp, email, password, role, is_verified = true } = req.body;

    if (!nama_lengkap || !no_telp || !email || !password || !role ) {
        return res.status(400).json({ status: 'failed', error: 'All fields are required' });
    }

    if (!['HR', 'INTERVIEWER', 'USER'].includes(role)) {
        return res.status(400).json({ status: 'failed', error: 'Invalid role' });
    }

    try {
        const existingUser = await users_controller.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ status: 'failed', error: 'Email already registered' });
        }

        const newUser = await users_controller.addUserByAdmin(nama_lengkap, no_telp, email, password, role, is_verified);
        res.status(201).json({ status: 'success', data: { user: newUser } });
    } catch (error) {
        console.error('Error adding user by admin:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.get('/:id', verifyUser, async (req, res) => {
    try {
        const user = await users_controller.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'failed', error: 'User tidak ditemukan' });
        }
        res.json({ status: 'success', data: user });
    } catch (error) {
        console.error(`Error fetching user with id ${req.params.id}:`, error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.post('/linkReset', async (req, res) => {
    try {
        const user = await users_controller.findUserByEmail(req.body.email);
        if (!user) {
            return res.status(404).json({ status: 'failed', error: 'User tidak ditemukan' });
        }
        
        const token = await createToken(req.body.email);
        await sendResetPasswordEmail(req.body.email, token);
        
        res.json({ status: 'success', message: 'Reset password link telah dikirim' });
    } catch (error) {
        console.error('Error sending password reset link:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.put('/reset', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ 
                status: 'failed', 
                error: 'Token dan password harus diisi' 
            });
        }

        // Verify token and get email
        const email = await verifyToken(token);
        if (!email) {
            return res.status(401).json({ 
                status: 'failed', 
                error: 'Token tidak valid atau kadaluarsa' 
            });
        }

        const updatedUser = await users_controller.updatePassword(email, password);
        
        res.json({ 
            status: 'success', 
            message: 'Password berhasil diperbarui'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.put('/resetByAdmin/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { new_password } = req.body;

        if (!userId || !new_password) {
            return res.status(400).json({
                status: 'failed',
                error: 'ID user dan password baru harus diisi'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                status: 'failed',
                error: 'Password harus minimal 6 karakter'
            });
        }

        const updatedUser = await users_controller.updatePasswordByAdmin(userId, new_password);

        res.json({
            status: 'success',
            message: 'Password berhasil direset',
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                nama_lengkap: updatedUser.nama_lengkap
            }
        });

    } catch (error) {
        console.error('Error in reset password by admin:', error);
        
        // Handle specific errors
        if (error.message === 'User tidak ditemukan') {
            return res.status(404).json({
                status: 'failed',
                error: error.message
            });
        }

        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message
        });
    }
});

module.exports = router;
