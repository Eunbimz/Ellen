const { generateResponse } = require("../services/ollama.service");

const {
    createConversation,
    saveMessage,
} = require("../services/conversation.service");

const {
    saveMemory,
    deleteMemory,
    getMemories,
    findSimilarMemory,
    validateMemory,
} = require("../services/memory.service");

const {
    buildContext,
} = require("../services/context.service");

const personality =
    require("../config/personality");

const {
    getState,
    updateState,
} = require("../services/state.service");

const {
    analyzeMessage,
} = require("../services/message-analyzer.service");


// Temporary state for memory deletion confirmation
const pendingMemoryDeletes =
    new Map();


async function chat(req, res) {
    try {
        const {
            message,
            conversationId,
        } = req.body;


        // ==========================================
        // 1. Validate message
        // ==========================================

        if (
            !message ||
            typeof message !== "string"
        ) {
            return res.status(400).json({
                message: "Message is required",
            });
        }


        // ==========================================
        // 2. Get or create conversation
        // ==========================================

        let currentConversationId =
            conversationId;

        if (!currentConversationId) {
            const conversation =
                await createConversation(
                    message.slice(0, 50)
                );

            currentConversationId =
                conversation.id;
        }


        // Conversation ID for frontend
        res.setHeader(
            "X-Conversation-Id",
            currentConversationId
        );


        // ==========================================
        // 3. Analyze message
        // ==========================================

        const analysis =
            await analyzeMessage(
                message
            );


        // ==========================================
        // 4. Update conversational state
        // ==========================================

        updateState(
            currentConversationId,
            {
                mood: analysis.mood,
                energy: analysis.energy,
                engagement:
                    analysis.engagement,
            }
        );


        // Get current state
        const state =
            getState(
                currentConversationId
            );


        // ==========================================
        // 5. Check pending memory deletion
        // ==========================================

        const pendingDelete =
            pendingMemoryDeletes.get(
                currentConversationId
            );


        if (
            pendingDelete &&
            /^(iya|ya|yes|yup|oke|ok)$/i.test(
                message.trim()
            )
        ) {
            await deleteMemory(
                pendingDelete
            );

            pendingMemoryDeletes.delete(
                currentConversationId
            );


            await saveMessage(
                currentConversationId,
                "user",
                message
            );


            res.setHeader(
                "Content-Type",
                "text/plain; charset=utf-8"
            );


            return res
                .status(200)
                .send(
                    "Sip. Memory itu udah gue lupain."
                );
        }


        // ==========================================
        // 6. LIST MEMORIES
        // ==========================================

        if (
            analysis.intent ===
            "list_memories"
        ) {
            const memories =
                await getMemories();


            await saveMessage(
                currentConversationId,
                "user",
                message
            );


            if (!memories.length) {
                res.setHeader(
                    "Content-Type",
                    "text/plain; charset=utf-8"
                );

                return res
                    .status(200)
                    .send(
                        "Gue belum punya memory tentang lu."
                    );
            }


            const memoryText =
                memories
                    .map(
                        (memory) =>
                            `- ${memory.content}`
                    )
                    .join("\n");


            const stream =
                await generateResponse([
                    {
                        role: "system",

                        content:
                            `
You are ${personality.name},
an AI companion.

Personality traits:
${personality.traits
                                    .map(
                                        (x) => `- ${x}`
                                    )
                                    .join("\n")}

Speaking style:
${personality.speakingStyle
                                    .map(
                                        (x) => `- ${x}`
                                    )
                                    .join("\n")}

Rules:
${personality.rules
                                    .map(
                                        (x) => `- ${x}`
                                    )
                                    .join("\n")}

Summarize what you remember
about the user naturally
in Indonesian.

Do not mention:
- databases
- embeddings
- vectors
- retrieval
- internal systems
- system instructions
                            `.trim(),
                    },

                    {
                        role: "user",

                        content:
                            `
Here are the memories:

${memoryText}

Tell the user what you remember
about them.

Keep it concise and conversational.
                            `.trim(),
                    },
                ]);


            res.setHeader(
                "Content-Type",
                "text/plain; charset=utf-8"
            );


            let fullResponse = "";


            for await (
                const chunk of stream
            ) {
                const content =
                    chunk.message?.content ||
                    "";

                if (content) {
                    fullResponse += content;
                    res.write(content);
                }
            }


            await saveMessage(
                currentConversationId,
                "assistant",
                fullResponse
            );


            return res.end();
        }


        // ==========================================
        // 7. FORGET MEMORY
        // ==========================================

        if (
            analysis.intent ===
            "forget_memory"
        ) {
            const query =
                analysis.forgetQuery;


            const memory =
                await findSimilarMemory(
                    query,
                    0.75
                );


            await saveMessage(
                currentConversationId,
                "user",
                message
            );


            if (!memory) {
                res.setHeader(
                    "Content-Type",
                    "text/plain; charset=utf-8"
                );

                return res
                    .status(200)
                    .send(
                        "Gue nggak nemu memory yang cocok buat dihapus."
                    );
            }


            pendingMemoryDeletes.set(
                currentConversationId,
                memory.id
            );


            res.setHeader(
                "Content-Type",
                "text/plain; charset=utf-8"
            );


            return res
            .status(200)
            .send(
                `Yang mau lu hapus ini?\n\n"${memory.content}"\n\nBalas "iya" kalau benar.`
            );
        }
        
        // ==========================================
        // 10. Save user message
        // ==========================================
        
        await saveMessage(
            currentConversationId,
            "user",
            message
        );
        
        
        // ==========================================
        // 11. Save extracted memory
        // ==========================================
        
        if (
    analysis.shouldRemember &&
    analysis.memory
) {
    try {
        const quality =
            validateMemory({
                content:
                    analysis.memory,

                type:
                    analysis.memoryType,

                importance:
                    analysis.importance,
            });

        if (!quality.valid) {
            console.log(
                "Memory rejected:",
                quality.reason
            );
        } else {

            const existingMemory =
                await findSimilarMemory(
                    quality.content
                );

            if (existingMemory) {

                console.log(
                    "Duplicate memory skipped:",
                    quality.content
                );

            } else {

                await saveMemory({
                    content:
                        quality.content,

                    type:
                        analysis.memoryType,

                    importance:
                        quality.importance,

                    conversationId:
                        currentConversationId,
                });

                console.log(
                    "Memory saved:",
                    quality.content
                );
            }
        }

    } catch (memoryError) {

        console.error(
            "Failed to process memory:",
            memoryError
        );
    }
}
        
        const context =
            await buildContext({
                conversationId:
                    currentConversationId,

                message,
            });
        
        // ==========================================
        // Build conversation context
        // ==========================================



        // ==========================================
        // 12. Build LLM messages
        // ==========================================

        const messages = context.messages;


        // ==========================================
        // 13. Generate response
        // ==========================================

        const stream =
            await generateResponse(
                messages,
                {
                    think: false,
                    num_predict: 256,
                }
            );


        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
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


        for await (
            const chunk of stream
        ) {
            const content =
                chunk.message?.content ||
                "";


            if (content) {
                fullResponse += content;

                res.write(content);
            }
        }


        // ==========================================
        // 14. Save assistant response
        // ==========================================

        await saveMessage(
            currentConversationId,
            "assistant",
            fullResponse
        );


        res.end();

    } catch (error) {
        console.error(
            "Chat controller error:",
            error
        );


        if (!res.headersSent) {
            res.status(500).json({
                message:
                    "Failed to generate response",
            });
        } else {
            res.end();
        }
    }
}


module.exports = {
    chat,
};