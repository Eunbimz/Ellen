const fs = require("fs");
const os = require("os");
const path = require("path");
const { randomUUID } = require("crypto");

const {
    transcribe,
} = require("../services/whisper.service");

async function transcribeVoice(req, res) {
    let tempFilePath = null;

    try {
        if (!req.file || !req.file.buffer?.length) {
            return res.status(400).json({
                message: "Audio file is required",
            });
        }

        const extension =
            req.file.mimetype?.includes("mp4")
                ? "mp4"
                : "webm";

        tempFilePath = path.join(
            os.tmpdir(),
            `voice-${randomUUID()}.${extension}`
        );

        fs.writeFileSync(
            tempFilePath,
            req.file.buffer
        );

        const text = await transcribe(tempFilePath);

        res.json({ text });
    } catch (error) {
        console.error(
            "Voice controller error:",
            error
        );

        res.status(500).json({
            message: "Failed to transcribe audio",
        });
    } finally {

        if (tempFilePath) {
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                    console.error(
                        "Failed to remove temp audio file:",
                        err
                    );
                }
            });
        }
    }
}

module.exports = {
    transcribeVoice,
};
