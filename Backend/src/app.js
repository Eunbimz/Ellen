const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chat.routes");
const conversationRoutes = require("./routes/conversation.routes");
const memoryRoutes =  require("./routes/memory.routes");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
    })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "Talkative API",
    });
});

app.use("/api/chat", chatRoutes);

app.use(
    "/api/conversations",
    conversationRoutes
);

app.use(
    "/api/memories",
    memoryRoutes
);

module.exports = app;