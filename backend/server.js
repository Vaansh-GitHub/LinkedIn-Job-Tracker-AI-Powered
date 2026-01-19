require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const preferenceRoutes = require('./routes/preferenceRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/preferences', preferenceRoutes);
app.use('/agent', require('./routes/agentRoutes'));

app.get('/', (req, res) => {
    res.send('Adaptive Job-Seeking Agent Backend Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
