const pool = require("../db");

const {
    generateEmbedding,
} = require("./embedding.service");

async function findSimilarMemory(content) {
    const result = await pool.query(
        `
        SELECT
            id,
            content,
            type,
            importance
        FROM memories
        WHERE LOWER(content) = LOWER($1)
        LIMIT 1
        `,
        [content.trim()]
    );

    return result.rows[0] || null;
}


function validateMemory({
    content,
    type,
    importance,
}) {
    if (
        !content ||
        typeof content !== "string"
    ) {
        return {
            valid: false,
            reason: "empty",
        };
    }

    const cleanContent =
        content.trim();

    if (cleanContent.length < 5) {
        return {
            valid: false,
            reason: "too_short",
        };
    }

    if (cleanContent.length > 500) {
        return {
            valid: false,
            reason: "too_long",
        };
    }

    const validTypes = [
        "preference",
        "fact",
        "goal",
        "hobby",
        "general",
    ];

    if (
        !validTypes.includes(type)
    ) {
        return {
            valid: false,
            reason: "invalid_type",
        };
    }

    const numericImportance =
        Number(importance);

    if (
        !Number.isFinite(
            numericImportance
        )
    ) {
        return {
            valid: false,
            reason: "invalid_importance",
        };
    }

    if (
        numericImportance < 0.6
    ) {
        return {
            valid: false,
            reason: "low_importance",
        };
    }

    return {
        valid: true,
        content: cleanContent,
        importance:
            numericImportance,
    };
}


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
        RETURNING
        id,
        content,
        memory_type,
        importance,
        source_conversation_id,
        created_at,
        updated_at
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


async function searchMemories(
    query,
    limit = 5
) {
    const embedding =
        await generateEmbedding(query);

    const vector =
        `[${embedding.join(",")}]`;

    const result = await pool.query(
        `
        SELECT
        id,
        content,
        memory_type,
        importance,
        source_conversation_id,
        1 - (embedding <=> $1::vector)
            AS similarity
        FROM memories
        ORDER BY embedding <=> $1::vector
        LIMIT $2
        `,
        [vector, limit]
    );

    return result.rows;
}

async function findSimilarMemory(
    content,
    threshold = 0.85
) {
    const embedding =
        await generateEmbedding(content);

    const vector =
        `[${embedding.join(",")}]`;

    const result = await pool.query(
        `
        SELECT
            id,
            content,
            memory_type,
            importance,
            source_conversation_id,
            1 - (embedding <=> $1::vector)
                AS similarity
        FROM memories
        WHERE 1 - (embedding <=> $1::vector)
            >= $2
        ORDER BY embedding <=> $1::vector
        LIMIT 1
        `,
        [vector, threshold]
    );

    return result.rows[0] || null;
}

async function saveMemory({
    content,
    type,
    importance,
    conversationId,
}) {
    const existing =
        await findSimilarMemory(
            content,
            0.85
        );

    if (existing) {
        const result =
            await pool.query(
                `
                UPDATE memories
                SET
                    content = $1,
                    memory_type = $2,
                    importance = GREATEST(
                        importance,
                        $3
                    ),
                    source_conversation_id = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING *
                `,
                [
                    content,
                    type,
                    importance,
                    conversationId,
                    existing.id,
                ]
            );

        console.log(
            "Memory updated:",
            content
        );

        return result.rows[0];
    }

    return createMemory({
        content,
        type,
        importance,
        conversationId,
    });
}

async function getMemories() {
    const result = await pool.query(`
        SELECT
            id,
            content,
            memory_type,
            importance,
            source_conversation_id,
            created_at,
            updated_at
        FROM memories
        ORDER BY updated_at DESC
    `);

    return result.rows;
}

async function getMemoryById(id) {
    const result = await pool.query(
        `
        SELECT
            id,
            content,
            memory_type,
            importance,
            source_conversation_id,
            created_at,
            updated_at
        FROM memories
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function deleteMemory(id) {
    const result = await pool.query(
        `
        DELETE FROM memories
        WHERE id = $1
        RETURNING id
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function updateMemory(
    id,
    {
        content,
        type,
        importance,
    }
) {
    let embedding = null;

    if (content) {
        const generated =
            await generateEmbedding(
                content
            );

        embedding =
            `[${generated.join(",")}]`;
    }

    const result = await pool.query(
        `
        UPDATE memories
        SET
            content = COALESCE(
                $1,
                content
            ),

            embedding = COALESCE(
                $2::vector,
                embedding
            ),

            memory_type = COALESCE(
                $3,
                memory_type
            ),

            importance = COALESCE(
                $4,
                importance
            ),

            updated_at = NOW()

        WHERE id = $5

        RETURNING *
        `,
        [
            content || null,
            embedding,
            type || null,
            importance ?? null,
            id,
        ]
    );

    return result.rows[0] || null;
}

module.exports = {
    createMemory,
    searchMemories,
    findSimilarMemory,
    saveMemory,

    getMemories,
    getMemoryById,
    deleteMemory,
    updateMemory,
};