require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// OpenWeatherMap API Config
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
if (!OPENWEATHER_API_KEY) {
    console.error('Missing OPENWEATHER_API_KEY in environment variables');
    process.exit(1);
}

// Weather endpoint
app.get('/api/weather', async (req, res) => {
    const { city } = req.query;
    
    if (!city) {
        return res.status(400).json({ error: 'City parameter is required' });
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            conditions: response.data.weather[0].main,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        };
        
        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ error: 'City not found' });
        } else {
            res.status(500).json({ error: 'Failed to fetch weather data' });
        }
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.sendStatus(200);
    console.log(`[Version ${process.version}]: New request => http://${req.hostname}:${PORT}${req.url}`);
});

// Listen on 0.0.0.0 to allow external access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
