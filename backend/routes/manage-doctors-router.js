const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.post("/doctors/stats", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
    }

    const queries = `
        SET @total_doctors = 0;
        CALL nomoretumor1.GetTotalDoctorsByAdminEmail(?, @total_doctors);
        SELECT @total_doctors AS totalDoctors;

        SET @doctor_count = 0;
        CALL nomoretumor1.GetActiveDoctorsByAdminEmail(?, @doctor_count);
        SELECT @doctor_count AS activeDoctors;

        CALL nomoretumor1.GetPendingReviewsByAdminEmail(?);

        SET @completed_reviews = 0;
        CALL nomoretumor1.GetCompletedReviewsByAdminEmail(?, @completed_reviews);
        SELECT @completed_reviews AS completedReviews;

        CALL nomoretumor1.GetDoctorsListByAdminEmail(?);
    `;

    try {
        const [results] = await db.query(queries, [email, email, email, email, email]);
        console.log("Raw query results:", JSON.stringify(results, null, 2));

        // Extract data with explicit checks
        const totalDoctors = results[2]?.[0]?.totalDoctors || 0;
        const activeDoctors = results[5]?.[0]?.activeDoctors || 0;
        const pendingReviews = results[6]?.[0]?.PendingReviewCount || 0;
        const completedReviews = results[10]?.[0]?.completedReviews || 0; // Fixed index
        const doctorsList = Array.isArray(results[11]) ? results[11] : []; // Fixed index

        // Construct response object
        const responseData = {
            success: true,
            data: {
                totalDoctors,
                activeDoctors,
                pendingReviews,
                completedReviews,
                doctorsList
            }
        };

        console.log("Response sent to frontend:", JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, error: "Database error occurred: " + err.message });
    }
});

module.exports = router;