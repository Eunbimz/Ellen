const express = require("express");

const {
    createMemory,
    searchMemories,
    getMemories,
    getMemoryById,
    deleteMemory,
    updateMemory,
} = require("../services/memory.service");

const router = express.Router();

const {
    extractMemory,
} = require("../services/memory-extractor.service");

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

router.get("/", async (req, res) => {
    try {
        const memories =
            await getMemories();

        res.json(memories);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch memories",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const memory =
            await getMemoryById(
                req.params.id
            );

        if (!memory) {
            return res.status(404).json({
                message:
                    "Memory not found",
            });
        }

        res.json(memory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to fetch memory",
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const {
            content,
            type,
            importance,
        } = req.body;

        if (
            importance !== undefined &&
            (
                typeof importance !==
                "number" ||
                importance < 0 ||
                importance > 1
            )
        ) {
            return res.status(400).json({
                message:
                    "Importance must be between 0 and 1",
            });
        }

        const memory =
            await updateMemory(
                req.params.id,
                {
                    content,
                    type,
                    importance,
                }
            );

        if (!memory) {
            return res.status(404).json({
                message:
                    "Memory not found",
            });
        }

        res.json(memory);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to update memory",
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const memory =
            await deleteMemory(
                req.params.id
            );

        if (!memory) {
            return res.status(404).json({
                message:
                    "Memory not found",
            });
        }

        res.json({
            message:
                "Memory deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to delete memory",
        });
    }
});

router.get("/search", async (req, res) => {
    try {
        const {
            q,
            limit = 5,
        } = req.query;

        if (!q) {
            return res.status(400).json({
                message: "Query is required",
            });
        }

        const memories =
            await searchMemories(
                q,
                Number(limit)
            );

        res.json(memories);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to search memories",
        });
    }
});

router.post("/extract", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message is required",
            });
        }

        const result =
            await extractMemory(message);

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message:
                "Failed to extract memory",
        });
    }
});

module.exports = router;