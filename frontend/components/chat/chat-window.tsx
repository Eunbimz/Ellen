"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ConversationSidebar from "@/components/sidebar/conversation-sidebar";

import {
  sendMessage,
  getConversations,
  getConversation,
} from "@/lib/api";

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
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

    

  const [loading, setLoading] =
    useState(false);

  const [
    conversationId,
    setConversationId,
  ] = useState<string | null>(null);

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [sidebarOpen, setSidebarOpen] =
  useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // Load conversations
  // ==========================================

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getConversations();

        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    }

    load();
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
  // Send message
  // ==========================================

  async function handleSend() {
    const trimmed =
      input.trim();

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
      const newConversationId =
        await sendMessage({
          message: trimmed,
          conversationId,

          onChunk: (chunk) => {
            setMessages((current) => {
              const updated = [
                ...current,
              ];

              const last =
                updated[
                  updated.length - 1
                ];

              if (
                last?.role ===
                "assistant"
              ) {
                updated[
                  updated.length - 1
                ] = {
                  ...last,
                  content:
                    last.content +
                    chunk,
                };
              }

              return updated;
            });
          },
        });

      if (newConversationId) {
        setConversationId(
          newConversationId
        );

        const updated =
          await getConversations();

        setConversations(updated);
      }
    } catch (error) {
      console.error(error);

      setMessages((current) => {
        const updated = [
          ...current,
        ];

        const last =
          updated[
            updated.length - 1
          ];

        if (
          last?.role ===
          "assistant"
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
    if (loading) return;

    try {
      const data =
        await getConversation(id);

      setConversationId(id);

      setMessages(
        data.messages.map(
          (message: Message) => ({
            role: message.role,
            content:
              message.content,
          })
        )
      );

      inputRef.current?.focus();
    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================
  // New chat
  // ==========================================

  function handleNewChat() {
    if (loading) return;

    setConversationId(null);
    setMessages([]);
    setInput("");

    inputRef.current?.focus();
  }

  const isEmpty =
    messages.length === 0;

  const isThinking =
    loading &&
    messages.length > 0 &&
    messages[
      messages.length - 1
    ]?.role === "assistant" &&
    messages[
      messages.length - 1
    ]?.content === "";

  return (
    <div className="flex h-dvh overflow-hidden bg-[#181818] text-white">
      {/* Sidebar */}

      <ConversationSidebar
  conversations={conversations}
  activeConversationId={conversationId}
  onSelectConversation={handleSelectConversation}
  onNewChat={handleNewChat}
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      {/* Main */}

      <main className="relative flex min-w-0 flex-1 flex-col bg-[#181818]">
        {/* Top bar */}

        <header className="flex h-14 shrink-0 items-center border-b border-neutral-800 px-4 md:px-6">
  {/* Burger */}
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
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-sm font-medium text-neutral-300">
              Ellen
            </span>
          </div>

          <span className="ml-2 text-xs text-neutral-600">
            Local
          </span>
        </header>

        

        {/* Chat area */}

        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="flex h-full items-center justify-center px-6">
              <div className="w-full max-w-xl text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black shadow-lg">
                  T
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  What&apos;s on your mind?
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Talk to Ellen about
                  anything.
                </p>
              </div>
            </div>
          ) : (
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

        {/* Composer */}

        <div className="shrink-0 bg-[#181818] px-5 pb-5 pt-3">
          <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-neutral-700 bg-[#202020] p-1.5 transition focus-within:border-neutral-500">
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

              <button
                onClick={
                  handleSend
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
              Talkative can make
              mistakes. Check important
              information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}