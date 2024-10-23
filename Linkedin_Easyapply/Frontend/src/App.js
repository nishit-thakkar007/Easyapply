import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScreeningQuestions from './components/ScreeningQuestions';
import Login from './components/login';
import PlatformCredential from './components/PlatformCredential';
import ApplyHere from './components/ApplyHere'; // Import ApplyHere component

const App = () => {
  const [data, setData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // To manage login state
  const [user_id, setUserid] = useState('');
  const [username, setUsername] = useState(''); // For storing the logged-in user's name if needed

  useEffect(() => {
    fetch('http://localhost:8081/home_usermodel')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.log(err));
  }, []);

  // Handle login success
  const handleLogin = (userData) => {
    setIsAuthenticated(true); // Set to true when login is successful
    setUsername(userData.username); // Assuming userData contains the username
    setUserid(userData.user_id); // Assuming userData contains the user_id
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false); // Reset authentication state
    setUsername('');
    setUserid(''); // Reset user_id on logout
  };

  return (
    <Router>
      <div className="flex">
        {isAuthenticated && <Sidebar />} {/* Sidebar only appears if authenticated */}
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard username={username} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />

          {/* Screening Questions Route */}
          <Route
            path="/screening-questions"
            element={isAuthenticated ? <ScreeningQuestions userId={user_id} /> : <Navigate to="/login" />}
          />

          {/* Platform Credential Route */}
          <Route
            path="/platform-credential"
            element={isAuthenticated ? <PlatformCredential userId={user_id} /> : <Navigate to="/login" />}
          />

          {/* Apply Here Route */}
          <Route
            path="/apply-here"
            element={isAuthenticated ? <ApplyHere userId={user_id} /> : <Navigate to="/login" />}
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>

        {/* Users Data Table */}
        {isAuthenticated && (
          <div>
            <h2>Users Data</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i}>
                    <td>{d.id}</td>
                    <td>{d.username}</td>
                    <td>{d.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
