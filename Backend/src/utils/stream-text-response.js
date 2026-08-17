async function streamTextResponse(res, stream) {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    let fullResponse = "";

    for await (const chunk of stream) {
        const content = chunk.message?.content || "";

        if (content) {
            fullResponse += content;
            res.write(content);
        }
    }

    return fullResponse;
}

module.exports = { streamTextResponse };