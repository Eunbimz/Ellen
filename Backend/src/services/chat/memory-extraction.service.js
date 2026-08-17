const { saveMemory, findSimilarMemory, validateMemory } = require("../memory.service");

async function extractAndSaveMemory({ conversationId, analysis }) {
    if (!analysis.shouldRemember || !analysis.memory) {
        return;
    }

    try {
        const quality = validateMemory({
            content: analysis.memory,
            type: analysis.memoryType,
            importance: analysis.importance,
        });

        if (!quality.valid) {
            console.log("Memory rejected:", quality.reason);
            return;
        }

        const existingMemory = await findSimilarMemory(quality.content);

        if (existingMemory) {
            console.log("Duplicate memory skipped:", quality.content);
            return;
        }

        await saveMemory({
            content: quality.content,
            type: analysis.memoryType,
            importance: quality.importance,
            conversationId,
        });

        console.log("Memory saved:", quality.content);
    } catch (error) {
        console.error("Failed to process memory:", error);
    }
}

module.exports = { extractAndSaveMemory };