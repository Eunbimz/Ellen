const { generateResponse } = require("./ollama.service");

function normalizeMemory(result) {
    if (!result || typeof result !== "object") {
        return {
            shouldRemember: false,
            memory: "",
            type: "",
            importance: 0,
        };
    }

    const shouldRemember =
        result.shouldRemember === true;

    if (!shouldRemember) {
        return {
            shouldRemember: false,
            memory: "",
            type: "",
            importance: 0,
        };
    }

    const memory =
        typeof result.memory === "string"
            ? result.memory.trim()
            : "";

    const type =
        typeof result.type === "string"
            ? result.type.trim()
            : "general";

    let importance =
        Number(result.importance);

    if (Number.isNaN(importance)) {
        importance = 0.5;
    }

    importance = Math.max(
        0,
        Math.min(1, importance)
    );

    if (!memory) {
        return {
            shouldRemember: false,
            memory: "",
            type: "",
            importance: 0,
        };
    }

    return {
        shouldRemember: true,
        memory,
        type,
        importance,
    };
}

async function extractMemory(message) {
    const prompt = `
Analyze this user message.

Determine whether it contains information
worth remembering about the user for future
conversations.

Remember things such as:
- Name or nickname
- Likes and dislikes
- Personal preferences
- Hobbies
- Long-term goals
- Important personal facts
- Frequently relevant interests

Do NOT remember:
- Greetings
- Questions
- Jokes
- Casual conversation
- Temporary statements
- Information unrelated to the user

Return ONLY valid JSON.

If it should be remembered:
{
  "shouldRemember": true,
  "memory": "short factual statement",
  "type": "preference",
  "importance": 0.8
}

If it should NOT be remembered:
{
  "shouldRemember": false,
  "memory": "",
  "type": "",
  "importance": 0
}

User message:
${message}
`.trim();

    const stream =
        await generateResponse([
            {
                role: "system",
                content:
                    "You extract long-term user memories. Return ONLY valid JSON.",
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

        return normalizeMemory(parsed);
    } catch (error) {
        console.error(
            "Memory extraction failed:",
            result
        );

        return {
            shouldRemember: false,
            memory: "",
            type: "",
            importance: 0,
        };
    }
}

module.exports = {
    extractMemory,
};