import { ConversationListItem } from "@/components/sidebar/conversation-list-item";
import type { Conversation } from "@/components/chat/types";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="mt-6 flex-1 overflow-y-auto px-2">
      <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
        Conversations
      </div>

      <div className="space-y-1">
        {conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeConversationId}
            onSelect={onSelect}
          />
        ))}

        {conversations.length === 0 && (
          <div className="px-3 py-3 text-xs leading-5 text-neutral-600">
            Belum ada conversation.
          </div>
        )}
      </div>
    </div>
  );
}
