require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path=require('path');
const twilio = require('twilio');
const patientRoutes = require("./backend/routes/patient_register");
const authRoutes = require("./backend/routes/auth");
const adminRoutes = require("./backend/routes/adminRoutes");
const manageDoctorsRouter = require("./backend/routes/manage-doctors-router");
const supDashboardRoutes = require("./backend/routes/sup_dashboard");
const addDocAdminRouter = require("./backend/routes/add_doc_s_admin");
const doctorAddRoute = require("./backend/routes/doctor-add-router");
const patientStatsBySAdminRoutes = require("./backend/routes/patient_stats_by_s_admin");
const patientAddBySAdminRoutes = require("./backend/routes/patient_add_by_sadmin");
const reportSadminRoutes = require("./backend/routes/report_sadmin"); 
const doctSadminRoutes = require("./backend/routes/doctSadminRoutes");
const sadminArticleRoutes = require("./backend/routes/sadmin_article");
const hosAdminsBySAdminRoutes = require("./backend/routes/hos_adminsbysadmin");
const reportRoutes = require("./backend/routes/reportRoutes");


const PHONE_NUMBER = +919025824967;
const app = express();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
app.use(cors());
app.use(express.json());

// Route mounts
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/reports", reportRoutes);
app.use((err, req, res, next) => {
    res.status(400).json({ message: err.message });
});
app.use("/api/admin", doctSadminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/login", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", manageDoctorsRouter);
app.use("/api/admin", supDashboardRoutes);
app.use("/api/admin", doctorAddRoute);
app.use("/api/admin", patientStatsBySAdminRoutes);
app.use("/api/admin", patientAddBySAdminRoutes);
app.use("/api/admin", reportSadminRoutes);
app.use("/api/admin", sadminArticleRoutes);
app.use("/api/admin", hosAdminsBySAdminRoutes); // Mount new hospitals route
app.use("/api", addDocAdminRouter);
app.post("/voice-call", async (req, res) => {
    const { to } = req.body;

    if (!to) {
        return res.status(400).json({ message: "Phone number is required." });
    }

    const message = "This is an automated call from the tumor detection system."; // Default message


    try {
        const call = await client.calls.create({
            twiml: `<Response><Say>${message}</Say></Response>`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });

        res.json({ message: "Voice call initiated successfully!", call });
    } catch (error) {
        console.error("Twilio Voice Call Error:", error);
        res.status(500).json({ message: "Error making voice call", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));