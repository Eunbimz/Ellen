"use client";

type Conversation = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

type Props = {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
};

export default function ConversationSidebar({
    conversations,
    activeId,
    onSelect,
    onNewChat,
}: Props) {
    return (
        <aside className="flex w-72 flex-col border-r bg-gray-50">
        <div className="p-4">
            <button
            onClick={onNewChat}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
            >
            + New Chat
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
            {conversations.map(
            (conversation) => (
                <button
                key={conversation.id}
                onClick={() =>
                    onSelect(conversation.id)
                }
                className={`mb-1 w-full rounded-lg px-3 py-3 text-left text-sm ${
                    activeId === conversation.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                >
                <p className="truncate font-medium">
                    {conversation.title ||
                    "New Conversation"}
                </p>
                </button>
            )
            )}
        </div>
        </aside>
    );
}