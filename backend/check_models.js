const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const logFile = 'model_check_log.txt';
    const maskedKey = process.env.GEMINI_API_KEY ? `...${process.env.GEMINI_API_KEY.slice(-5)}` : 'UNDEFINED';
    fs.writeFileSync(logFile, `Starting model check with Key: ${maskedKey}\n`);

    try {
        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash-exp",
            "gemini-2.0-flash", // We know this failed, but keep for reference
            "gemini-flash-latest"
        ];

        for (const modelName of modelsToTry) {
            fs.appendFileSync(logFile, `--- Testing model: ${modelName} ---\n`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                fs.appendFileSync(logFile, `[PASS] ${modelName} IS WORKING!\n`);
            } catch (e) {
                fs.appendFileSync(logFile, `[FAIL] ${modelName}: ${e.message}\n`);
            }
        }

    } catch (error) {
        fs.appendFileSync(logFile, `Global Error: ${error.message}\n`);
    }
}

listModels();
