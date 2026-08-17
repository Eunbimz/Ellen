const {
    generateResponse,
} = require("./ollama.service");

async function extractState(message) {
    const prompt = `
        Analyze the user's emotional tone.

        Return ONLY valid JSON.

        Format:

        {
        "mood": "neutral",
        "energy": 0.5,
        "engagement": 0.5
        }

        Allowed mood:
        neutral
        happy
        sad
        angry
        excited
        curious
        frustrated
        playful

        energy:
        0 = very low
        1 = very high

        engagement:
        0 = disengaged
        1 = highly engaged

        User message:
        ${message}
    `.trim();

    const stream =
        await generateResponse([
            {
                role: "system",
                content:
                    "You classify emotional state. Return ONLY JSON.",
            },
            {
                role: "user",
                content: prompt,
            },
        ]);

    let result = "";

    for await (
        const chunk of stream
    ) {
        result +=
            chunk.message?.content ||
            "";
    }

    try {
        result = result
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const parsed =
            JSON.parse(result);

        const moods = [
            "neutral",
            "happy",
            "sad",
            "angry",
            "excited",
            "curious",
            "frustrated",
            "playful",
        ];

        const mood =
            moods.includes(
                parsed.mood
            )
                ? parsed.mood
                : "neutral";

        const energy =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        parsed.energy
                    ) || 0.5
                )
            );

        const engagement =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(
                        parsed.engagement
                    ) || 0.5
                )
            );

        return {
            mood,
            energy,
            engagement,
        };
    } catch {
        return {
            mood: "neutral",
            energy: 0.5,
            engagement: 0.5,
        };
    }
}

module.exports = {
    extractState,
};