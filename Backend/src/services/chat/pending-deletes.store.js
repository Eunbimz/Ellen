const pendingMemoryDeletes = new Map();

function getPendingDelete(conversationId) {
    return pendingMemoryDeletes.get(conversationId);
}

function setPendingDelete(conversationId, memoryId) {
    pendingMemoryDeletes.set(conversationId, memoryId);
}

function clearPendingDelete(conversationId) {
    pendingMemoryDeletes.delete(conversationId);
}

module.exports = {
    getPendingDelete,
    setPendingDelete,
    clearPendingDelete,
};