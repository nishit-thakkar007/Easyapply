const { chromium } = require('playwright');
const axios = require('axios');

// Function to fetch user credentials, job details, and screening questions from the backend
async function fetchUserData(userId) {
    try {
        const response = await axios.get(`http://localhost:8081/user/${userId}/data`);
        if (!response.data || response.data.length === 0) {
            throw new Error('No user data found.');
        }
        return response.data[0]; // Assuming response.data is an array, returning the first object.
    } catch (error) {
        console.error('Error fetching user data:', error.message || error);
        throw new Error('Failed to fetch user data.');
    }
}

// Function to apply to jobs based on user data
async function applyToJobs(page, jobTitle, jobLocation, experience, questionsAndAnswers) {
    try {
        await page.goto('https://www.linkedin.com/jobs/');
        console.log(`Searching for jobs with title: ${jobTitle} in ${jobLocation}`);

        // Job search logic
        await page.getByRole('combobox', { name: 'Search by title, skill, or company' }).fill(jobTitle);
        await page.getByRole('combobox', { name: 'Search by title, skill, or company' }).press('Enter');
        await page.waitForTimeout(5000); // Wait for search results to load

        // Apply "Easy Apply" filter
        await page.waitForSelector("//button[@aria-label='Easy Apply filter.']");
        await page.click("//button[@aria-label='Easy Apply filter.']");
        await page.waitForTimeout(2000); // Allow some time for the filter to apply

        // Get job postings
        const jobCards = await page.$$('ul.jobs-search__results-list li'); // Target job cards
        for (const jobCard of jobCards) {
            await jobCard.click(); // Click on the job to view details
            await page.waitForTimeout(2000); // Wait for the job details to load

            // Check if Easy Apply button is available
            const easyApplyButton = await page.$('button[data-control-name="jobdetails_topcard_easy_apply"]');
            if (easyApplyButton) {
                await easyApplyButton.click(); // Click Easy Apply button
                await page.waitForTimeout(2000); // Wait for the Easy Apply modal to open

                // Fill in screening questions and answers
                if (questionsAndAnswers && questionsAndAnswers.length > 0) {
                    for (const qa of questionsAndAnswers) {
                        const { question, answer } = qa;

                        // Assuming a simple fill logic based on the question text
                        const questionElement = await page.$(`textarea[aria-label*="${question}"], input[aria-label*="${question}"]`);
                        if (questionElement) {
                            await questionElement.fill(answer);
                            console.log(`Answered question: "${question}" with "${answer}"`);
                        } else {
                            console.log(`Question field not found for: "${question}"`);
                        }
                    }
                }

                // Submit application
                const submitButton = await page.$('button[type="submit"]');
                if (submitButton) {
                    await submitButton.click();
                    console.log('Application submitted successfully!');
                    await page.waitForTimeout(2000); // Wait for confirmation
                } else {
                    console.log('Submit button not found.');
                }

                // Close the job application modal
                const closeButton = await page.$('button[aria-label="Close"]');
                if (closeButton) {
                    await closeButton.click();
                } else {
                    console.log('Close button not found.');
                }
            } else {
                console.log('Easy Apply button not found for this job.');
            }

            await page.goBack(); // Go back to job listings
            await page.waitForTimeout(2000); // Wait for job listings to reload
        }
    } catch (error) {
        console.error('Error during job application process:', error.message || error);
        throw new Error('Failed during job application.');
    }
}

// Function to login to LinkedIn
async function loginToLinkedIn(page, email, password) {
    try {
        console.log('Attempting to log in...');
        await page.goto('https://www.linkedin.com/login');
        await page.fill('input[name="session_key"]', email);
        await page.fill('input[name="session_password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForSelector('a.global-nav__primary-link--active', { timeout: 10000 }); // Wait for login to complete
        console.log('Login successful!');
    } catch (error) {
        console.error('Error during LinkedIn login:', error.message || error);
        throw new Error('Failed to log in to LinkedIn.');
    }
}

// Main function to start the automation
async function startJobApplicationAutomation(userData) {
    let browser, page;
    try {
        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        page = await context.newPage();

        const { email, password, jobTitle, jobLocation, experience, questionsAndAnswers } = userData;

        if (!email || !password) {
            throw new Error('Missing email or password in user data.');
        }

        // Log in to LinkedIn
        console.log(`Logging into LinkedIn for user: ${email}`);
        await loginToLinkedIn(page, email, password);

        // Search and apply to jobs
        console.log(`Searching and applying for job: ${jobTitle} in ${jobLocation}`);
        await applyToJobs(page, jobTitle, jobLocation, experience, questionsAndAnswers);

        console.log('Automation completed successfully');
    } catch (error) {
        console.error('Error during job application automation:', error.message || error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { startJobApplicationAutomation };
