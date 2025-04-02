const express = require("express");
const db = require("../db/db"); // Ensure this exports a promise-based connection/pool
const bcrypt = require("bcrypt");

const router = express.Router();

// Generic Login Handler Function (Promise-based)
const handleLogin = async (req, res, userType, storedProcedure) => {
    console.log(`Handling login for ${userType}`);

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    const query = `CALL ${storedProcedure}(?)`;
    console.log(`Executing query: ${query} with email: ${email}`);

    try {
        const [results] = await db.query(query, [email]);

        // Check if query returned data
        if (!results || !results[0] || results[0].length === 0) {
            console.error("User not found or no password returned");
            return res.status(401).json({ error: "Invalid email or password" });
        }
        console.log("Query results:", results);

        // Extract the password from the result
        const userData = results[0][0];
        const storedPassword = userData?.password || userData?.Hashed_Password;
        console.log(`Retrieved password from DB: ${storedPassword}`);

        if (!storedPassword) {
            console.error("Error: Password is missing or undefined in DB.");
            return res.status(500).json({ error: "Server error: Missing password." });
        }

        // Since passwords are in plaintext, use direct comparison
        if (password === storedPassword) {
            console.log("Login successful!");
            return res.json({
                success: true,
                user: {
                    email: email,
                    role: userType
                }
            });
        } else {
            console.log("Invalid password.");
            return res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
};

// Routes for each user type
router.post("/patient", (req, res) => handleLogin(req, res, "patient", "GetPatientPasswordByEmail"));
router.post("/doctor", (req, res) => handleLogin(req, res, "doctor", "GetDoctorPasswordByEmail"));
router.post("/Hospitaladmin", (req, res) => handleLogin(req, res, "Hospital_admin", "GetAdminPasswordByEmail"));
router.post("/Owner", (req, res) => handleLogin(req, res, "owner", "GetHospitalPasswordByEmail"));
router.post("/Super_admin", (req, res) => handleLogin(req, res, "SuperAdmin", "GetSuperAdminPasswordByEmail"));

module.exports = router;