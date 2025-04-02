const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

app.post("/send-email", async (req, res) => {
    const { patientName, patientEmail } = req.body;

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Stylish Email Template
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: patientEmail, 
        subject: "Patient Registration Successful",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #007bff; color: #fff; padding: 20px; text-align: center;">
                    <h1>Welcome, ${patientName}!</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Dear ${patientName},</p>
                    <p style="font-size: 16px; color: #333;">Your registration was successful! Thank you for choosing our service.</p>
                    
                    <div style="display: flex; justify-content: center; margin-top: 20px;">
                        <div style="border: 1px solid #007bff; padding: 15px; border-radius: 8px; background-color: #f8f9fa;">
                            <p style="color: #007bff; font-size: 18px; font-weight: bold; text-align: center;">Your Registration Details</p>
                            <p><strong>Name:</strong> ${patientName}</p>
                            <p><strong>Email:</strong> ${patientEmail}</p>
                        </div>
                    </div>

                    <p style="margin-top: 20px; font-size: 16px; color: #555;">If you have any questions, feel free to contact us.</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://your-hospital-website.com" 
                           style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; font-size: 16px; border-radius: 5px;">
                           Visit Our Website
                        </a>
                    </div>
                </div>
                <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #555;">
                    <p>Best Regards,</p>
                    <p><strong>Your Hospital Team</strong></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending email!" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
