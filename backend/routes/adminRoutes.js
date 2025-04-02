const express = require("express");
const db = require("../db/db"); // Ensure this exports a promise-based pool

const router = express.Router();

// Route to get total active doctors by admin email
router.post("/doctors/count", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetActiveDoctorsByAdminEmail(?, @doctor_count); SELECT @doctor_count AS ActiveDoctorCount;`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[1] || results[1].length === 0) {
            return res.status(404).json({ success: false, error: "No doctors found" });
        }
        const totalDoctors = results[1][0].ActiveDoctorCount || 0;
        res.json({ success: true, totalDoctors });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

// Route to get total patients by admin email
router.post("/patients/count", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetPatientCountByAdminEmail(?, @patient_count); SELECT @patient_count AS PatientCount;`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[1] || results[1].length === 0) {
            return res.status(404).json({ success: false, error: "No patients found" });
        }
        const totalPatients = results[1][0].PatientCount || 0;
        res.json({ success: true, totalPatients });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

// Route to get total pending reviews by admin email
router.post("/reviews/pending/count", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetPendingReviewsByAdminEmail(?)`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[0] || results[0].length === 0) {
            return res.status(404).json({ success: false, error: "No pending reviews found" });
        }
        const totalPendingReviews = results[0][0].PendingReviewCount || 0;
        res.json({ success: true, totalPendingReviews });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

// Route to get total patients with reviews
router.post("/patients/reviews/count", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetPatientsWithReviewsByAdminEmail(?, @patients_with_reviews_count); SELECT @patients_with_reviews_count AS PatientsWithReviewsCount;`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[1] || results[1].length === 0) {
            return res.status(404).json({ success: false, error: "No patients with reviews found" });
        }
        const totalScansUploaded = results[1][0].PatientsWithReviewsCount || 0;
        res.json({ success: true, totalScansUploaded });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

// Route to get patient-doctor-review details
router.post("/patients/details", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetPatientDoctorReviewDetailsByAdminEmail(?)`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[0] || results[0].length === 0) {
            return res.status(404).json({ success: false, error: "No patient details found" });
        }
        res.json({ success: true, patientDetails: results[0] });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

// Route to get doctor review stats
router.post("/doctors/review-stats", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email is required" });

    const query = `CALL GetDoctorReviewStatsByAdminEmail(?)`;
    try {
        const [results] = await db.query(query, [email]);
        console.log("Raw results:", results);
        if (!results || !results[0] || results[0].length === 0) {
            return res.status(404).json({ success: false, error: "No doctor review stats found" });
        }
        res.json({ success: true, doctorStats: results[0] });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error" });
    }
});

module.exports = router;