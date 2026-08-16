const pool = require("../db");

async function createConversation(title = "New Conversation") {
    const result = await pool.query(
        `
    INSERT INTO conversations (title)
    VALUES ($1)
    RETURNING *
    `,
        [title]
    );

    return result.rows[0];
}

async function saveMessage(conversationId, role, content) {
    const result = await pool.query(
        `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
        [conversationId, role, content]
    );

    await pool.query(
        `
    UPDATE conversations
    SET updated_at = NOW()
    WHERE id = $1
    `,
        [conversationId]
    );

    return result.rows[0];
}

async function getMessages(conversationId) {
    const result = await pool.query(
        `
    SELECT role, content, created_at
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    `,
        [conversationId]
    );

    return result.rows;
}

async function getConversations() {
    const result = await pool.query(`
        SELECT
        id,
        title,
        created_at,
        updated_at
        FROM conversations
        ORDER BY updated_at DESC
    `);

    return result.rows;
}

async function getConversation(conversationId) {
    const result = await pool.query(
        `
        SELECT
        id,
        title,
        created_at,
        updated_at
        FROM conversations
        WHERE id = $1
        `,
        [conversationId]
    );

    return result.rows[0];
}

module.exports = {
    createConversation,
    saveMessage,
    getMessages,
    getConversations,
    getConversation,
};