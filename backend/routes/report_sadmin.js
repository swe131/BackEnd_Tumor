
// backend/routes/report_sadmin.js
const express = require("express");
const router = express.Router();
const db = require("../db/db"); // Adjust path if needed

router.get("/reports", async (req, res) => {
    try {
        // Execute all stored procedures
        const [completed] = await db.query("CALL ReviewCompletedCount_s_admin()");
        const [progress] = await db.query("CALL CountProgressReviews_s_admin()");
        const [pending] = await db.query("CALL CountPendingReviews_s_admin()");
        const [total] = await db.query("CALL GetReviewCount_s_admin()");
        const [details] = await db.query("CALL GetReviewDetailsbysadmin()");

        // Log raw results for debugging (optional, can remove later)
        console.log("Completed:", JSON.stringify(completed, null, 2));
        console.log("Progress:", JSON.stringify(progress, null, 2));
        console.log("Pending:", JSON.stringify(pending, null, 2));
        console.log("Total:", JSON.stringify(total, null, 2));
        console.log("Details:", JSON.stringify(details, null, 2));

        // Extract counts using the correct column name 'total_reviews'
        const stats = {
            completedCount: completed[0][0].total_reviews || 0,
            progressCount: progress[0][0].total_reviews || 0,
            pendingCount: pending[0][0].total_reviews || 0,
            totalCount: total[0][0].total_reviews || 0,
            reviewDetails: details[0] || [] // Fallback to empty array if no details
        };

        res.json(stats);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;