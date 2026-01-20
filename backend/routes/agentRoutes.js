const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
const Profile = require('../models/Profile');
const { Mobilerun } = require('@mobilerun/sdk');

router.post('/search', async (req, res) => {
    try {
        // 1. Check if preferences exist
        const preferences = await Preference.findOne().sort({ createdAt: -1 });

        if (!preferences) {
            return res.status(400).json({
                error: 'Please save your preferences before starting the job search.'
            });
        }

        // Fetch Profile
        const profile = await Profile.findOne().sort({ createdAt: -1 });

        // 2. Validate API Key
        if (!process.env.MOBILERUN_API_KEY) {
            return res.status(500).json({
                error: 'MobileRun API Key is not configured on the server.'
            });
        }

        // 3. Initialize MobileRun
        const client = new Mobilerun({
            apiKey: process.env.MOBILERUN_API_KEY,
        });

        // 4. Construct Task
        let taskDescription = `MISSION: Find the PERFECT job match for the candidate's profile. You must act as an intelligent job seeker.\n\n`;

        taskDescription += `STRICT CONSTRAINTS (Follow these patterns):\n`;
        taskDescription += `1. SKIP any job that is already marked as "Applied", "Easy Applied", or "Application Submitted".\n`;
        taskDescription += `2. AVOID jobs marked as "Viewed" if there are unviewed options available. Prioritize fresh opportunities.\n`;
        taskDescription += `3. ANALYZE job descriptions carefully. Only consider jobs that match at least 90% of the User's Core Skills and experience requirements. Do not consider irrelevant roles.\n`;
        taskDescription += `4. STOP IMMEDIATELY once you find the first perfect match. Do not continue searching or applying to multiple jobs.\n`;
        taskDescription += `5. MATCHING PRIORITY: Check job TITLE first, then SKILLSET. If both match perfectly, accept immediately without checking other conditions.\n\n`;

        taskDescription += `CANDIDATE DATE FOR APPLICATIONS:\n`;
        taskDescription += `- Target Role: ${preferences.role}\n`;
        taskDescription += `- Years of Experience: ${preferences.maxExperience}\n`;
        taskDescription += `- Core Skills: ${preferences.skills.join(', ')}\n`;
        taskDescription += `- Preferred Locations: ${preferences.locations.join(', ')}\n`;

        if (profile) {
            if (profile.bio) taskDescription += `- Bio/Professional Summary: ${profile.bio}\n`;
            if (profile.otherDetails) taskDescription += `- Additional Expertise/Certifications: ${profile.otherDetails}\n`;

            if (profile.projects && profile.projects.length > 0) {
                taskDescription += `\nPROJECT PORTFOLIO (Reference these for "Describe a project" or similar questions):\n`;
                taskDescription += profile.projects.map(p =>
                    `* Project: ${p.name}\n  - Details: ${p.description}\n  - Stack: ${p.techStack.join(', ')}\n  - Link: ${p.link}`
                ).join('\n\n');
            }
        }

        taskDescription += `\n\nEXECUTION PLAN:\n`;
        taskDescription += `1. Open LinkedIn Job Search.\n`;
        taskDescription += `2. Search for: "${preferences.role} ${preferences.skills.join(' ')}" in "${preferences.locations}".\n`;
        taskDescription += `3. Filter by "Date Posted" (Past 24 hours/Past Week) to find fresh jobs.\n`;
        taskDescription += `4. Scan the list. For each job, check if "Applied" or "Viewed" appears.\n`;
        taskDescription += `5. If CLEAN (not applied), open the job details.\n`;
        taskDescription += `6. MATCHING PROCESS:\n`;
        taskDescription += `   a) First, check if the job TITLE matches the target role: "${preferences.role}"\n`;
        taskDescription += `   b) Check initial SKILLSET display: ${preferences.skills.join(', ')}\n`;
        taskDescription += `   c) EXPAND the job description by clicking "See more", "Read more", or similar buttons to view the full "About the job" section\n`;
        taskDescription += `   d) Check SKILLSET in the expanded "About the job" section as well\n`;
        taskDescription += `   e) If BOTH title and skills match perfectly (90%+) in either initial or expanded view, immediately accept this job and stop searching.\n`;
        taskDescription += `   f) Only if title/skills don't match well enough, then check other requirements like experience and location.\n`;
        taskDescription += `7. If it's a PERFECT MATCH, STOP the search and present the job to the user for manual application.\n`;
        taskDescription += `8. Do NOT automatically apply or submit applications. Let the user decide.\n`;

        console.log('Starting MobileRun task:', taskDescription);

        const response = await client.tasks.run({
            llmModel: 'google/gemini-3-flash',
            task: taskDescription,
            deviceId: 'df6b5ba5-2d80-4e8b-a197-afdfcff361ab',//Add your deviceId
        });

        console.log('MobileRun Task Started:', response.id);

        res.status(200).json({
            message: 'Job search started! The agent will find your perfect job match and present it for you to apply manually.',
            taskId: response.id
        });

    } catch (err) {
        console.error('Agent Search Error:', err);
        res.status(500).json({ error: err.message || 'Failed to start job search.' });
    }
});

module.exports = router;
