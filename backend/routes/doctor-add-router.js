const express = require("express");
const db = require("../db/db");

const router = express.Router();

router.post("/doctors/add", async (req, res) => {
    const { email, doc_email, experience, password, fullName, specialist } = req.body;

    // Validate required fields
    if (!email || !doc_email || !experience || !password) {
        return res.status(400).json({ 
            success: false, 
            error: "Admin email, doctor email, experience, and password are required" 
        });
    }

    // Additional validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(doc_email)) {
        return res.status(400).json({ success: false, error: "Invalid doctor email format" });
    }
    if (isNaN(experience) || experience < 0) {
        return res.status(400).json({ success: false, error: "Experience must be a non-negative number" });
    }

    try {
        // Check if doctor email already exists
        const checkEmailQuery = `SELECT doc_email FROM doctors WHERE doc_email = ?`;
        const [emailCheck] = await db.query(checkEmailQuery, [doc_email]);
        if (emailCheck.length > 0) {
            return res.status(409).json({ success: false, error: "Doctor email already exists" });
        }

        // Fetch hos_id from Hospital_admin
        const getHosIdQuery = `SELECT hos_id FROM Hospital_admin WHERE Admin_email = ? LIMIT 1`;
        const [adminResults] = await db.query(getHosIdQuery, [email]);

        if (!adminResults || adminResults.length === 0) {
            return res.status(404).json({ success: false, error: "Admin email not found" });
        }

        const hos_id = adminResults[0].hos_id;
        console.log(`Fetched hos_id: ${hos_id} for admin email: ${email}`);

        // Use the plaintext password directly (no hashing)
        const plainPassword = password;

        // Insert doctor into doctors table
        const insertQuery = `
            INSERT INTO doctors (doc_email, experience, password, doc_name, specialist, hos_id, isActive)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `;
        const values = [doc_email, experience, plainPassword, fullName || null, specialist || null, hos_id];

        const [insertResult] = await db.query(insertQuery, values);
        console.log(`Doctor added with doc_id: ${insertResult.insertId}`);

        res.json({ 
            success: true, 
            message: "Doctor added successfully", 
            doc_id: insertResult.insertId 
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
            success: false, 
            error: `Database error: ${err.message}` 
        });
    }
});

module.exports = router;