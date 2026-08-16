const express = require("express");

const {
    createMemory,
} = require("../services/memory.service");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
        content,
        type = "general",
        importance = 0.5,
        conversationId = null,
        } = req.body;

        if (!content) {
        return res.status(400).json({
            message: "Content is required",
        });
        }

        const memory =
        await createMemory({
            content,
            type,
            importance,
            conversationId,
        });

        res.status(201).json(memory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
        message: "Failed to create memory",
        });
    }
});

module.exports = router;