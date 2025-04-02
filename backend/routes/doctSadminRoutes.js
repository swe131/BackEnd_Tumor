const express = require("express");
const router = express.Router();
const db = require("../db/db");

// Route to get total doctors
router.get("/total-doctors", async (req, res) => {
    try {
        const [rows] = await db.query("CALL GetTotalDoctorsbysadmin()");
        res.json({ totalDoctors: rows[0][0].total_count });
    } catch (error) {
        console.error("Error fetching total doctors:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to get active doctors (new procedure needed)
router.get("/active-doctors", async (req, res) => {
    try {
        const [rows] = await db.query("CALL CountActiveDoctorsbysadmin()");
        res.json({ activeDoctors: rows[0][0].Active_Doctors_Count });
    } catch (error) {
        console.error("Error fetching active doctors:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to get pending reviews
router.get("/pending-reviews", async (req, res) => {
    try {
        const [rows] = await db.query("CALL CountPendingReviewsbysadmin()");
        res.json({ pendingReviews: rows[0][0].Pending_Reviews_Count });
    } catch (error) {
        console.error("Error fetching pending reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to get completed reviews
router.get("/completed-reviews", async (req, res) => {
    try {
        const [rows] = await db.query("CALL CountCompletedReviewsbysadmin()");
        res.json({ completedReviews: rows[0][0].Completed_Reviews_Count });
    } catch (error) {
        console.error("Error fetching completed reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route to get doctors with hospital info
router.get("/doctors-with-hospital", async (req, res) => {
    try {
        const [rows] = await db.query("CALL GetDoctorsWithHospitalInfobysadmin()");
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching doctors with hospital info:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;