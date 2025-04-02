const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.post("/register", async (req, res) => {
    const { pat_name, pat_age, hos_name, medical_id, phone_number, pat_password, email } = req.body;

    if (!pat_name || !pat_age || !hos_name || !medical_id || !phone_number || !pat_password || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "CALL InsertPatients(?, ?, ?, ?, ?, ?, ?)";
    const values = [pat_name, pat_age, hos_name, medical_id, phone_number, pat_password, email];

    try {
        const [result] = await db.query(query, values);
        res.json({ message: "Patient registered successfully", result });
    } catch (err) {
        console.error("Error inserting patient:", err);
        return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
});

router.get("/hospitals", async (req, res) => {
    const query = "SELECT hos_name FROM hospital";

    try {
        const [results] = await db.query(query);
        res.json(results);
    } catch (err) {
        console.error("Error fetching hospitals:", err);
        return res.status(500).json({ error: err.sqlMessage || "Database error" });
    }
});

module.exports = router;