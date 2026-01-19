const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
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
        const taskDescription = `Open LinkedIn and search for ${preferences.role} jobs in ${preferences.locations}.`;

        console.log('Starting MobileRun task:', taskDescription);

        const response = await client.tasks.run({
            llmModel: 'google/gemini-2.5-flash',
            task: taskDescription,
            deviceId: 'df6b5ba5-2d80-4e8b-a197-afdfcff361ab',
        });

        console.log('MobileRun Task Started:', response.id);

        res.status(200).json({
            message: 'Job search started on your device!',
            taskId: response.id
        });

    } catch (err) {
        console.error('Agent Search Error:', err);
        res.status(500).json({ error: err.message || 'Failed to start job search.' });
    }
});

module.exports = router;
