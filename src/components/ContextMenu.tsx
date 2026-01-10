import { useEffect, useRef } from "react";

interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  scale?: number;
}

export function ContextMenu({
  x,
  y,
  items,
  onClose,
  scale = 1,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport (scaled coordinates)
  const adjustedX = Math.min(x, 1440 - 200);
  const adjustedY = Math.min(y, 1024 - items.length * 50);

  return (
    <div
      ref={menuRef}
      className="absolute bg-white shadow-lg border border-gray-300 rounded-md overflow-hidden z-50"
      style={{
        left: adjustedX,
        top: adjustedY,
        minWidth: 160,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`w-full px-4 py-3 text-left text-[18px] font-medium transition-colors ${
            item.danger
              ? "text-red-600 hover:bg-red-50"
              : "text-black hover:bg-gray-100"
          }`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
