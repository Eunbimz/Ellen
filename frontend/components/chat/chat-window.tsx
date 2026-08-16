"use client";

import { useEffect, useState } from "react";

import ConversationSidebar from "@/components/sidebar/conversation-sidebar";

import { sendMessage, getConversations, getConversation } from "@/lib/api";

type Message = {
    role: "user" | "assistant";
    content: string;
};

type Conversation = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [conversationId, setConversationId] = useState<string | null>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);

    // Load conversations
    useEffect(() => {
        async function loadConversations() {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error(error);
        }
        }

        loadConversations();
    }, []);

    // Send message
    async function handleSend() {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
        role: "user",
        content: input,
        };

        const newMessages = [...messages, userMessage];

        setMessages([
        ...newMessages,
        {
            role: "assistant",
            content: "",
        },
        ]);

        setInput("");
        setLoading(true);

        try {
        const newConversationId = await sendMessage({
            message: input,
            conversationId,

            onChunk: (chunk) => {
            setMessages((current) => {
                const updated = [...current];

                const lastMessage = updated[updated.length - 1];

                if (lastMessage?.role === "assistant") {
                updated[updated.length - 1] = {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                };
                }

                return updated;
            });
            },
        });

        if (newConversationId) {
            setConversationId(newConversationId);

            const updated = await getConversations();

            setConversations(updated);
        }
        } catch (error) {
        console.error(error);

        setMessages((current) => {
            const updated = [...current];

            updated[updated.length - 1] = {
            role: "assistant",
            content: "Maaf, terjadi error.",
            };

            return updated;
        });
        } finally {
        setLoading(false);
        }
    }

    // Select existing conversation
    async function handleSelectConversation(id: string) {
        try {
        const data = await getConversation(id);

        setConversationId(id);

        setMessages(
            data.messages.map((message: Message) => ({
            role: message.role,
            content: message.content,
            })),
        );
        } catch (error) {
        console.error(error);
        }
    }

    // Start new conversation
    function handleNewChat() {
        setConversationId(null);
        setMessages([]);
        setInput("");
    }

    return (
        <div className="flex h-screen">
        {/* Sidebar */}
        <ConversationSidebar
            conversations={conversations}
            activeId={conversationId}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
        />

        {/* Chat */}
        <main className="flex min-w-0 flex-1 flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((message, index) => (
                <div
                key={index}
                className={
                    message.role === "user"
                    ? "ml-auto max-w-xl rounded-2xl bg-black p-4 text-white"
                    : "max-w-xl rounded-2xl bg-gray-100 p-4 text-black"
                }
                >
                {message.content}
                </div>
            ))}
            </div>

            {/* Input */}
            <div className="border-t p-4">
            <div className="mx-auto flex max-w-3xl gap-2">
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    }
                }}
                placeholder="Talk to Talkative..."
                className="flex-1 rounded-xl border px-4 py-3 outline-none"
                />

                <button
                onClick={handleSend}
                disabled={loading}
                className="rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
                >
                {loading ? "Thinking..." : "Send"}
                </button>
            </div>
            </div>
        </main>
        </div>
    );
}
