const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require('bcrypt');
const { users_controller, token_controller, audit_controller } = require('../controller/index');
const { sendConfirmationEmail } = require('../services/mailer');
const { createToken } = require('../controller/token_controller');

// Function to log action in the audit table
const logAudit = async (userId, role, action, nama_lengkap) => {
    try {
        await audit_controller.addAuditLog(userId, role, action, nama_lengkap);
    } catch (error) {
        console.error('Error logging audit action:', error);
    }
};

router.get('/seed-admin', async (req, res) => {
    try {
        const newUser = await users_controller.addUserByAdmin('lathiif aji santhosho', 81904597977, 'ajisanthoshol@gmail.com', 'initesting', 'SUPER ADMIN', true);
        res.json({ status: 'success', data: newUser });
    } catch (error) {
        console.error(`Error fetching user with id ${req.params.id}:`, error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});


router.get('/verifikasi', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Token is required.');
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
        await users_controller.verifikasi(decoded.email);

        res.send('Email verified successfully!');
    } catch (error) {
        console.error("Token is invalid or expired:", error);
        res.status(400).send('Token is invalid or expired.');
    }
});

router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ status: 'failed', error: 'Email harus diisi' });
    }

    try {
        const existingUser = await users_controller.findUserByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ status: 'failed', error: 'Email tidak terdaftar' });
        }

        const token = await createToken(email);
        await sendConfirmationEmail(email, token);
        res.status(200).json({ status: 'success', message: 'Email verifikasi telah dikirim ulang' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ status: 'failed', message: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await users_controller.findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ status: 'failed', error: 'Akun belum terdaftar' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ status: 'failed', error: 'Email atau password salah' });
        }

        if (!user.email_verified_at) {
            return res.status(403).json({ status: 'failed', error: 'Akun belum terverifikasi. Silakan verifikasi email Anda.' });
        }

        req.session.userId = user.id; 
        req.session.userRole = user.role;
        const token = await token_controller.createToken(email);

        // await logAudit(user.id, user.role, 'Pengguna ini memasuki sistem.', user.nama_lengkap);
        res.json({
            status: 'success',
            message: 'Login berhasil',
            data: { id: user.id, email: user.email, role: user.role, nama_lengkap: user.nama_lengkap },
            token
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.delete('/logout', async (req, res) => {
    try {
        const userId = req.session.userId; 

        if (!userId) {
            res.status(401).json({ status: 'failed', error: 'No session found' });
            return;
        }

        const user = await users_controller.findUserById(userId);

        if (!user) {
            res.status(404).json({ status: 'failed', error: 'User tidak ditemukan' });
            return;
        }

        await logAudit(user.id, user.role, 'Pengguna ini keluar dari sistem.', user.nama_lengkap);

        req.session.destroy((error) => {
            if (error) {
                console.error("Error during logout:", error);
                throw error;
            } else {
                res.json({ status: 'success', message: 'Logout berhasil' });
            }
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error.message,
        });
    }
});

router.get('/check', async (req, res) => {
    try {
        if (!req.session.userId) {
            console.error("No session found for user"); 
            return res.status(401).json({
                status: 'failed',
                error: 'Session tidak ada, mohon login ke akun anda',
            });
        }

        const user = await users_controller.findUserById(req.session.userId);

        if (!user) {
            console.error("User not found for session ID:", req.session.userId); 
            res.status(404).json({ status: 404, error: 'User tidak ditemukan' });
            return;
        }

        res.json({
            status: 'success',
            message: 'User berhasil ditemukan',
            data: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error("Error during session check:", error); 
        res.status(500).json({
            status: 'failed',
            message: 'Internal Server Error',
            error: error,
        });
    }
});

module.exports = router;
