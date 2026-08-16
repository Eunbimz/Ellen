const {
    createConversation,
    getConversations,
    getConversation,
    getMessages,
} = require("../services/conversation.service");

async function create(req, res) {
    try {
        const conversation =
        await createConversation();

        res.status(201).json(conversation);
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message: "Failed to create conversation",
        });
    }
}

async function list(req, res) {
    try {
        const conversations =
        await getConversations();

        res.json(conversations);
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message: "Failed to get conversations",
        });
    }
}

async function getById(req, res) {
    try {
        const { id } = req.params;

        const conversation =
        await getConversation(id);

        if (!conversation) {
        return res.status(404).json({
            message: "Conversation not found",
        });
        }

        const messages =
        await getMessages(id);

        res.json({
        conversation,
        messages,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message: "Failed to get conversation",
        });
    }
}

module.exports = {
    create,
    list,
    getById,
};