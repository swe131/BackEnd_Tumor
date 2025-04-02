const express = require("express");
const db = require("../db/db");
const router = express.Router();

// Fetch all counts and hospital details
router.get("/dashboard-stats", async (req, res) => {
    try {
        // Call all stored procedures
        const [patients] = await db.query("CALL CountPatientsBySAdmin()");
        const [doctors] = await db.query("CALL CountDoctorsBySAdmin()");
        const [hospitals] = await db.query("CALL CountHospitalsBySAdmin()");
        const [reviews] = await db.query("CALL CountReviewsBySAdmin()");
        const [hospitalDetails] = await db.query("CALL GetHospitalDetailsWithDoctorCount()");

        // Log raw results for debugging
        console.log("Patients:", patients);
        console.log("Doctors:", doctors);
        console.log("Hospitals:", hospitals);
        console.log("Reviews:", reviews);
        console.log("Hospital Details:", hospitalDetails);

        // Construct response - Access the first object in the first array
        const response = {
            totalPatients: patients[0][0].total_patients,  // First row, first object
            totalDoctors: doctors[0][0].total_doctors,     // First row, first object
            totalHospitals: hospitals[0][0].total_hospitals, // First row, first object
            totalReviews: reviews[0][0].total_reviews,     // First row, first object
            hospitalDetails: hospitalDetails[0]            // First row (array of hospital objects)
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;