const pool = require("../db");
const {
    generateEmbedding,
} = require("./embedding.service");

async function createMemory({
    content,
    type,
    importance,
    conversationId,
}) {
    const embedding =
        await generateEmbedding(content);

    const vector =
        `[${embedding.join(",")}]`;

    const result = await pool.query(
        `
        INSERT INTO memories (
        content,
        embedding,
        memory_type,
        importance,
        source_conversation_id
        )
        VALUES (
        $1,
        $2::vector,
        $3,
        $4,
        $5
        )
        RETURNING *
        `,
        [
        content,
        vector,
        type,
        importance,
        conversationId,
        ]
    );

    return result.rows[0];
}

module.exports = {
    createMemory,
};