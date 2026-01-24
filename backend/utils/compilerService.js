const axios = require('axios');

const runCode = async (language, code) => {
    // Piston API URL
    const baseUrl = 'https://emkc.org/api/v2/piston/execute';

    // Map frontend languages to Piston language/version
    const languageMap = {
        'javascript': { language: 'javascript', version: '18.15.0' },
        'python': { language: 'python', version: '3.10.0' },
        'java': { language: 'java', version: '15.0.2' },
        'c': { language: 'c', version: '10.2.0' },
        'cpp': { language: 'c++', version: '10.2.0' }
    };

    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) throw new Error("Unsupported language");

    try {
        const response = await axios.post(baseUrl, {
            language: langConfig.language,
            version: langConfig.version,
            files: [
                {
                    content: code
                }
            ]
        });

        const { run } = response.data;

        // Piston returns: { run: { stdout: "...", stderr: "...", code: 0, signal: null, output: "..." } }
        // We need to map it to what frontend expects.
        // Frontend expects: res.data?.stdout || res.data?.stderr || res.data?.compile_output

        return {
            stdout: run.stdout,
            stderr: run.stderr,
            compile_output: run.output, // detailed output including both
            status: { description: run.code === 0 ? "Accepted" : "Error" }
        };

    } catch (error) {
        console.error("Piston Error:", error);
        return {
            stdout: null,
            stderr: `Error communicating with Piston API: ${error.message}`,
            status: { description: "Error" }
        };
    }
};

module.exports = { runCode };
