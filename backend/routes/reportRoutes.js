require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");

const router = express.Router();

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ensure "uploads" directory exists
const baseUploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

// File Filter Function
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/dicom"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PNG, JPG, JPEG, and DCM files are allowed"), false);
    }
};

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { email } = req.body; // Access email from req.body

        console.log("Received email in Multer destination:", email); // Debug log

        if (!email) {
            return cb(new Error("Email is required"));
        }

        const query = "SELECT pat_id FROM patients WHERE email = ?";
        try {
            const [results] = await pool.query(query, [email]);
            console.log("Raw results from patient-id:", results);

            if (!results || results.length === 0) {
                return cb(new Error("No patient found with this email"));
            }

            const pat_id = results[0].pat_id;
            console.log("Fetched pat_id in Multer destination:", pat_id);

            const uploadDir = path.join(baseUploadDir, pat_id);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            req.uploadDir = uploadDir;
            req.upload_by_id = pat_id; // Set pat_id as upload_by_id
            cb(null, uploadDir);
        } catch (err) {
            console.error("Database error in Multer destination:", err);
            return cb(new Error("Database error fetching pat_id"));
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: fileFilter
}).array("images", 3); // Allow up to 3 files

// Upload Route with Foreign Key Check
router.post("/upload", (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.log("Multer error:", err.message);
            return res.status(400).json({ message: err.message });
        }

        if (!req.files || req.files.length !== 3) {
            console.log("File count error: Expected 3, got", req.files ? req.files.length : 0);
            return res.status(400).json({ message: "You must upload exactly 3 images" });
        }

        const uploadPath = req.uploadDir;
        console.log("Processing upload with upload path:", uploadPath); // Debug log

        try {
            const connection = await pool.getConnection();
            await connection.execute(
                "INSERT INTO scan_images (img, upload_by_id) VALUES (?, ?)",
                [uploadPath, req.upload_by_id] // Store the pat_id from the request
            );
            connection.release();
            res.json({
                message: "Images uploaded and stored successfully",
                folder: uploadPath
            });
        } catch (dbError) {
            console.error("Database Error in upload:", dbError);
            res.status(500).json({ message: "Error storing image folder path in database" });
        }
    });
});

module.exports = router;
