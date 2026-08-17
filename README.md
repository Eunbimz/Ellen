# Project Ellen

Ellen is a local AI companion application designed for natural, conversational interaction. It supports persistent conversation history, long-term memory, personality, contextual responses, and voice interaction while running locally through Docker.

The project was developed as an exploration of building a more personalized AI assistant rather than a simple chatbot.

------------------------------------------------------------------------

## Features

- 💬 **Conversational Chat**  Chat naturally with Ellen.
- 🗂️ **Conversation History**  Conversations are stored and can be accessed later.
- 🧠 **Long-Term Memory**  Ellen can remember relevant information about the user.
- 🗑️ **Memory Management**  Users can view and forget stored memories.
- 🎭 **AI Personality**  Configurable personality and conversational style.
- 🔊 **Voice Output**  Converts AI responses into speech.
- 🎙️ **Voice Input**  Records audio and converts it into text using Whisper.
- 🧩 **Context Awareness**  Combines recent conversation history, relevant memories, and conversational state.
- 🐳 **Docker Support**  The application can be developed and run using Docker Compose.

## Model Used During Development

The primary language model used during development is [**Qwen 3.5:0.8b**](https://ollama.com/library/qwen3.5:0.8b), running locally through **Ollama**.

For speech recognition, the project uses **Whisper** to convert recorded voice input into text.

The models are run locally, so normal conversations do not require an external LLM API.

The model can be changed through the project's configuration/environment variables.

## Limitations

- The quality of responses is limited by the locally running language model.
- Smaller local models may produce less accurate or less detailed responses than larger models.
- Voice recognition accuracy depends on microphone quality, background noise, and the Whisper model.
- Voice features require browser microphone permission and compatible browser support.
- Long-term memory is not guaranteed to be perfectly accurate and may occasionally store irrelevant information.
- The project is primarily intended for local development and personal use.
- Running local AI models requires sufficient system resources, especially RAM and GPU VRAM.

------------------------------------------------------------------------

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express.js
- JavaScript
- Ollama
- Qwen 3.5
- Whisper
- PostgreSQL
- Vector-based memory retrieval
- Docker & Docker Compose

------------------------------------------------------------------------

## Project Structure

```text
Project Ellen/
├── Backend/
│   ├── db/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   └── personality.js
│   │   ├── controllers/
│   │   │   ├── chat.controller.js
│   │   │   ├── conversation.controller.js
│   │   │   └── voice.controller.js
│   │   ├── db/
│   │   ├── routes/
│   │   │   ├── chat.routes.js
│   │   │   ├── conversation.routes.js
│   │   │   ├── memory.routes.js
│   │   │   └── voice.routes.js
│   │   ├── services/
│   │   │   ├── chat/
│   │   │   │   ├── confirm-delete.intent.js
│   │   │   │   ├── forget-memory.intent.js
│   │   │   │   ├── generate-reply.service.js
│   │   │   │   ├── list-memories.intent.js
│   │   │   │   ├── memory-extraction.service.js
│   │   │   │   └── pending-deletes.store.js
│   │   │   ├── context.service.js
│   │   │   ├── conversation.service.js
│   │   │   ├── embedding.service.js
│   │   │   ├── memory-command.service.js
│   │   │   ├── memory-context.service.js
│   │   │   ├── memory-extractor.service.js
│   │   │   ├── memory.service.js
│   │   │   ├── message-analyzer.service.js
│   │   │   ├── ollama.service.js
│   │   │   ├── state-extractor.service.js
│   │   │   ├── state.service.js
│   │   │   └── whisper.service.js
│   │   ├── utils/
│   │   │   └── stream-text-response.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .dockerignore
│   ├── .env
│   ├── Dockerfile
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-composer.tsx
│   │   │   ├── chat-header.tsx
│   │   │   ├── chat-window.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── icons.tsx
│   │   │   ├── message-list.tsx
│   │   │   └── types.ts
│   │   └── sidebar/
│   │       ├── conversation-list-item.tsx
│   │       ├── conversation-list.tsx
│   │       ├── conversation-sidebar.tsx
│   │       ├── new-chat-button.tsx
│   │       ├── sidebar-footer.tsx
│   │       ├── sidebar-header.tsx
│   │       └── sidebar-overlay.tsx
│   ├── hooks/
│   │   ├── use-chat.ts
│   │   └── use-voice-recording.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── speech.ts
│   ├── node_modules/
│   ├── public/
│   ├── .dockerignore
│   ├── .env.local
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── CLAUDE.md
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

The frontend handles the user interface and interaction, while the backend manages conversations, memory, context processing, AI generation, voice processing, and API requests.

------------------------------------------------------------------------

## Running the Project via Docker

### Requirements

Make sure the following are installed:

- Docker Desktop
- Git

Clone the repository:

```bash
git clone https://github.com/Eunbimz/Ellen.git
cd "Project Ellen"
```

Then:
```bash
cd Backend
```

Create the required environment files based on the project's configuration. Or:

```bash
cp .env.example .env
```
For linux.

```bash
Copy-Item .env.example .env
```
For Windows

Then:
```bash
cd frontend
```

Create the required environment files based on the project's configuration. Or:

```bash
cp .env.local.example .env.local
```
For linux.

```bash
Copy-Item .env.local.example .env.local
```
For Windows

Then run:

```bash
docker compose up --build
```

Open the application at:

```text
http://localhost:3000
```

To stop the project:

```bash
docker compose down
```

To rebuild from scratch:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

> Make sure the environment variables and ports match your `docker-compose.yml` configuration.

## Running the Project Manually

### Backend

Enter the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables in `.env`, then start the backend:

```bash
npm run dev
```

The backend runs according to the configured port, commonly:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

------------------------------------------------------------------------

## Usage and System Flow

The basic interaction flow is:

1. The user sends a message through the frontend.
2. The frontend sends the message and conversation ID to the backend.
3. The backend creates a new conversation if no conversation ID exists.
4. The message is analyzed for intent, mood, energy, engagement, and possible memory.
5. Relevant memories are retrieved when necessary.
6. Recent conversation history is combined with memory and conversational state.
7. The resulting context is sent to Ollama.
8. Qwen generates the response locally.
9. The response is streamed back to the frontend.
10. The user and assistant messages are saved to the database.
11. If voice output is enabled, the response can be converted into speech.
12. For voice input, recorded audio is sent to Whisper and converted into text before being sent as a normal chat message.

### Flow System


``` text
                    User
                      │
                      ▼
              ┌──────────────┐
              │   Next.js    │
              │   Frontend   │
              └──────┬───────┘
                     │
                     │ HTTP Request
                     ▼
              ┌──────────────┐
              │   Express    │
              │   Backend    │
              └──────┬───────┘
                     │
                     ├── Conversation History
                     ├── Memory Retrieval
                     ├── Message Analysis
                     ├── Conversational State
                     │
                     ▼
              ┌──────────────┐
              │    Context   │
              │    Builder   │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │    Ollama    │
              │     Qwen     │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │      AI      │
              │   Response   │
              └──────┬───────┘
                     │
                     ▼
              Save to PostgreSQL
                     │
                     ▼
              Stream to Frontend
```


For voice input:
``` text
                Microphone
                     │
                     ▼
              ┌──────────────┐
              │   Frontend   │
              │   Recording  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │    Whisper   │
              │              │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ Transcribed  │
              │    Text      │
              └──────┬───────┘
                     │
                     ▼
              Normal Chat Flow
                     │
                     ▼
              Stream to Frontend
```

------------------------------------------------------------------------

## License

This project is developed for educational and development purposes.
