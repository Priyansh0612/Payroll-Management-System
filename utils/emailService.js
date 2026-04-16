const nodemailer = require('nodemailer');

// Create a transporter using Ethereal Email for testing
// In production, this should be replaced with a real SMTP service (e.g., Gmail, SendGrid)
// and credentials should be loaded from environment variables.
const createTransporter = async () => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    return transporter;
};

const sendPayslipEmail = async (to, employeeName, payDate, netPay) => {
    try {
        const transporter = await createTransporter();

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Payroll System" <payroll@example.com>', // sender address
            to: to, // list of receivers
            subject: `Payslip for ${payDate}`, // Subject line
            text: `Hello ${employeeName},\n\nYour payslip for ${payDate} has been generated.\nNet Pay: $${netPay}\n\nRegards,\nPayroll Team`, // plain text body
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4CAF50;">Payslip Notification</h2>
                    <p>Hello <strong>${employeeName}</strong>,</p>
                    <p>Your payslip for <strong>${payDate}</strong> has been generated.</p>
                    <p style="font-size: 18px;">Net Pay: <strong>$${netPay}</strong></p>
                    <br>
                    <p>Regards,</p>
                    <p>Payroll Team</p>
                </div>
            `, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendPayslipEmail };
