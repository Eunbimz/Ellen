const {
    generateResponse,
} = require("./ollama.service");


const VALID_INTENTS = [
    "normal",
    "list_memories",
    "forget_memory",
];


const VALID_MOODS = [
    "neutral",
    "happy",
    "sad",
    "angry",
    "excited",
    "curious",
    "frustrated",
    "playful",
];


async function analyzeMessage(message) {

    const prompt = `
        Analyze this user message.

        Return ONLY valid JSON.

        {
        "intent": "normal",
        "forgetQuery": "",
        "shouldRemember": false,
        "memory": "",
        "memoryType": "general",
        "importance": 0.5,
        "mood": "neutral",
        "energy": 0.5,
        "engagement": 0.5
        }

        Intent:
        - normal
        - list_memories
        - forget_memory

        Use list_memories when the user asks
        what you remember about them.

        Use forget_memory when the user asks
        you to forget something.

        For forget_memory:
        put the thing to forget into forgetQuery.

        Only remember useful long-term information:
        - preferences
        - hobbies
        - goals
        - likes/dislikes
        - personal facts

        Do not remember ordinary conversation.

        Allowed moods:
        - neutral
        - happy
        - sad
        - angry
        - excited
        - curious
        - frustrated
        - playful

        energy:
        0 = very low
        1 = very high

        engagement:
        0 = disengaged
        1 = highly engaged

        USER MESSAGE:
        ${message}
    `.trim();


    const stream =
        await generateResponse(
            [
                {
                    role: "system",
                    content:
                        "Return ONLY valid JSON. No explanation.",
                },

                {
                    role: "user",
                    content: prompt,
                },
            ],
            {
                think: false,
                num_predict: 120,
            }
        );


    let result = "";


    for await (const chunk of stream) {
        console.log("ANALYZER CHUNK:", chunk);

        const content =
            chunk.message?.content || "";

        if (content) {
            result += content;
        }
    }


    console.log(
        "ANALYZER RAW RESULT:",
        JSON.stringify(result)
    );


    try {
        result = result
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        console.log(
            "ANALYZER CLEAN RESULT:",
            result
        );

        const parsed = JSON.parse(result);

        // validation
        const intent =
            VALID_INTENTS.includes(parsed.intent)
                ? parsed.intent
                : "normal";

        const mood =
            VALID_MOODS.includes(parsed.mood)
                ? parsed.mood
                : "neutral";

        let energy = Number(parsed.energy);

        if (!Number.isFinite(energy)) {
            energy = 0.5;
        }

        let engagement =
            Number(parsed.engagement);

        if (!Number.isFinite(engagement)) {
            engagement = 0.5;
        }

        let importance =
            Number(parsed.importance);

        if (!Number.isFinite(importance)) {
            importance = 0.5;
        }

        return {
            intent,

            forgetQuery:
                typeof parsed.forgetQuery === "string"
                    ? parsed.forgetQuery.trim()
                    : "",

            shouldRemember:
                parsed.shouldRemember === true,

            memory:
                typeof parsed.memory === "string"
                    ? parsed.memory.trim()
                    : "",

            memoryType:
                typeof parsed.memoryType === "string"
                    ? parsed.memoryType.trim()
                    : "general",

            importance: Math.max(
                0,
                Math.min(1, importance)
            ),

            mood,

            energy: Math.max(
                0,
                Math.min(1, energy)
            ),

            engagement: Math.max(
                0,
                Math.min(1, engagement)
            ),
        };

    } catch (error) {
        console.error(
            "Message analysis failed:",
            error
        );

        console.error(
            "Raw analyzer output:",
            result
        );

        return {
            intent: "normal",
            forgetQuery: "",

            shouldRemember: false,
            memory: "",
            memoryType: "general",
            importance: 0.5,

            mood: "neutral",
            energy: 0.5,
            engagement: 0.5,
        };
    }
}


module.exports = {
    analyzeMessage,
};