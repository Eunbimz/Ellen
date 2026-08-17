const { generateResponse } = require("./ollama.service");
const {
    getMemories,
    deleteMemory,
    findSimilarMemory,
} = require("./memory.service");

async function detectMemoryCommand(message) {
    const prompt = `
        Determine whether the user is asking to manage
        their stored memories.

        Possible intents:

        - list_memories
        User asks what you remember about them.

        - forget_memory
        User asks you to forget/remove something
        from their memories.

        - none
        Normal conversation.

        Return ONLY valid JSON.

        Format:

        {
        "intent": "list_memories"
        }

        or

        {
        "intent": "forget_memory",
        "query": "what should be forgotten"
        }

        or

        {
        "intent": "none"
        }

        User message:
        ${message}
    `.trim();

    const stream =
        await generateResponse([
            {
                role: "system",
                content:
                    "You classify memory commands. Return ONLY valid JSON.",
            },
            {
                role: "user",
                content: prompt,
            },
        ]);

    let result = "";

    for await (const chunk of stream) {
        result +=
            chunk.message?.content || "";
    }

    try {
        result = result
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsed =
            JSON.parse(result);

        if (
            parsed.intent ===
            "list_memories"
        ) {
            return {
                intent: "list_memories",
            };
        }

        if (
            parsed.intent ===
            "forget_memory" &&
            typeof parsed.query ===
            "string"
        ) {
            return {
                intent: "forget_memory",
                query:
                    parsed.query.trim(),
            };
        }

        return {
            intent: "none",
        };
    } catch {
        return {
            intent: "none",
        };
    }
}

async function handleMemoryCommand(
    message
) {
    const command =
        await detectMemoryCommand(
            message
        );

    if (
        command.intent ===
        "list_memories"
    ) {
        const memories =
            await getMemories();

        return {
            handled: true,
            type: "list",
            memories,
        };
    }

    if (
        command.intent ===
        "forget_memory" &&
        command.query
    ) {
        const memory =
            await findSimilarMemory(
                command.query,
                0.75
            );

        if (!memory) {
            return {
                handled: true,
                type: "forget",
                memory: null,
            };
        }

        return {
            handled: true,
            type: "forget",
            memory,
        };
    }

    return {
        handled: false,
    };
}

module.exports = {
    detectMemoryCommand,
    handleMemoryCommand,
};