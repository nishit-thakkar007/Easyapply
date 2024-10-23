import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css'; // Ensure this path is correct based on your folder structure

const Sidebar = () => (
    <div className="sidebar">
        {/* Company Logo */}
        <div className="flex items-center mb-6">
            <img src="/Cubix.png" alt="Company Logo" className="mr-3" width="50" height="50" />
            <span className="text-xl font-bold">Cubix Digital</span>
        </div>

        {/* User Avatar */}
        <div className="flex items-center mb-6">
            <img
                src="https://storage.googleapis.com/a1aa/image/avHBkUfmCftHbUv9A7vNnsd3zK3fOuDcgI0D9UoHBDpigIQnA.jpg"
                alt="User Avatar"
                className="rounded-full mr-3"
                width="50"
                height="50"
            />
            {/* Placeholder for login username or additional user info */}
            <span>{/* You can dynamically inject username here if needed */}</span>
        </div>

        {/* Sidebar Navigation Links */}
        <nav>
            <Link to="/dashboard" className="sidebar-link">Dashboard</Link>
            <Link to="/apply-here" className="sidebar-link">Apply Job</Link>
            <Link to="/screening-questions" className="sidebar-link">Screening Questions</Link>
            <Link to="/applied-job" className="sidebar-link">Applied Job</Link>
            <Link to="/platform-credential" className="sidebar-link">Platform Credential</Link>
            <Link to="/account-setting" className="sidebar-link">Account Setting</Link>
            <Link to="/logout" className="sidebar-link">Logout</Link>
        </nav>
    </div>
);

export default Sidebar;
