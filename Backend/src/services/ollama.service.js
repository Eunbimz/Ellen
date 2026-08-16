const { Ollama } = require("ollama");

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST,
});

async function generateResponse(messages) {
    return ollama.chat({
        model: process.env.OLLAMA_MODEL,
        messages,
        stream: true,
    });
}

module.exports = {
    generateResponse,
};