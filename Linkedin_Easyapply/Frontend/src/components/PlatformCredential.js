import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PlatformCredential() {
    const [formData, setFormData] = useState({
        platform: 'Glassdoor',
        email: '',
        password: ''
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const platforms = ['LinkedIn', 'Glassdoor', 'Indeed'];

    // Fetch user data from localStorage
    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const user = JSON.parse(loggedInUser);
            setUser(user);
        } else {
            setError('User is not logged in.');
        }
    }, []);

    // Handle input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // Submit new credential to the API
    const submitCredential = async () => {
        const { platform, email, password } = formData;

        // Validate fields
        if (!email || !password) {
            setError('Please fill out all fields.');
            return;
        }

        if (!user) {
            setError('User is not logged in or user ID not found.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use dynamic backend URL
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

            // API call to store the credentials
            await axios.post(`${backendUrl}/add-credential`, {
                platform,
                email,
                password,
                user_id: user.id,
            });

            alert('Credential submitted successfully.');
            resetFields(); // Reset the form after successful submission
        } catch (error) {
            setError('Failed to submit credential. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset input fields
    const resetFields = () => {
        setFormData({
            platform: 'Glassdoor',
            email: '',
            password: ''
        });
        setError('');
    };

    return (
        <div className="p-8 bg-gray-100">
            <h1 className="text-2xl font-bold">Insert Credential</h1>
            <div className="bg-white p-8 rounded-lg shadow-lg relative">
                <h2 className="text-xl font-bold mb-4">Enter your platform credentials</h2>

                {loading && <p className="text-gray-500">Submitting credentials...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!user && (
                    <p className="text-red-500">You need to log in to submit credentials.</p>
                )}

                {user && (
                    <>
                        <select
                            className="w-full p-2 border border-gray-300 rounded"
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            {platforms.map((platform, index) => (
                                <option key={index} value={platform}>{platform}</option>
                            ))}
                        </select>

                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-4"
                            placeholder="Enter Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <input
                            className="w-full p-2 border border-gray-300 rounded mt-4"
                            placeholder="Enter Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />

                        <div className="flex justify-between mt-4">
                            <button onClick={submitCredential} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Credential'}
                            </button>
                            <button
                                onClick={resetFields}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PlatformCredential;
