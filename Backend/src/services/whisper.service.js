const fs = require("fs");

const WHISPER_URL =
    process.env.WHISPER_URL;

async function transcribe(filePath) {
    const audioBuffer = fs.readFileSync(filePath);

    const form = new FormData();

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
