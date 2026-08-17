"use client";

import { useEffect, useRef, useState } from "react";

import ConversationSidebar from "@/components/sidebar/conversation-sidebar";

import {
  sendMessage,
  getConversations,
  getConversation,
  transcribeAudio,
} from "@/lib/api";

import {
  speak,
  stopSpeaking,
} from "@/lib/speech";

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
  // ==========================================
  // State
  // ==========================================

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  // Voice output
  const [voiceEnabled, setVoiceEnabled] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  // ==========================================
  // Refs
  // ==========================================

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // Load conversations
  // ==========================================

  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations();

        setConversations(data);
      } catch (error) {
        console.error(
          "Failed to load conversations:",
          error
        );
      }
    }

    loadConversations();
  }, []);

  // ==========================================
  // Auto scroll
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==========================================
  // Voice input (record -> transcribe -> send)
  // ==========================================

  async function handleVoice() {
    if (loading) {
      return;
    }

    // Stop recording
    if (isListening) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mimeType =
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(
            event.data
          );
        }
      };

      recorder.onstop = async () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        setIsListening(false);

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          }
        );

        if (audioBlob.size === 0) {
          return;
        }

        try {
          const text =
            await transcribeAudio(
              audioBlob
            );

          if (text.trim()) {
            // handleSend already takes the override text,
            // no need to also stuff it into `input` first.
            await handleSend(text.trim());
          }
        } catch (error) {
          console.error(
            "Voice transcription error:",
            error
          );
        } finally {
          inputRef.current?.focus();
        }
      };

      recorder.onerror = (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        setIsListening(false);
      };

      mediaRecorderRef.current =
        recorder;

      setIsListening(true);

      recorder.start();
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      setIsListening(false);

      alert(
        "Mic tidak bisa diakses. Pastikan browser sudah diberi izin microphone."
      );
    }
  }

  // ==========================================
  // Send message
  // ==========================================

  async function handleSend(
    messageOverride?: string
  ) {
    const trimmed = (
      messageOverride ?? input
    ).trim();

    if (!trimmed || loading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      {
        role: "assistant",
        content: "",
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      let assistantResponse = "";

      const newConversationId =
        await sendMessage({
          message: trimmed,
          conversationId,

          onChunk: (chunk) => {
            assistantResponse += chunk;

            setMessages((current) => {
              const updated = [...current];

              const last =
                updated[updated.length - 1];

              if (
                last?.role === "assistant"
              ) {
                updated[
                  updated.length - 1
                ] = {
                  ...last,
                  content:
                    last.content + chunk,
                };
              }

              return updated;
            });
          },
        });

      // ==========================================
      // Voice output
      // ==========================================

      if (
        voiceEnabled &&
        assistantResponse.trim()
      ) {
        speak(assistantResponse);
      }

      // ==========================================
      // Update conversation
      // ==========================================

      if (newConversationId) {
        setConversationId(
          newConversationId
        );

        const updated =
          await getConversations();

        setConversations(updated);
      }
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      setMessages((current) => {
        const updated = [...current];

        const last =
          updated[updated.length - 1];

        if (
          last?.role === "assistant"
        ) {
          updated[
            updated.length - 1
          ] = {
            role: "assistant",
            content:
              "Maaf, terjadi error. Coba lagi.",
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);

      inputRef.current?.focus();
    }
  }

  // ==========================================
  // Select conversation
  // ==========================================

  async function handleSelectConversation(
    id: string
  ) {
    if (loading) {
      return;
    }

    // Stop any current speech
    stopSpeaking();

    try {
      const data =
        await getConversation(id);

      setConversationId(id);

      setMessages(
        data.messages.map(
          (message: Message) => ({
            role: message.role,
            content: message.content,
          })
        )
      );

      // Close mobile sidebar
      setSidebarOpen(false);

      inputRef.current?.focus();
    } catch (error) {
      console.error(
        "Failed to load conversation:",
        error
      );
    }
  }

  // ==========================================
  // New chat
  // ==========================================

  function handleNewChat() {
    if (loading) {
      return;
    }

    // Stop current speech
    stopSpeaking();

    setConversationId(null);

    setMessages([]);

    setInput("");

    // Close mobile sidebar
    setSidebarOpen(false);

    inputRef.current?.focus();
  }

  // ==========================================
  // Toggle voice output
  // ==========================================

  function handleToggleVoice() {
    if (voiceEnabled) {
      stopSpeaking();
    }

    setVoiceEnabled(
      (current) => !current
    );
  }

  // ==========================================
  // Empty state
  // ==========================================

  const isEmpty =
    messages.length === 0;

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="flex h-dvh overflow-hidden bg-[#181818] text-white">

      {/* ====================================== */}
      {/* Sidebar */}
      {/* ====================================== */}

      <ConversationSidebar
        conversations={conversations}
        activeConversationId={
          conversationId
        }
        onSelectConversation={
          handleSelectConversation
        }
        onNewChat={
          handleNewChat
        }
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* ====================================== */}
      {/* Main */}
      {/* ====================================== */}

      <main className="relative flex min-w-0 flex-1 flex-col bg-[#181818]">

        {/* ==================================== */}
        {/* Top bar */}
        {/* ==================================== */}

        <header className="flex h-14 shrink-0 items-center border-b border-neutral-800 px-4 md:px-6">

          {/* Mobile burger */}

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open sidebar"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white md:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          {/* Assistant status */}

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-sm font-medium text-neutral-300">
              Ellen
            </span>
          </div>

          <span className="ml-2 text-xs text-neutral-600">
            Local
          </span>

          {/* Voice toggle */}

          <button
            onClick={
              handleToggleVoice
            }
            aria-label={
              voiceEnabled
                ? "Disable voice"
                : "Enable voice"
            }
            title={
              voiceEnabled
                ? "Disable voice"
                : "Enable voice"
            }
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
          >
            {voiceEnabled ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />

                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

                <line
                  x1="23"
                  y1="9"
                  x2="17"
                  y2="15"
                />

                <line
                  x1="17"
                  y1="9"
                  x2="23"
                  y2="15"
                />
              </svg>
            )}
          </button>
        </header>

        {/* ==================================== */}
        {/* Chat area */}
        {/* ==================================== */}

        <div className="flex-1 overflow-y-auto">

          {isEmpty ? (

            /* ================================= */
            /* Empty state */
            /* ================================= */

            <div className="flex h-full items-center justify-center px-6">

              <div className="w-full max-w-xl text-center">

                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black shadow-lg">
                  T
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  What&apos;s on your mind?
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Talk to Ellen about anything.
                </p>

              </div>

            </div>

          ) : (

            /* ================================= */
            /* Messages */
            /* ================================= */

            <div className="mx-auto w-full max-w-3xl px-5 py-8">

              <div className="space-y-7">

                {messages.map(
                  (
                    message,
                    index
                  ) => {

                    const isUser =
                      message.role ===
                      "user";

                    const emptyAssistant =
                      !isUser &&
                      message.content === "";

                    /* ========================= */
                    /* Thinking */
                    /* ========================= */

                    if (
                      emptyAssistant
                    ) {
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-1 text-sm text-neutral-600"
                        >
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-500" />

                          <span>
                            Thinking...
                          </span>
                        </div>
                      );
                    }

                    /* ========================= */
                    /* Message */
                    /* ========================= */

                    return (
                      <div
                        key={index}
                        className={`flex ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={
                            isUser
                              ? "max-w-[75%] rounded-2xl bg-[#2a2a2a] px-4 py-3 text-sm leading-6 text-white"
                              : "max-w-[85%] px-1 py-2 text-sm leading-7 text-neutral-200"
                          }
                        >
                          {message.content}
                        </div>

                      </div>
                    );
                  }
                )}

                <div
                  ref={
                    messagesEndRef
                  }
                />

              </div>

            </div>
          )}

        </div>

        {/* ==================================== */}
        {/* Composer */}
        {/* ==================================== */}

        <div className="shrink-0 bg-[#181818] px-5 pb-5 pt-3">

          <div className="mx-auto w-full max-w-3xl">

            <div className="flex items-end gap-2 rounded-2xl border border-neutral-700 bg-[#202020] p-1.5 transition focus-within:border-neutral-500">

              {/* Input */}

              <input
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                      "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();

                    handleSend();
                  }

                }}
                disabled={loading}
                placeholder="Talk to Ellen..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-neutral-600 disabled:opacity-50"
              />

              {/* ================================= */}
              {/* Voice input */}
              {/* ================================= */}

              <button
                type="button"
                onClick={handleVoice}
                disabled
                aria-label={
                  isListening
                    ? "Stop recording"
                    : "Start voice input"
                }
                title={
                  isListening
                    ? "Stop recording"
                    : "Start voice input"
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                  isListening
                    ? "bg-red-500 text-white"
                    : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="9"
                    y="2"
                    width="6"
                    height="12"
                    rx="3"
                  />

                  <path d="M5 10a7 7 0 0 0 14 0" />

                  <path d="M12 19v3" />

                  <path d="M8 22h8" />
                </svg>
              </button>

              {/* ================================= */}
              {/* Send */}
              {/* ================================= */}

              <button
                onClick={() =>
                  handleSend()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-medium text-black transition hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
              >
                ↑
              </button>

            </div>

            <p className="mt-2 text-center text-[11px] text-neutral-700">
              Ellen can make mistakes.
              Check important information.
            </p>

          </div>

        </div>

      </main>
    </div>
  );
}
