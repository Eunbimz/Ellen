interface SidebarOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarOverlay({ open, onClose }: SidebarOverlayProps) {
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    />
  );
}
