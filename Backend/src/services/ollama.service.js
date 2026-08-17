const { Ollama } = require("ollama");

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST,
});

async function generateResponse(
    messages,
    options = {}
) {
    return ollama.chat({
        model: process.env.OLLAMA_MODEL,

        messages,

        stream: true,

        think:
            options.think ?? false,

        options: {
            num_predict:
                options.num_predict ?? 256,
        },
    });
}

module.exports = {
    generateResponse,
};