const conversationStates =
    new Map();

function getState(conversationId) {
    if (!conversationStates.has(
        conversationId
    )) {
        conversationStates.set(
            conversationId,
            {
                mood: "neutral",
                energy: 0.5,
                engagement: 0.5,
            }
        );
    }

    return conversationStates.get(
        conversationId
    );
}

function updateState(
    conversationId,
    updates
) {
    const state =
        getState(conversationId);

    Object.assign(
        state,
        updates
    );

    return state;
}

module.exports = {
    getState,
    updateState,
};