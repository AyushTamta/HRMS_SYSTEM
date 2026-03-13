const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

let db;

(async () => {
    // Initialize SQLite Database
    db = await open({
        filename: './database.db',
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
            status TEXT
        );
    `);
    console.log("Database Ready.");
})();

// --- API ROUTES ---

// Get all employees
app.get('/api/employees', async (req, res) => {
    const data = await db.all('SELECT * FROM employees');
    res.json(data);
});

// Add employee
app.post('/api/employees', async (req, res) => {
    const { employee_id, name, email, department } = req.body;
    try {
        await db.run(
            'INSERT INTO employees (employee_id, name, email, department) VALUES (?, ?, ?, ?)',
            [employee_id, name, email, department]
        );
        res.status(201).json({ message: "Added" });
    } catch (e) {
        res.status(400).json({ error: "Duplicate ID or Invalid Data" });
    }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
    await db.run('DELETE FROM employees WHERE id = ?', req.params.id);
    res.json({ message: "Deleted" });
});

// Mark Attendance
app.post('/api/attendance', async (req, res) => {
    const { employee_id, date, status } = req.body;
    await db.run(
        'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
        [employee_id, date, status]
    );
    res.json({ message: "Attendance Marked" });
});

// Get Attendance for an employee
app.get('/api/attendance/:empId', async (req, res) => {
    const data = await db.all('SELECT * FROM attendance WHERE employee_id = ?', req.params.empId);
    res.json(data);
});

app.listen(5000, () => console.log("Backend on port 5000"));