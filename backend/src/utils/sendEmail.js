const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
    if (transporter) return transporter;

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return transporter;
};

const sendWelcomeEmail = async (to, name) => {
    try {
        const transporter = await getTransporter();

        const info = await transporter.sendMail({
            from: '"E-Commerce Store" <no-reply@ecommerce.com>',
            to,
            subject: 'Welcome to our store!',
            text: `Hi ${name}, welcome to our store! We're glad you're here.`,
            html: `<h2>Hi ${name},</h2><p>Welcome to our store! We're glad you're here.</p>`,
        });

        console.log('Welcome email sent. Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error('Failed to send welcome email:', err.message);
    }
};

module.exports = { sendWelcomeEmail };