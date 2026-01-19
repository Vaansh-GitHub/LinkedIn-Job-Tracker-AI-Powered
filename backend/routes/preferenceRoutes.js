const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');

// Get Preferences
router.get('/', async (req, res) => {
    try {
        const preferences = await Preference.findOne().sort({ createdAt: -1 });
        return res.status(200).json(preferences || null);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Save / Update Preferences
router.post('/', async (req, res) => {
    try {
        const { role, skills, maxExperience, locations } = req.body;

        if (!role || !skills) {
            return res.status(400).json({ error: 'Role and skills are required' });
        }

        const preference = await Preference.findOneAndUpdate(
            {},
            { role, skills, maxExperience, locations },
            { new: true, upsert: true }
        );

        return res.status(201).json(preference);

    } catch (err) {
        console.error('Preference Route Error:', err);
        return res.status(500).json({ error: 'Failed to save preferences' });
    }
});

module.exports = router;