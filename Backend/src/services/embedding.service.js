const { Ollama } = require("ollama");

const ollama = new Ollama({
    host:
    process.env.OLLAMA_HOST,
});

async function generateEmbedding(text) {
    const response =
        await ollama.embed({
        model:
            process.env.OLLAMA_EMBED_MODEL,

        input: text,
        });

    return response.embeddings[0];
}

module.exports = {
    generateEmbedding,    
};