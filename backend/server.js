const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();

// 1. Improved Middleware
app.use(cors()); // Allows Netlify to talk to Render
app.use(express.json());

let db;

// 2. Database Initialization with proper error handling
async function initializeDB() {
    try {
        const dbPath = path.join(__dirname, 'database.db');
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT UNIQUE,
                name TEXT,
                email TEXT,
                department TEXT
            );
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_id TEXT,
                date TEXT,
                status TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
            );
        `);
        console.log(`Database connected at ${dbPath}`);
        
        // Start server only AFTER DB is ready
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server active on port ${PORT}`));
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1); // Stop the server if DB fails
    }
}

initializeDB();

// --- API Endpoints ---

// Fetch all employees
app.get('/api/employees', async (req, res) => {
    try {
        const employees = await db.all('SELECT * FROM employees');
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

// Add a new employee
app.post('/api/employees', async (req, res) => {
    const { employee_id, name, email, department } = req.body;
    
    if (!employee_id || !name || !email) {
        return res.status(400).json({ error: "Required fields (ID, Name, Email) are missing." });
    }

    try {
        await db.run(
            'INSERT INTO employees (employee_id, name, email, department) VALUES (?, ?, ?, ?)',
            [employee_id, name, email, department]
        );
        // Ensure we return a clear object so Frontend doesn't get 'undefined'
        res.status(201).json({ 
            success: true,
            message: "Employee registered successfully.",
            data: { employee_id, name, email, department }
        });
    } catch (err) {
        const msg = err.message.includes("UNIQUE") ? "Employee ID already exists." : "Internal Server Error.";
        res.status(400).json({ error: msg });
    }
});

// Delete an employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM employees WHERE id = ?', req.params.id);
        res.status(200).json({ message: "Employee record deleted." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete record." });
    }
});

// Mark Attendance
app.post('/api/attendance', async (req, res) => {
    const { employee_id, date, status } = req.body;
    try {
        await db.run(
            'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
            [employee_id, date, status]
        );
        res.status(201).json({ message: "Attendance logged successfully." });
    } catch (err) {
        res.status(500).json({ error: "Failed to log attendance." });
    }
});

// Get Attendance for a specific employee
app.get('/api/attendance/:empId', async (req, res) => {
    try {
        const records = await db.all('SELECT * FROM attendance WHERE employee_id = ?', req.params.empId);
        res.status(200).json(records);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch attendance records." });
    }
});