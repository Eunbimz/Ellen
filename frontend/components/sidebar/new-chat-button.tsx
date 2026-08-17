interface NewChatButtonProps {
  onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center rounded-xl bg-white text-sm font-medium text-black transition hover:bg-neutral-200 active:scale-[0.98]"
    >
      <span className="mr-2 text-base">+</span>
      New Chat
    </button>
  );
}
