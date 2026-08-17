interface SidebarHeaderProps {
  onClose: () => void;
}

export function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">
          E
        </div>

        <span className="text-sm font-semibold tracking-tight">Ellen</span>
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
  );
}
