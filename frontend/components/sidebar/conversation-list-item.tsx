import type { Conversation } from "@/components/chat/types";

interface ConversationListItemProps {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
}

export function ConversationListItem({
  conversation,
  active,
  onSelect,
}: ConversationListItemProps) {
  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
        active
          ? "bg-neutral-800 text-white"
          : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
      }`}
    >
      <div className="truncate">{conversation.title || "New conversation"}</div>
    </button>
  );
}
