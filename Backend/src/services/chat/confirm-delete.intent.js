const { deleteMemory } = require("../memory.service");
const { saveMessage } = require("../conversation.service");
const { clearPendingDelete } = require("./pending-deletes.store");

const CONFIRMATION_REGEX = /^(iya|ya|yes|yup|oke|ok)$/i;

function isDeleteConfirmation(message) {
    return CONFIRMATION_REGEX.test(message.trim());
}

async function handleConfirmDelete(res, { conversationId, message, pendingMemoryId }) {
    await deleteMemory(pendingMemoryId);
    clearPendingDelete(conversationId);

    await saveMessage(conversationId, "user", message);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("Sip. Memory itu udah gue lupain.");
}

module.exports = { isDeleteConfirmation, handleConfirmDelete };