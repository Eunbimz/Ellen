"use client";

import { useState } from "react";

import ConversationSidebar from "@/components/sidebar/conversation-sidebar";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/use-chat";
import { useVoiceRecording } from "@/hooks/use-voice-recording";

export default function ChatWindow() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const {
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
    } = useChat();

    const { isRecording, isTranscribing, handleVoice } = useVoiceRecording({
        disabled: loading,
        onTranscript: (transcript) => {
        setInput(transcript);
        inputRef.current?.focus();
        },
    });

    async function onSelectConversation(id: string) {
        await handleSelectConversation(id);
        setSidebarOpen(false);
    }

    function onNewChat() {
        handleNewChat();
        setSidebarOpen(false);
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-[#181818] text-white">
        <ConversationSidebar
            conversations={conversations}
            activeConversationId={conversationId}
            onSelectConversation={onSelectConversation}
            onNewChat={onNewChat}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        <main className="relative flex min-w-0 flex-1 flex-col bg-[#181818]">
            <ChatHeader
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            onOpenSidebar={() => setSidebarOpen(true)}
            />

            <MessageList messages={messages} />

            <ChatComposer
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            loading={loading}
            inputRef={inputRef as React.RefObject<HTMLInputElement>}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onVoice={handleVoice}
            />
        </main>
        </div>
    );
}
