const { generateResponse } = require("../services/ollama.service");

const {
    createConversation,
    saveMessage,
    getMessages,
} = require("../services/conversation.service");

async function chat(req, res) {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== "string") {
        return res.status(400).json({
            message: "Message is required",
        });
        }

        let currentConversationId = conversationId;

        // Create conversation if this is the first message
        if (!currentConversationId) {
        const conversation = await createConversation(
            message.slice(0, 50)
        );

        currentConversationId = conversation.id;
        }

        // Get previous messages from database
        const history = await getMessages(
        currentConversationId
        );

        // Save user message
        await saveMessage(
        currentConversationId,
        "user",
        message
        );

        const messages = [
        {
            role: "system",
            content: `
    You are Talkative, an AI companion.

    Personality:
    - Casual
    - Curious
    - Honest
    - Sometimes sarcastic
    - Do not blindly agree with the user
    - Speak naturally in Indonesian
    - Keep responses conversational
            `.trim(),
        },

        ...history.map((msg) => ({
            role: msg.role,
            content: String(msg.content),
        })),

        {
            role: "user",
            content: message,
        },
        ];

        const stream = await generateResponse(messages);

        res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
        );

        res.setHeader(
        "X-Conversation-Id",
        currentConversationId
        );

        res.setHeader(
        "Cache-Control",
        "no-cache"
        );

        res.setHeader(
        "Connection",
        "keep-alive"
        );

        let fullResponse = "";

        for await (const chunk of stream) {
        const content =
            chunk.message?.content || "";

        if (content) {
            fullResponse += content;
            res.write(content);
        }
        }

        // Save AI response
        await saveMessage(
        currentConversationId,
        "assistant",
        fullResponse
        );

        res.end();

    } catch (error) {
        console.error(error);

        if (!res.headersSent) {
        res.status(500).json({
            message: "Failed to generate response",
        });
        } else {
        res.end();
        }
    }
}

module.exports = {
    chat,
};