const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// Middleware to handle CORS and JSON request body
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: 'GET,POST,PUT',
  allowedHeaders: 'Content-Type, Authorization'
}));

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

// Endpoint to handle submission of screening questions (POST)
app.post('/screening-questions', (req, res) => {
  const { question, answer, user_id } = req.body;

  if (!question || !answer || !user_id) {
    return res.status(400).json({ message: 'Please provide question, answer, and user_id' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(checkUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query = 'INSERT INTO screening_questions (question, answer, user_id) VALUES (?, ?, ?)';
    db.query(query, [question, answer, user_id], (err, result) => {
      if (err) {
        console.error('Error submitting screening question:', err);
        return res.status(500).json({ message: 'Error submitting screening question', error: err });
      }

      res.status(200).json({ message: 'Screening question submitted successfully', result });
    });
  });
});

// Endpoint to fetch screening questions for a specific user (GET)
app.get('/user-screening-questions/:user_id', (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: 'Please provide user ID' });
  }

  const query = 'SELECT * FROM screening_questions WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching screening questions:', err);
      return res.status(500).json({ message: 'Error fetching screening questions', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No screening questions found for this user' });
    }

    return res.status(200).json(results);
  });
});

// New endpoint to update answer of a screening question (PUT)
app.put('/screening-questions/answer', (req, res) => {
  const { id, answer } = req.body;

  if (!id || !answer) {
    return res.status(400).json({ message: 'Please provide id and answer' });
  }

  const checkQuestionQuery = 'SELECT * FROM screening_questions WHERE id = ?';
  db.query(checkQuestionQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking screening question' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Screening question not found for this id' });
    }

    const updateQuery = 'UPDATE screening_questions SET answer = ? WHERE id = ?';
    db.query(updateQuery, [answer, id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating screening question answer' });
      }

      if (result.affectedRows === 0) {
        return res.status(500).json({ message: 'Failed to update screening question answer' });
      }

      res.status(200).json({ message: 'Screening question answer updated successfully' });
    });
  });
});

// Endpoint to handle credential insertion
app.post('/add-credential', (req, res) => {
  const { user_id, platform, email, password } = req.body;

  // Validate input
  if (!user_id || !platform || !email || !password) {
    return res.status(400).json({ message: 'Please provide user_id, platform, email, and password' });
  }

  // Check if user exists
  const checkUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(checkUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Insert credential into the credentials table
    const query = 'INSERT INTO user_credentials (user_id, platform, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    db.query(query, [user_id, platform, email, password], (err, result) => {
      if (err) {
        console.error('Error inserting credential:', err);
        return res.status(500).json({ message: 'Error submitting credential', error: err });
      }

      res.status(200).json({ message: 'Credential added successfully', result });
    });
  });
});



// Endpoint to get user credentials and job preferences
app.get('/user/:id/data', (req, res) => {
  const { id } = req.params;

  const query = `
      SELECT u.email, u.password, u.phone, j.job_title, s.question, s.answer 
      FROM users u
      LEFT JOIN job_preferences j ON u.id = j.user_id
      LEFT JOIN screening_questions s ON u.id = s.user_id
      WHERE u.id = ?
  `;

  db.query(query, [id], (err, results) => {
      if (err) {
          console.error('Error fetching user data:', err);
          return res.status(500).json({ message: 'Error fetching user data' });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(results);
  });
});


// Server listening on port 8081
app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
