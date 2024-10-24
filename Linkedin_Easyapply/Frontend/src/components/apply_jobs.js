// apply_jobs.js

export async function applyToJobs(page, email, phoneNumber, jobTitle, questions_and_answers) {
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
