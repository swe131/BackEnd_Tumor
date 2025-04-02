const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();

// MySQL database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// GET route to list all hospitals
router.get("/hospitals", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute("SELECT hos_id, hos_name FROM Hospital");
        res.json(results); // Array of { hos_id, hos_name }
    } catch (error) {
        console.error("Error fetching hospitals by Super Admin:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.end();
    }
});

// GET route to list doctors by hospital ID
router.get("/doctors/:hos_id", async (req, res) => {
    const { hos_id } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [results] = await connection.execute("CALL GetDoctorsByHospitalSadmin(?)", [hos_id]);
        res.json(results[0]); // Array of { DoctorName }
    } catch (error) {
        console.error("Error fetching doctors by Super Admin:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.end();
    }
});

// POST route to add a new patient
router.post("/add-patient", async (req, res) => {
    const {
        pat_name,
        pat_age,
        hos_name,
        medical_id,
        phone_number,
        pat_password,
        isActive,
        email,
        doc_name
    } = req.body;

    if (!pat_name || !hos_name || !medical_id || !pat_password || !doc_name || isActive === undefined) {
        return res.status(400).json({ error: "Required fields are missing" });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            "CALL InsertPatientWithDoctorAndHospitalSadmin(?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [pat_name, pat_age, hos_name, medical_id, phone_number, pat_password, isActive, email, doc_name]
        );
        res.json({ success: true, message: "Patient added successfully" });
    } catch (error) {
        console.error("Error adding patient by Super Admin:", error);
        res.status(500).json({ error: error.sqlMessage || "Internal Server Error" });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;