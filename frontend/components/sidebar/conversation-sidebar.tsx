"use client";

import { ConversationList } from "@/components/sidebar/conversation-list";
import { NewChatButton } from "@/components/sidebar/new-chat-button";
import { SidebarFooter } from "@/components/sidebar/sidebar-footer";
import { SidebarHeader } from "@/components/sidebar/sidebar-header";
import { SidebarOverlay } from "@/components/sidebar/sidebar-overlay";
import type { Conversation } from "@/components/chat/types";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  open,
  onClose,
}: ConversationSidebarProps) {
  function handleSelect(id: string) {
    onSelectConversation(id);
    onClose();
  }

  function handleNewChat() {
    onNewChat();
    onClose();
  }

  return (
    <>
      <SidebarOverlay open={open} onClose={onClose} />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-70 flex-col
          border-r border-neutral-800
          bg-[#111111] text-white
          transition-transform duration-200 ease-out

          md:static
          md:z-auto
          md:w-65
          md:translate-x-0
          md:shrink-0

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="px-4 pt-4">
          <SidebarHeader onClose={onClose} />
          <NewChatButton onClick={handleNewChat} />
        </div>

        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={handleSelect}
        />

        <SidebarFooter />
      </aside>
    </>
  );
}
