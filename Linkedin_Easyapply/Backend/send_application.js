const { chromium } = require('playwright');

// Function to log in to LinkedIn
async function loginToLinkedIn(page, email, password) {
    try {
        console.log('Attempting to log in...');
        await page.goto('https://www.linkedin.com/login');
        await page.fill('input[name="session_key"]', email);
        await page.fill('input[name="session_password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForSelector('a.global-nav__primary-link--active', { timeout: 20000 });
        console.log('Login successful!');
    } catch (error) {
        console.error('Error during LinkedIn login:', error.message || error);
        await page.screenshot({ path: 'login_error.png' });
        throw new Error('Failed to log in to LinkedIn.');
    }
}

// Function to search for jobs and apply using Easy Apply
async function searchAndApplyToJobs(page, jobTitle, jobLocation, screeningQuestions) {
    let jobCounter = 0; // Count of applied jobs
    let currentPage = 1; // Track page numbers
    let retryCounter = 0; // To avoid infinite retries
    const maxRetries = 3; // Max retries to handle unexpected issues

    try {
        await page.goto('https://www.linkedin.com/jobs/', { waitUntil: 'networkidle' });
        console.log(`Navigating to LinkedIn jobs page.`);

        // Wait for page to load
        await page.waitForTimeout(5000);

        // Fill job search fields
        const jobSearchInput = await page.getByRole('combobox', { name: 'Search by title, skill, or company' });
        await jobSearchInput.fill(jobTitle);
        await jobSearchInput.press('Enter');
        console.log(`Searching for jobs with title: ${jobTitle}`);

        await page.waitForTimeout(5000);

        const locationInput = await page.getByRole('combobox', { name: 'City, state, or zip code' });
        await locationInput.fill(jobLocation);
        await locationInput.press('Enter');
        console.log(`Setting job location to: ${jobLocation}`);

        await page.waitForTimeout(5000);

        // Apply "Easy Apply" filter
        const easyApplyFilter = await page.$('button[aria-label="Easy Apply filter."]');
        if (easyApplyFilter) {
            await easyApplyFilter.click();
            console.log('Applied Easy Apply filter');
        } else {
            console.log('Easy Apply filter not found.');
            await page.screenshot({ path: 'no_easy_apply_filter.png' });
            return; // Exit if the filter is not found
        }

        await page.waitForTimeout(3000); // Wait for the filter to apply

        // Loop through job listings and apply
        while (true) {
            const jobCards = await page.$$('//div[contains(@class,"display-flex job-card-container")]');
            if (jobCards.length === 0) {
                console.log('No more job listings found.');
                await page.screenshot({ path: 'no_job_listings.png' });
                break;
            }
            
            console.log(`Found ${jobCards.length} job cards on page ${currentPage}`);
            
            for (const jobCard of jobCards) {
                await jobCard.click();
                await page.waitForTimeout(3000);

                // Check for Easy Apply button
                const easyApplyButton = await page.$('button.jobs-apply-button');
                if (easyApplyButton) {
                    console.log(`Found Easy Apply button for job ${++jobCounter}. Applying...`);
                    await easyApplyButton.click();
                    await page.waitForTimeout(3000); // Wait for Easy Apply modal to load

                    // Answer screening questions
                    if (screeningQuestions && screeningQuestions.length > 0) {
                        for (const { question, answer } of screeningQuestions) {
                            const questionElement = await page.$(`textarea[aria-label*="${question}"], input[aria-label*="${question}"]`);
                            if (questionElement) {
                                await questionElement.fill(answer);
                                console.log(`Answered question: "${question}" with "${answer}"`);
                            } else {
                                console.log(`Question field not found for: "${question}"`);
                            }
                        }
                    }

                    // Navigate through application pages if "Next" button is found
                    let hasNextPage = true;
                    while (hasNextPage) {
                        const nextButton = await page.$('button[aria-label="Continue to next step"]');
                        if (nextButton) {
                            await nextButton.click();
                            console.log('Navigating to the next step in Easy Apply...');
                            await page.waitForTimeout(3000);
                        } else {
                            hasNextPage = false;
                        }
                    }

                    // Submit the application if on the final page
                    const submitButton = await page.$('button[aria-label="Submit application"]');
                    if (submitButton) {
                        await submitButton.click();
                        console.log('Application submitted successfully!');
                        await page.waitForTimeout(3000);
                    } else {
                        console.log('Submit button not found.');
                        await page.screenshot({ path: 'no_submit_button.png' });
                    }

                    // Close the Easy Apply modal
                    const closeButton = await page.$('button[aria-label="Close"]');
                    if (closeButton) {
                        await closeButton.click();
                    } else {
                        console.log('Close button not found.');
                    }
                } else {
                    console.log('Easy Apply button not found for this job.');
                    await page.screenshot({ path: 'no_easy_apply_button.png' });
                }

                await page.goBack(); // Go back to job listings
                await page.waitForTimeout(3000);
            }

            // Navigate to the next page of jobs
            const nextPageButton = await page.$(`button[aria-label="Page ${++currentPage}"]`);
            if (nextPageButton) {
                await nextPageButton.click();
                console.log(`Navigating to page ${currentPage}`);
                await page.waitForTimeout(5000); // Wait for the next page to load
            } else {
                console.log('No more pages found. Exiting.');
                break;
            }

            // Handle retries in case of unexpected failures
            if (retryCounter >= maxRetries) {
                console.log('Max retries reached. Exiting job search.');
                break;
            }
        }
    } catch (error) {
        console.error('Error during job application process:', error.message || error);
        await page.screenshot({ path: 'job_application_error.png' });
        retryCounter++;
        if (retryCounter <= maxRetries) {
            console.log(`Retrying... (Attempt ${retryCounter})`);
            await searchAndApplyToJobs(page, jobTitle, jobLocation, screeningQuestions); // Retry job search
        } else {
            throw new Error('Failed after multiple retries during job application.');
        }
    }
}

// Main function to start the automation process
async function startJobApplicationAutomation(userData) {
    let browser, page;
    try {
        browser = await chromium.launch({ headless: userData.headless || false }); // Allow headless mode to be passed
        const context = await browser.newContext();
        page = await context.newPage();

        const { email, password, jobTitle, jobLocation, screeningQuestions } = userData;

        if (!email || !password) {
            throw new Error('Missing email or password in user data.');
        }

        // Log in to LinkedIn
        await loginToLinkedIn(page, email, password);

        // Search for jobs and apply using Easy Apply
        await searchAndApplyToJobs(page, jobTitle, jobLocation, screeningQuestions);

        console.log('Job application process completed successfully');
    } catch (error) {
        console.error('Error during job application automation:', error.message || error);
        throw error;
    } finally {
        if (browser) await browser.close(); // Close browser
    }
}

module.exports = { startJobApplicationAutomation };
