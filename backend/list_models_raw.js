const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function getModels() {
    try {
        const logFile = 'available_models.txt';
        // Check if key is available
        if (!API_KEY) {
            console.log("No API Key found.");
            return;
        }

        fs.writeFileSync(logFile, `Querying models for key ending in ...${API_KEY.slice(-5)}\n\n`);

        console.log(`Querying: ${URL.replace(API_KEY, 'HIDDEN_KEY')}`);
        const response = await axios.get(URL);
        console.log("Response Status:", response.status);

        if (response.data && response.data.models) {
            console.log("Models found. Writing to file...");
            response.data.models.forEach(m => {
                const line = `- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})\n`;
                fs.appendFileSync(logFile, line);
            });
        } else {
            console.log("No models found in response.");
            fs.appendFileSync(logFile, "No models found.");
        }
    } catch (error) {
        console.error("Error fetching models:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            const errLog = `Error ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}`;
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
            fs.writeFileSync('available_models.txt', errLog);
        } else {
            console.error(error.message);
        }
    }
}

getModels();
