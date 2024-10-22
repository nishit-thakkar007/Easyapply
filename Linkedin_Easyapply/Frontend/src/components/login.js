import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios for HTTP requests

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Login function to send request to backend
  const login = () => {
    axios.post('http://localhost:8081/login', { email, password })
      .then(response => {
        if (response.data.user) {
          // Save user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Optionally pass the user data to parent component
          if (onLogin) {
            onLogin(response.data.user);
          }

          // Redirect to the dashboard after successful login
          alert('Login successful!');
          navigate('/dashboard');
        } else {
          alert('Invalid credentials');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('Error during login');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    // Call the login function when the form is submitted
    login();
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-yellow-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-yellow-500 hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
