const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function testImageGen() {
    console.log("Testing Image Generation...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // According to documentation/list, this might be the model name
    const modelName = 'gemini-2.0-flash-exp'; // Sometimes this supports image output with specific prompt
    // OR 'imagen-3.0-generate-001' if accessible via this SDK (usually requires REST or Vertex)

    // Let's try to see if standard generateContent supports asking for an image 
    // for the experimental model.

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        console.log("Prompting for image...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: "Generate an image of a cute robot." }] }],
            // generationConfig: { responseMimeType: "image/jpeg" } // Hypothetical
        });

        console.log("Response received.");
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.log("Gemini Image Gen Error:", e.message);
    }
}

testImageGen();
