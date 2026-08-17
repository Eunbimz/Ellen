"use client";

import type { RefObject } from "react";

import { MicIcon } from "@/components/chat/icons";

interface ChatComposerProps {
    input: string;
    onInputChange: (value: string) => void;
    onSend: () => void;
    loading: boolean;
    inputRef: RefObject<HTMLInputElement>;
    isRecording: boolean;
    isTranscribing: boolean;
    onVoice: () => void;
}

export function ChatComposer({
    input,
    onInputChange,
    onSend,
    loading,
    inputRef,
    isRecording,
    isTranscribing,
    onVoice,
}: ChatComposerProps) {
    return (
        <div className="shrink-0 bg-[#181818] px-5 pb-5 pt-3">
        <div className="mx-auto w-full max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-neutral-700 bg-[#202020] p-1.5 transition focus-within:border-neutral-500">
            {/* Input */}
            <input
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                }
                }}
                disabled={loading}
                placeholder="Talk to Ellen..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-neutral-600 disabled:opacity-50"
            />

            {/* Voice input */}
            <button
                onClick={onVoice}
                disabled={loading || isTranscribing}
                aria-label={
                isTranscribing
                    ? "Transcribing"
                    : isRecording
                    ? "Stop recording"
                    : "Voice input"
                }
                title={
                isTranscribing
                    ? "Converting speech to text..."
                    : isRecording
                    ? "Stop recording"
                    : "Voice input"
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition active:scale-95 ${
                isRecording
                    ? "bg-red-500 text-white"
                    : isTranscribing
                    ? "bg-neutral-700 text-neutral-500"
                    : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
                }`}
            >
                {isTranscribing ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-500 border-t-white" />
                ) : (
                <MicIcon />
                )}
            </button>

            {/* Send */}
            <button
                onClick={() => onSend()}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-medium text-black transition hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500"
            >
                ↑
            </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-neutral-700">
            Ellen can make mistakes. Ellen was created by Bima.
            </p>
        </div>
        </div>
    );
}
