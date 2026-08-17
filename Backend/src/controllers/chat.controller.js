const { createConversation, saveMessage } = require("../services/conversation.service");
const { getState, updateState } = require("../services/state.service");
const { analyzeMessage } = require("../services/message-analyzer.service");
const { getPendingDelete } = require("../services/chat/pending-deletes.store");

const {
    isDeleteConfirmation,
    handleConfirmDelete,
} = require("../services/chat/confirm-delete.intent");

const { handleListMemories } = require("../services/chat/list-memories.intent");
const { handleForgetMemory } = require("../services/chat/forget-memory.intent");
const { extractAndSaveMemory } = require("../services/chat/memory-extraction.service");
const { generateReply } = require("../services/chat/generate-reply.service");

async function chat(req, res) {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== "string") {
            return res.status(400).json({ message: "Message is required" });
        }

        let currentConversationId = conversationId;

        if (!currentConversationId) {
            const conversation = await createConversation(message.slice(0, 50));
            currentConversationId = conversation.id;
        }

        res.setHeader("X-Conversation-Id", currentConversationId);

        const analysis = await analyzeMessage(message);

        updateState(currentConversationId, {
            mood: analysis.mood,
            energy: analysis.energy,
            engagement: analysis.engagement,
        });

        const state = getState(currentConversationId);

        const pendingMemoryId = getPendingDelete(currentConversationId);

        if (pendingMemoryId && isDeleteConfirmation(message)) {
            return handleConfirmDelete(res, {
                conversationId: currentConversationId,
                message,
                pendingMemoryId,
            });
        }

        if (analysis.intent === "list_memories") {
            return handleListMemories(res, {
                conversationId: currentConversationId,
                message,
            });
        }

        if (analysis.intent === "forget_memory") {
            return handleForgetMemory(res, {
                conversationId: currentConversationId,
                message,
                forgetQuery: analysis.forgetQuery,
            });
        }

        await extractAndSaveMemory({ conversationId: currentConversationId, analysis });

        await generateReply(res, {
            conversationId: currentConversationId,
            message,
            state,
        });
    } catch (error) {
        console.error("Chat controller error:", error);

        if (!res.headersSent) {
            res.status(500).json({ message: "Failed to generate response" });
        } else {
            res.end();
        }
    }
}

module.exports = { chat };