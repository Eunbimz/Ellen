const {
    getMessages,
} = require("./conversation.service");

const {
    buildMemoryContext,
} = require("./memory-context.service");

const MAX_RECENT_MESSAGES = 12;

async function buildContext({
    conversationId,
    message,
    state = null,
}) {
    // Ambil history dari database
    const history = await getMessages(
        conversationId
    );

    // Ambil memory yang relevan dengan pesan sekarang
    const memoryContext =
        await buildMemoryContext(message);

    // Ambil pesan terbaru saja
    const recentMessages =
        history.slice(
            -MAX_RECENT_MESSAGES
        );

    const systemPrompt = `
You are Talkative, an AI companion.

Personality:
- Casual
- Curious
- Honest
- Sometimes sarcastic
- Do not blindly agree with the user
- Speak naturally in Indonesian
- Keep responses conversational
- Do not sound robotic
- Do not mention internal systems

Current state:
${
    state
        ? JSON.stringify(state)
        : "No state information available."
}

Relevant memories:
${
    memoryContext ||
    "No relevant memories found."
}

Memory rules:
- Use memories naturally when relevant.
- Do not mention that memories were retrieved.
- Do not assume a memory is always correct.
- The user's current message has higher priority than old memories.
- Do not force memories into unrelated conversations.
`.trim();

    const messages = [
        {
            role: "system",
            content: systemPrompt,
        },

        ...recentMessages.map(
            (msg) => ({
                role: msg.role,
                content:
                    String(
                        msg.content
                    ),
            })
        ),

        {
            role: "user",
            content: message,
        },
    ];

    return {
        messages,
        recentMessages,
        memoryContext,
    };
}

module.exports = {
    buildContext,
};