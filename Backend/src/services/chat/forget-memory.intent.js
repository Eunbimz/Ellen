const { findSimilarMemory } = require("../memory.service");
const { saveMessage } = require("../conversation.service");
const { setPendingDelete } = require("./pending-deletes.store");

const SIMILARITY_THRESHOLD = 0.75;

async function handleForgetMemory(res, { conversationId, message, forgetQuery }) {
    const memory = await findSimilarMemory(forgetQuery, SIMILARITY_THRESHOLD);

    await saveMessage(conversationId, "user", message);

    if (!memory) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send("Gue nggak nemu memory yang cocok buat dihapus.");
    }

    setPendingDelete(conversationId, memory.id);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(
        `Lu mau hapus ini?\n\n"${memory.content}"\n\nBalas "iya" kalau benar.`
    );
}

module.exports = { handleForgetMemory };