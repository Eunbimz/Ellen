"use client";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ConversationSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
};

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
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[280px] flex-col
          border-r border-neutral-800
          bg-[#111111] text-white
          transition-transform duration-200 ease-out

          md:static
          md:z-auto
          md:w-[260px]
          md:translate-x-0
          md:shrink-0

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="px-4 pt-4">
          <div className="mb-5 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
                T
              </div>

              <span className="text-sm font-semibold tracking-tight">
                Talkative
              </span>
            </div>

            {/* Close button mobile */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-white md:hidden"
            >
              ×
            </button>
          </div>

          {/* New Chat */}
          <button
            onClick={handleNewChat}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-white text-sm font-medium text-black transition hover:bg-neutral-200 active:scale-[0.98]"
          >
            <span className="mr-2 text-base">
              +
            </span>

            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="mt-6 flex-1 overflow-y-auto px-2">
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
            Conversations
          </div>

          <div className="space-y-1">
            {conversations.map(
              (conversation) => {
                const active =
                  conversation.id ===
                  activeConversationId;

                return (
                  <button
                    key={conversation.id}
                    onClick={() =>
                      handleSelect(
                        conversation.id
                      )
                    }
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }`}
                  >
                    <div className="truncate">
                      {conversation.title ||
                        "New conversation"}
                    </div>
                  </button>
                );
              }
            )}

            {conversations.length === 0 && (
              <div className="px-3 py-3 text-xs leading-5 text-neutral-600">
                Belum ada conversation.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium text-neutral-300">
              B
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm text-neutral-300">
                Bima
              </p>

              <p className="text-xs text-neutral-600">
                Local AI
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}