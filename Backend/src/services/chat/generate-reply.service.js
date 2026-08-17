const { generateResponse } = require("../ollama.service");
const { saveMessage } = require("../conversation.service");
const { buildContext } = require("../context.service");
const { streamTextResponse } = require("../../utils/stream-text-response");

async function generateReply(res, { conversationId, message, state }) {
    const context = await buildContext({ conversationId, message, state });

    await saveMessage(conversationId, "user", message);

    const stream = await generateResponse(context.messages, {
        think: false,
        num_predict: 256,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const fullResponse = await streamTextResponse(res, stream);

    await saveMessage(conversationId, "assistant", fullResponse);

    res.end();
}

module.exports = { generateReply };