import React from 'react';

import Card from './card';
import '../App.css'; // Adjust the path if needed based on your folder structure


const Dashboard = () => (
    <div className="flex">
       
        <div className="flex-1 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Apply Job</h1>
                <div className="relative">
                    <input type="text" placeholder="Search.." className="p-2 rounded-full border border-gray-300" />
                    <i className="fas fa-search absolute right-3 top-3 text-gray-500"></i>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <Card title="Linkedin" content="Linkedin is the world's largest professional network on the internet. You can use Linkedin to find the right job or internship." />
                <Card title="Glassdoor" content="Glassdoor is an American website where people search millions of jobs and get the inside scoop on companies with employee reviews." />
                <Card title="Indeed" content="Finding the best fit for the job shouldn't be a full-time job. Indeed's simple and powerful tools let you source, screen and hire faster." />
                <Card title="Dice" content="Dice is a job board specifically for tech and IT jobs." />
                <Card title="SimplyHired" content="SimplyHired helps you find job listings from multiple sources." />
                <Card title="ZipRecruiter" content="ZipRecruiter connects employers with job seekers." />
            </div>
        </div>
    </div>
);

export default Dashboard;
