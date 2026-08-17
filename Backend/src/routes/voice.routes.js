const express = require("express");
const multer = require("multer");

const {
    transcribeVoice,
} = require("../controllers/voice.controller");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
    },
});

// Field name must be "audio" to match transcribeAudio() in lib/api.ts
router.post(
    "/transcribe",
    upload.single("audio"),
    transcribeVoice
);

module.exports = router;
