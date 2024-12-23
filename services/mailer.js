
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'reisyaprasetya12@gmail.com',
    pass: 'rwhybcqokqeqkqri',
  },
});

const sendConfirmationEmail = (to, token) => {
  const verificationLink = `http://localhost:3000/verifikasi?token=${token}`;
  
  const mailOptions = {
    from: 'insanhakimm@gmail.com',
    to,
    subject: 'Konfirmasi Pendaftaran',
    text: `Terima kasih telah mendaftar! Silakan klik tautan berikut untuk mengkonfirmasi pendaftaran Anda: ${verificationLink}`,
  };

  return transporter.sendMail(mailOptions);
};

const sendResetPasswordEmail = async (to, token) => {
  try {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    
    const mailOptions = {
      from: 'insanhakimm@gmail.com',
      to: to,
      subject: 'Reset Password - Walden Global Services',
      text: `
        Anda telah meminta untuk mereset password akun Anda.
        
        Klik tautan berikut untuk mereset password Anda: ${resetLink}
        
        Link ini akan kadaluarsa dalam 1 jam.
        
        Jika Anda tidak meminta reset password, abaikan email ini.
        
        Terima kasih,
        Tim Walden Global Services
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email reset password terkirim:', info.messageId);
    return info;

  } catch (error) {
    console.error('Error mengirim email reset password:', error);
    throw new Error('Gagal mengirim email reset password');
  }
};

module.exports = { 
  sendConfirmationEmail,
  sendResetPasswordEmail 
};
