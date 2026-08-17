const {
    searchMemories,
} = require("./memory.service");

async function buildMemoryContext(query) {
    const memories =
        await searchMemories(query, 5);

    if (!memories.length) {
        return "";
    }

    const relevantMemories =
        memories.filter(
            (memory) =>
                Number(memory.similarity) >= 0.5
        );

    if (!relevantMemories.length) {
        return "";
    }

    return relevantMemories
        .map(
            (memory) =>
                `- ${memory.content}`
        )
        .join("\n");
}

module.exports = {
    buildMemoryContext,
};