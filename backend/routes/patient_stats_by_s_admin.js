const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();

// MySQL database configuration using environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// GET route for patient statistics by Super Admin
router.get("/patient-stats-by-sadmin", async (req, res) => {
    let connection;
    try {
        // Create a connection to the database
        connection = await mysql.createConnection(dbConfig);

        // Call stored procedures
        const [totalPatientsResult] = await connection.execute("CALL GetPatientsCountbysadmin()");
        const [activePatientsResult] = await connection.execute("CALL GetActivePatientsCountbysadmin()");
        const [patientsFromReviewsResult] = await connection.execute("CALL GetPatientsCountFromReviewsbysadmin()");
        const [completedPatientsResult] = await connection.execute("CALL GetCompletedPatientsCountFromReviewsbySadmin()");
        const [patientDetailsResult] = await connection.execute("CALL GetPatientDoctorReviewDetailsbysadmin()");

        // Extract counts from result sets
        const totalPatients = totalPatientsResult[0][0].TotalPatients;
        const activePatients = activePatientsResult[0][0].ActivePatients;
        const patientsFromReviews = patientsFromReviewsResult[0][0].TotalPatients;
        const completedPatients = completedPatientsResult[0][0].CompletedPatients;
        const patientDetails = patientDetailsResult[0]; // Array of patient details

        // Send JSON response with all data
        res.json({
            totalPatients,
            activePatients,
            patientsFromReviews,
            completedPatients,
            patientDetails
        });
    } catch (error) {
        console.error("Error fetching patient stats by Super Admin:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.end(); // Close the connection
    }
});

module.exports = router;