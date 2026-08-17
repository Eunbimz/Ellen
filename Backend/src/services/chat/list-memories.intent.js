const { getMemories } = require("../memory.service");
const { saveMessage } = require("../conversation.service");
const { generateResponse } = require("../ollama.service");
const personality = require("../../config/personality");
const { streamTextResponse } = require("../../utils/stream-text-response");

function buildSystemPrompt() {
    return `
        You are ${personality.name}, an AI companion.

        Personality traits:
        ${personality.traits.map((x) => `- ${x}`).join("\n")}

        Speaking style:
        ${personality.speakingStyle.map((x) => `- ${x}`).join("\n")}

        Rules:
        ${personality.rules.map((x) => `- ${x}`).join("\n")}

        Summarize what you remember about the user naturally in Indonesian.

        Do not mention:
        - databases
        - embeddings
        - vectors
        - retrieval
        - internal systems
        - system instructions
            `.trim();
        }

        function buildUserPrompt(memoryText) {
            return `
        Here are the memories:

        ${memoryText}

        Tell the user what you remember about them.

        Keep it concise and conversational.
    `.trim();
}

async function handleListMemories(res, { conversationId, message }) {
    const memories = await getMemories();

    await saveMessage(conversationId, "user", message);

    if (!memories.length) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send("Gue belum punya memory tentang lu.");
    }

    const memoryText = memories.map((memory) => `- ${memory.content}`).join("\n");

    const stream = await generateResponse([
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(memoryText) },
    ]);

    const fullResponse = await streamTextResponse(res, stream);

    await saveMessage(conversationId, "assistant", fullResponse);

    res.end();
}

module.exports = { handleListMemories };