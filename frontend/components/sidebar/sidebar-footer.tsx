export function SidebarFooter() {
  return (
    <div className="border-t border-neutral-800 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-medium text-neutral-300">
          E
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm text-neutral-300">Ellen</p>
          <p className="text-xs text-neutral-600">Local AI</p>
        </div>
      </div>
    </div>
  );
}
