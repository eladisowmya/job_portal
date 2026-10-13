const express = require("express");
const mysql = require("mysql");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve HTML and CSS files
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "job_portal"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err.message);
        return;
    }

    console.log("Connected to MySQL database!");
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
// About Us page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "about.html"));
});

// Contact Us page
app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// Display all jobs
app.get("/jobs", (req, res) => {
    db.query("SELECT * FROM jobs", (err, results) => {
        if (err) {
            return res.status(500).send("Error loading jobs.");
        }

        res.json(results);
    });
});

// Insert a new job
app.post("/jobs", (req, res) => {
    const {
        job_id,
        title,
        company,
        location,
        salary,
        skills,
        interview_date
    } = req.body;

    const sql = `
        INSERT INTO jobs
        (job_id, title, company, location, salary, skills, interview_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [job_id, title, company, location, salary, skills, interview_date],
        (err) => {
            if (err) {
                return res.status(500).send("Error adding job: " + err.message);
            }

            res.send("Job added successfully!");
        }
    );
});
// UPDATE JOB
app.put("/jobs/:id", (req, res) => {
    const { title, company, location, salary, skills, interview_date } = req.body;

    const sql = `
        UPDATE jobs
        SET title = ?,
            company = ?,
            location = ?,
            salary = ?,
            skills = ?,
            interview_date = ?
        WHERE job_id = ?
    `;

    const values = [
        title,
        company,
        location,
        salary,
        skills,
        interview_date || null,
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            return res.status(500).send("Error updating job: " + err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Job not found.");
        }

        res.send("Job updated successfully!");
    });
});


// DELETE JOB
app.delete("/jobs/:id", (req, res) => {
    const sql = "DELETE FROM jobs WHERE job_id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).send("Error deleting job: " + err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Job not found.");
        }

        res.send("Job deleted successfully!");
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Job Portal running at http://localhost:${PORT}`);
});
// SAVE CONTACT MESSAGE
app.post("/contact", (req, res) => {
    const { name, email, subject, message } = req.body;

    if (
        !name?.trim() ||
        !email?.trim() ||
        !subject?.trim() ||
        !message?.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    const sql = `
        INSERT INTO contact_messages
        (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name.trim(), email.trim(), subject.trim(), message.trim()],
        (err) => {
            if (err) {
                console.error("Contact message error:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Unable to save your message. Please try again."
                });
            }

            res.json({
                success: true,
                message: "Your message has been submitted successfully!"
            });
        }
    );
});