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

// GET route for super admin dashboard data
router.get("/sup_dashboard", async (req, res) => {
    let connection;
    try {
        // Create a connection to the database
        connection = await mysql.createConnection(dbConfig);

        // Call stored procedures for counts
        const [doctorsResult] = await connection.execute("CALL GetActiveDoctorsCount()");
        const [patientsResult] = await connection.execute("CALL GetActivePatientsCount()");
        const [hospitalsResult] = await connection.execute("CALL GetHospitalsCount()");
        const [reviewsResult] = await connection.execute("CALL GetReviewsCount()");

        // Call stored procedure for patient-doctor-review data
        const [patientReviewResult] = await connection.execute("CALL GetPatientDoctorReviewStatus()");

        // Call stored procedure for doctor-patients-pending reviews data
        const [doctorReviewResult] = await connection.execute("CALL GetDoctorPatientsPendingReviews()");

        // Call stored procedure for hospital data (includes NumberOfDoctors)
        const [hospitalResult] = await connection.execute("CALL GetHospitalsData()");

        // Call stored procedure for review details
        const [reviewDetailsResult] = await connection.execute("CALL GetReviewDetails()");

        // Extract counts from the result sets
        const totalDoctors = doctorsResult[0][0].ActiveDoctors;
        const totalPatients = patientsResult[0][0].ActivePatients;
        const totalHospitals = hospitalsResult[0][0].TotalHospitals;
        const totalReviews = reviewsResult[0][0].TotalReviews;

        // Extract data arrays from the result sets
        const patientReviews = patientReviewResult[0]; // Patient data
        const doctorReviews = doctorReviewResult[0];   // Doctor data
        const hospitals = hospitalResult[0];           // Hospital data
        const reviewDetails = reviewDetailsResult[0];  // Review details data

        // Send JSON response with all data
        res.json({
            totalDoctors,
            totalPatients,
            totalHospitals,
            totalReviews,
            patientReviews,
            doctorReviews,
            hospitals,
            reviewDetails
        });
    } catch (error) {
        console.error("Error fetching super admin dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) await connection.end(); // Close the connection
    }
});

module.exports = router;