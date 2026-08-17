const fs = require("fs");

// URL of the whisper.cpp server container (see docker-compose.whisper.yml)
const WHISPER_URL =
    process.env.WHISPER_URL || "http://localhost:9000";

async function transcribe(filePath) {
    const audioBuffer = fs.readFileSync(filePath);

    const form = new FormData();

    // --convert on the server handles webm/opus/mp4 via its bundled ffmpeg,
    // so we can send the raw recording as-is.
    form.append(
        "file",
        new Blob([audioBuffer]),
        "audio.webm"
    );

    form.append("response_format", "json");
    form.append("temperature", "0.0");
    form.append("temperature_inc", "0.2");

    const response = await fetch(
        `${WHISPER_URL}/inference`,
        {
            method: "POST",
            body: form,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `Whisper server error (${response.status}): ${errorText}`
        );
    }

    const data = await response.json();

    return (data.text || "").trim();
}

module.exports = {
    transcribe,
};
