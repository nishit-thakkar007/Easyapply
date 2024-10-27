const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { startJobApplicationAutomation } = require('./send_application'); // Import Playwright automation function
const app = express();

// Middleware to handle CORS and JSON request body
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: 'GET,POST,PUT',
  allowedHeaders: 'Content-Type, Authorization'
}));

app.use(express.json());  // Handle JSON data in POST requests

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
  return res.json("Backend is running.");
});

// Endpoint to handle login (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    if (user.password === password) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Endpoint to handle submission of screening questions (POST)
app.post('/screening-questions', (req, res) => {
  const { question, answer, user_id } = req.body;

  if (!question || !answer || !user_id) {
    return res.status(400).json({ message: 'Please provide question, answer, and user_id.' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(checkUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const query = 'INSERT INTO screening_questions (question, answer, user_id) VALUES (?, ?, ?)';
    db.query(query, [question, answer, user_id], (err, result) => {
      if (err) {
        console.error('Error submitting screening question:', err);
        return res.status(500).json({ message: 'Error submitting screening question', error: err });
      }

      res.status(200).json({ message: 'Screening question submitted successfully.', result });
    });
  });
});

// Endpoint to fetch screening questions for a specific user (GET)
app.get('/user-screening-questions/:user_id', (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: 'Please provide user ID.' });
  }

  const query = 'SELECT * FROM screening_questions WHERE user_id = ?';
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error fetching screening questions:', err);
      return res.status(500).json({ message: 'Error fetching screening questions', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No screening questions found for this user.' });
    }

    return res.status(200).json(results);
  });
});

// Endpoint to update the answer of a screening question (PUT)
app.put('/screening-questions/answer', (req, res) => {
  const { id, answer } = req.body;

  if (!id || !answer) {
    return res.status(400).json({ message: 'Please provide id and answer.' });
  }

  const checkQuestionQuery = 'SELECT * FROM screening_questions WHERE id = ?';
  db.query(checkQuestionQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error checking screening question.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Screening question not found for this id.' });
    }

    const updateQuery = 'UPDATE screening_questions SET answer = ? WHERE id = ?';
    db.query(updateQuery, [answer, id], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating screening question answer.' });
      }

      if (result.affectedRows === 0) {
        return res.status(500).json({ message: 'Failed to update screening question answer.' });
      }

      res.status(200).json({ message: 'Screening question answer updated successfully.' });
    });
  });
});

// Endpoint to handle credential insertion
app.post('/add-credential', (req, res) => {
  const { user_id, platform, email, password } = req.body;

  if (!user_id || !platform || !email || !password) {
    return res.status(400).json({ message: 'Please provide user_id, platform, email, and password.' });
  }

  const checkUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(checkUserQuery, [user_id], (err, userResult) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const query = 'INSERT INTO user_credentials (user_id, platform, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    db.query(query, [user_id, platform, email, password], (err, result) => {
      if (err) {
        console.error('Error inserting credential:', err);
        return res.status(500).json({ message: 'Error submitting credential', error: err });
      }

      res.status(200).json({ message: 'Credential added successfully.', result });
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
          return res.status(500).json({ message: 'Error fetching user data.' });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(results);
  });
});

// Endpoint to handle job applications (POST)
app.post('/job-apply', (req, res) => {
  const { jobTitle, jobLocation, experience, numOfApplications, excludeKeywords, userId } = req.body;

  if (!jobTitle || !jobLocation || !experience || !numOfApplications || !userId) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const query = 'INSERT INTO job_applications (job_title, job_location, experience, num_of_applications, exclude_keywords, user_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [jobTitle, jobLocation, experience, numOfApplications, excludeKeywords, userId], (err, result) => {
    if (err) {
      console.error('Error submitting job application:', err);
      return res.status(500).json({ message: 'Error submitting job application', error: err });
    }

    res.status(200).json({ message: 'Job application submitted successfully.', result });
  });
});

// Route to trigger Playwright automation
app.post('/start-playwright', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Please provide user ID.' });

  try {
    const [credentials] = await db.promise().query('SELECT email, password FROM user_credentials WHERE user_id = ?', [userId]);
    const [jobAppData] = await db.promise().query('SELECT job_title, job_location, experience FROM job_applications WHERE user_id = ?', [userId]);
    const [screenQData] = await db.promise().query('SELECT question, answer FROM screening_questions WHERE user_id = ?', [userId]);

    const userData = {
      email: credentials[0].email,
      password: credentials[0].password,
      jobTitle: jobAppData[0].job_title,
      jobLocation: jobAppData[0].job_location,
      experience: jobAppData[0].experience,
      screeningQuestions: screenQData
    };

    await startJobApplicationAutomation(userData);
    res.status(200).json({ message: 'Job application automation started successfully!' });
  } catch (error) {
    console.error('Error in automation:', error);
    res.status(500).json({ message: 'Automation failed', error: error.message });
  }
});

app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
