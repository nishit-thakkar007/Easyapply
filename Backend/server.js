const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// Middleware to handle CORS and JSON request body
app.use(cors());
app.use(express.json());  // Add express.json() to handle JSON data in POST requests

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "user_application_db"
});

// Check MySQL connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Test route
app.get('/', (req, res) => {
  return res.json("From Backend Side");
});

// Endpoint to get users from the database
app.get('/home_usermodel', (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }
    return res.json(data);
  });
});

// Endpoint to handle login (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password' });
  }

  // Query to check if the email exists
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      // User not found
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    // Compare the plain text password with the one stored in the database
    if (user.password === password) {
      // Password matches, send success response
      res.status(200).json({ message: 'Login successful', user: user });
    } else {
      // Invalid password
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Endpoint to handle submission of screening questions
app.post('/screening-questions', (req, res) => {
  const { question, answer, user_id } = req.body;

  // Validate input
  if (!question || !answer || !user_id) {
    return res.status(400).json({ message: 'Please provide question, answer, and user_id' });
  }

  // SQL query to insert the screening question into the database
  const query = 'INSERT INTO screening_questions (question, answer, user_id) VALUES (?, ?, ?)';
  
  db.query(query, [question, answer, user_id], (err, result) => {
    if (err) {
      console.error('Error inserting screening question:', err);
      return res.status(500).json({ message: 'Error saving screening question', error: err });
    }
    return res.status(200).json({ message: 'Screening question submitted successfully', result: result });
  });
});

// Server listening on port 8081
app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
