import Image from "next/image";

export function SidebarFooter() {
  return (
    <div className="border-t border-neutral-800 p-3">
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-800">
            <Image
              src="/ellen.png"
              alt="Icon"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm text-neutral-300">Ellen</p>
          <p className="text-xs text-neutral-600">Local AI</p>
        </div>
      </div>
    </div>
  );
}
