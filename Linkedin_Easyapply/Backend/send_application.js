const { chromium } = require('playwright');
const axios = require('axios');
const { answerNumericQuestions, answerBinaryQuestions } = require('./utils_Numeric');
const { applyDatePostedFilter, answerDropDown } = require('./utils_DropDown');

// Function to fetch user credentials and preferences
async function fetchUserData(userId) {
    try {
        const response = await axios.get(`http://localhost:8081/user/${userId}/data`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user data.');
    }
}

// Function to apply to jobs based on user data
async function applyToJobs(page, email, phoneNumber, jobTitle, questions_and_answers) {
    try {
        await page.goto('https://www.linkedin.com/jobs/');
        console.log(`Searching for jobs with title: ${jobTitle}`);

        // Job search
        await page.getByRole('combobox', { name: 'Search by title, skill, or' }).fill(jobTitle);
        await page.getByRole('combobox', { name: 'Search by title, skill, or' }).press('Enter');
        await page.waitForTimeout(5000);

        // Apply Easy Apply filter
        await page.waitForSelector("//button[@aria-label='Easy Apply filter.']");
        await page.click("//button[@aria-label='Easy Apply filter.']");
        await applyDatePostedFilter(page);
        
        let currentPage = 1;
        while (true) {
            const jobListings = await page.$$('//div[contains(@class,"display-flex job-card-container")]');
            if (jobListings.length === 0) break;

            // Process each job
            for (let job of jobListings) {
                await job.click();

                // Check if already applied
                const alreadyApplied = await page.$('span.artdeco-inline-feedback__message:has-text("Applied")');
                if (alreadyApplied) continue;

                // Easy Apply button
                let easyApplyButton;
                try {
                    easyApplyButton = await page.waitForSelector('button.jobs-apply-button', { timeout: 5000 });
                    await easyApplyButton.click();
                } catch (error) {
                    console.log('No Easy Apply button found. Skipping this job.');
                    continue;
                }

                // Fill in the user details
                await fillUserDetails(page, email, phoneNumber);
                await page.waitForTimeout(3000);

                // Answer Questions using utils
                await answerQuestions(page);
                await handleNextOrReview(page);
            }

            // Move to the next page
            currentPage++;
            const nextPageButton = await page.$(`button[aria-label="Page ${currentPage}"]`);
            if (!nextPageButton) break;

            await nextPageButton.click();
            await page.waitForTimeout(5000);
        }
    } catch (error) {
        console.error('Error applying to jobs:', error);
    }
}

// Function to fill email and phone number
async function fillUserDetails(page, email, phoneNumber) {
    const emailLabel = await page.$('label:has-text("Email address")') || await page.$('label:has-text("Email")');
    if (emailLabel) {
        const emailInputId = await emailLabel.getAttribute('for');
        await page.selectOption(`#${emailInputId}`, email);
    }
    await fillPhoneNumber(page, phoneNumber);
}

// Function to fill phone number
async function fillPhoneNumber(page, phoneNumber) {
    try {
        const inputElement = await page.getByLabel("Mobile phone number", { exact: true });
        await inputElement.fill(phoneNumber);
    } catch (error) {
        console.log("Phone number input field not found.");
    }
}

// Main function
(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Fetch user data from backend
    const userId = 1; // Example: use dynamic user ID based on session
    const userData = await fetchUserData(userId);

    const { email, password, phone, job_title, questions_and_answers } = userData;

    try {
        // Login to LinkedIn
        await page.goto('https://www.linkedin.com/login');
        await page.fill('input[name="session_key"]', email);
        await page.fill('input[name="session_password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForSelector('a.global-nav__primary-link--active');
        
        console.log('Login successful!');
        
        // Apply to jobs
        await applyToJobs(page, email, phone, job_title, questions_and_answers);
    } catch (error) {
        console.error('Error during login or job search:', error);
    } finally {
        await browser.close();
    }
})();
