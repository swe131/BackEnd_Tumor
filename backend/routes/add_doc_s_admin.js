const express = require('express');
const router = express.Router();
const db = require('../db/db'); // Adjust path to your db file

// GET /api/hospitals/list - Fetch hospital names
router.get('/list', async (req, res) => {
    try {
        const [rows] = await db.query("CALL FetchHospitalNames()");
        res.json({
            success: true,
            data: rows[0] // First result set from stored procedure
        });
    } catch (error) {
        console.error('Error fetching hospital names:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch hospital names'
        });
    }
});

// POST /api/admin/add - Add a new doctor
router.post('/add', async (req, res) => {
    const { 
        email,        // Admin email (not used in stored proc but might be for auth)
        doc_email,    // Doctor email
        experience,   // Experience
        password,     // Password (unhashed for now, hash in production)
        fullName,     // Doctor's full name
        specialist,   // Specialist
        hos_name      // Hospital name from frontend
    } = req.body;

    try {
        const [result] = await db.query(
            "CALL AddDoctor_sa(?, ?, ?, ?, ?, ?, ?)",
            [
                fullName || null,    // p_doc_name
                experience,          // p_experience
                hos_name,            // p_hos_name
                null,                // p_profile_img (null for now)
                doc_email,           // p_doc_email
                password,            // p_password
                specialist || null   // p_specialist
            ]
        );

        // Assuming AddDoctor_sa returns new_doc_id in the result set
        const newDocId = result[0][0].new_doc_id;

        res.json({
            success: true,
            doc_id: newDocId
        });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({
            success: false,
            error: error.sqlMessage || 'Failed to add doctor'
        });
    }
});

module.exports = router;