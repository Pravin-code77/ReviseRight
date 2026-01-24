const { runCode } = require('../utils/compilerService');

exports.run = async (req, res) => {
    try {
        const { language, code } = req.body;
        const result = await runCode(language, code);
        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
