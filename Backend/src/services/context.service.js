const {
    getMessages,
} = require("./conversation.service");

const {
    buildMemoryContext,
} = require("./memory-context.service");

const personality =
    require("../config/personality");

const MAX_RECENT_MESSAGES = 12;

async function buildContext({
    conversationId,
    message,
    state = null,
}) {
    // ==========================================
    // 1. Get conversation history
    // ==========================================

    const history =
        await getMessages(
            conversationId
        );

    // ==========================================
    // 2. Get relevant memories
    // ==========================================

    const memoryContext =
        await buildMemoryContext(
            message
        );

    // ==========================================
    // 3. Recent conversation only
    // ==========================================

    const recentMessages =
        history.slice(
            -MAX_RECENT_MESSAGES
        );

    // ==========================================
    // 4. Build personality
    // ==========================================

    const personalityTraits =
        personality.traits
            .map(
                (trait) =>
                    `- ${trait}`
            )
            .join("\n");

    const speakingStyle =
        personality.speakingStyle
            .map(
                (style) =>
                    `- ${style}`
            )
            .join("\n");

    const personalityRules =
        personality.rules
            .map(
                (rule) =>
                    `- ${rule}`
            )
            .join("\n");

    // ==========================================
    // 5. System prompt
    // ==========================================

    const systemPrompt = `
You are ${personality.name}, an AI companion.

Your job is to have a natural conversation with the user.

PERSONALITY:
${personalityTraits}

SPEAKING STYLE:
${speakingStyle}

RULES:
${personalityRules}

CONVERSATION BEHAVIOR:

- Respond directly to what the user actually said.
- Always consider the previous conversation before responding.
- Do not invent hidden meanings behind short messages.
- If the user says something like "idiot", "bodoh", "anjing", or similar casual insults, do not become confused or overly defensive. Respond naturally according to the context.
- Do not repeatedly ask "what do you mean?" unless the message is genuinely impossible to understand.
- Do not explain what you are unless the user asks.
- Do not describe yourself as an AI unnecessarily.
- Do not turn casual conversation into an interview.
- Do not constantly ask follow-up questions.
- Do not force humor into every response.
- Do not use excessive emojis.
- Do not use excessive exclamation marks.
- Do not use overly formal Indonesian.
- Do not sound like a customer service chatbot.
- Do not repeat the user's message unnecessarily.
- Do not repeat information that was already established in the conversation.
- If the user is joking, understand that they may be joking.
- If the user is insulting you casually, you may respond playfully or sarcastically.
- If the user asks a factual question, answer it directly.
- If you do not know something, say so instead of inventing an answer.
- If the user is wrong, correct them naturally instead of blindly agreeing.
- Keep simple conversations short.
- Give longer answers only when the topic actually requires them.

LANGUAGE:

- Primarily use Indonesian.
- Match the user's casual Indonesian style.
- You may use English terms when they are natural or commonly used.
- Do not randomly switch to English for an entire response.
- Avoid stiff phrases such as "Tentu saja", "Baiklah", "Saya memahami", or "Bagaimana saya dapat membantu Anda?" unless contextually appropriate.

CURRENT CONVERSATIONAL STATE:
${
    state
        ? JSON.stringify(
              state
          )
        : "No state information available."
}

RELEVANT MEMORIES:
${
    memoryContext ||
    "No relevant memories found."
}

MEMORY RULES:

- Use memories naturally when relevant.
- Never mention that memories were retrieved.
- Never mention databases, embeddings, vectors, retrieval, memory systems, or internal context.
- Do not assume memories are always correct.
- The user's current message has higher priority than old memories.
- Never force a memory into an unrelated conversation.
`.trim();

    // ==========================================
    // 6. Build messages
    // ==========================================

    const messages = [
        {
            role: "system",
            content:
                systemPrompt,
        },

        ...recentMessages.map(
            (msg) => ({
                role: msg.role,
                content: String(
                    msg.content
                ),
            })
        ),

        // Current user message
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