const express = require("express");
const db = require("../db/db"); // Import the database connection
const router = express.Router();

// Route to fetch article details using the stored procedure
router.get("/articles", async (req, res) => {
    try {
        const [rows] = await db.query("CALL GetArticleDetails()");
        res.json(rows[0]); // Return the first result set from the stored procedure
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;