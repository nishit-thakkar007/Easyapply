const { chromium } = require('playwright');
const axios = require('axios');

// Function to apply to jobs
async function applyToJobs(userData) {
    const { email, password, phone, job_title, questions_and_answers } = userData;
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login to LinkedIn
    await page.goto('https://www.linkedin.com/login');
    await page.fill('input[name="session_key"]', email);
    await page.fill('input[name="session_password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForSelector('a.global-nav__primary-link--active');
    
    // Apply to jobs logic goes here
    // (Your existing job application logic)

    await browser.close();
}

// Call the function to apply for jobs based on user data
async function startJobApplication(userId) {
    try {
        const response = await axios.get(`http://localhost:8081/user/${userId}/data`);
        const userData = response.data;

        await applyToJobs(userData);
    } catch (error) {
        console.error('Error starting job application:', error.response.data);
    }
}

// Start applying for jobs when this script runs
const userId = 1; // Adjust this to your context
startJobApplication(userId);
