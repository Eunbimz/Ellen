"use client";

import { MenuIcon, VoiceOffIcon, VoiceOnIcon } from "@/components/chat/icons";

interface ChatHeaderProps {
    voiceEnabled: boolean;
    onToggleVoice: () => void;
    onOpenSidebar: () => void;
}

export function ChatHeader({
    voiceEnabled,
    onToggleVoice,
    onOpenSidebar,
}: ChatHeaderProps) {
    return (
        <header className="flex h-14 shrink-0 items-center border-b border-neutral-800 px-4 md:px-6">
        {/* Mobile burger */}
        <button
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white md:hidden"
        >
            <MenuIcon />
        </button>

        {/* Assistant status */}
        <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-neutral-300">Ellen</span>
        </div>

        <span className="ml-2 text-xs text-neutral-600">Local</span>

        {/* Voice toggle */}
        <button
            onClick={onToggleVoice}
            aria-label={voiceEnabled ? "Disable voice" : "Enable voice"}
            title={voiceEnabled ? "Disable voice" : "Enable voice"}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
        >
            {voiceEnabled ? <VoiceOnIcon /> : <VoiceOffIcon />}
        </button>
        </header>
    );
}
