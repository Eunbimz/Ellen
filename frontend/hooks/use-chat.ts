"use client";

import { useEffect, useRef, useState } from "react";

import { getConversation, getConversations, sendMessage } from "@/lib/api";
import { speak, stopSpeaking } from "@/lib/speech";
import type { Conversation, Message } from "@/components/chat/types";

/**
 * Owns conversation list/state, message history, and the send/select/new-chat
 * flows. UI-only state (like whether the mobile sidebar is open) stays in
 * the component that renders it.
 */
export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [voiceEnabled, setVoiceEnabled] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    // Load conversations on mount
    useEffect(() => {
        async function loadConversations() {
            try {
                const data = await getConversations();
                setConversations(data);
            } catch (error) {
                console.error("Failed to load conversations:", error);
            }
        }

        loadConversations();
    }, []);

    async function handleSend(messageOverride?: string) {
        const trimmed = (messageOverride ?? input).trim();

        if (!trimmed || loading) {
            return;
        }

        const userMessage: Message = { role: "user", content: trimmed };

        setMessages((current) => [
            ...current,
            userMessage,
            { role: "assistant", content: "" },
        ]);

        setInput("");
        setLoading(true);

        try {
            let assistantResponse = "";

            const newConversationId = await sendMessage({
                message: trimmed,
                conversationId,
                onChunk: (chunk) => {
                    assistantResponse += chunk;

                    setMessages((current) => {
                        const updated = [...current];
                        const last = updated[updated.length - 1];

                        if (last?.role === "assistant") {
                        updated[updated.length - 1] = {
                            ...last,
                            content: last.content + chunk,
                        };
                    }

                    return updated;
                    });
                },
            });

            if (voiceEnabled && assistantResponse.trim()) {
                speak(assistantResponse);
            }

            if (newConversationId) {
                setConversationId(newConversationId);

                const updated = await getConversations();
                setConversations(updated);
            }
        } catch (error) {
            console.error("Failed to send message:", error);

            setMessages((current) => {
                const updated = [...current];
                const last = updated[updated.length - 1];

                if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: "Maaf, terjadi error. Coba lagi.",
                    };
                }

                return updated;
            });
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    async function handleSelectConversation(id: string) {
        if (loading) {
        return;
        }

        stopSpeaking();

        try {
            const data = await getConversation(id);

            setConversationId(id);
            setMessages(
                data.messages.map((message: Message) => ({
                role: message.role,
                content: message.content,
                }))
            );

            inputRef.current?.focus();
            } catch (error) {
            console.error("Failed to load conversation:", error);
        }
    }

    function handleNewChat() {
        if (loading) {
        return;
        }

        stopSpeaking();

        setConversationId(null);
        setMessages([]);
        setInput("");

        inputRef.current?.focus();
    }

    function handleToggleVoice() {
        if (voiceEnabled) {
        stopSpeaking();
        }

        setVoiceEnabled((current) => !current);
    }

    return {
        messages,
        input,
        setInput,
        loading,
        conversationId,
        conversations,
        voiceEnabled,
        inputRef,
        handleSend,
        handleSelectConversation,
        handleNewChat,
        handleToggleVoice,
    };
}
