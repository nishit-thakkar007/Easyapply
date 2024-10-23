import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'font-awesome/css/font-awesome.min.css';
import '../App.css'; // Ensure this path is correct based on your folder structure

const ApplyHere = () => {
  const [formData, setFormData] = useState({
    jobTitle: 'DevOps Engineer',
    jobLocation: 'India',
    experience: '0',
    numOfApplications: '1',
    excludeKeywords: 'software, manager, devops, architect',
  });
  const [user, setUser] = useState(null); // User state for authentication
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch user data (simulate user authentication for now)
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser)); // Assuming the user is stored in localStorage
    } else {
      setError('User not logged in.');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to submit job application
  const handleMainSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!user) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8081/job-apply', {
        ...formData,
        userId: user.id, // Send user ID from local storage
      });

      setMessage('Job application started successfully!');
    } catch (error) {
      setError('Failed to apply for the job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to save keywords (mock implementation)
  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    setMessage('Keywords saved successfully!');
  };

  // Function to reset the form fields
  const handleReset = () => {
    setFormData({
      jobTitle: '',
      jobLocation: '',
      experience: '',
      numOfApplications: '',
      excludeKeywords: '',
    });
  };

  return (
    <div className="bg-gray-100 font-sans antialiased flex">
      <div className="w-full p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Apply Here</h1>
          <div className="text-right">
            <p className="text-sm">Users Data</p>
            {user ? (
              <p className="text-sm font-bold">{user.id} {user.name} {user.email}</p>
            ) : (
              <p className="text-sm text-red-500">User not logged in</p>
            )}
          </div>
        </div>

        <div className="card bg-gray-800 text-white rounded-lg shadow-md">
          <div className="card-header bg-yellow-500 rounded-t-lg p-2 font-bold">LinkedIn</div>
          <div className="card-content p-4">
            {/* Job Application Form */}
            <form onSubmit={handleMainSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Title*</label>
                  <input
                    className="input"
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Location*</label>
                  <input
                    className="input"
                    type="text"
                    name="jobLocation"
                    value={formData.jobLocation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience (Years)*</label>
                  <input
                    className="input"
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Applications*</label>
                  <input
                    className="input"
                    type="text"
                    name="numOfApplications"
                    value={formData.numOfApplications}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <button className="btn apply-btn" type="submit" disabled={loading}>
                  {loading ? 'Applying...' : 'Apply Here'}
                </button>
                <button className="btn btn-reset" type="button" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </form>

            <h2 className="text-xl font-bold mb-4">Advanced Search Filter</h2>
            <form onSubmit={handleKeywordSubmit}>
              <label className="block text-sm font-medium mb-2">
                List of keywords to exclude in a job title (comma separated)
              </label>
              <textarea
                className="input mb-4"
                name="excludeKeywords"
                value={formData.excludeKeywords}
                onChange={handleInputChange}
              />
              <button className="btn apply-btn" type="submit">
                Save Keyword
              </button>
            </form>

            {/* Messages */}
            {message && <p className="text-green-500 mt-4">{message}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyHere;