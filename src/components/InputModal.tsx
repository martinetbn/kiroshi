import { useEffect, useRef, useState } from "react";

interface InputModalProps {
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputModal({
  title,
  placeholder = "",
  initialValue = "",
  confirmLabel = "Guardar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden">
        <div className="bg-[#3e61ff] px-6 py-4">
          <h2 className="text-white text-[24px] font-semibold">{title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 text-[18px] border-2 border-gray-300 rounded focus:border-[#3e61ff] focus:outline-none mb-6"
          />
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-[#d9d9d9] hover:bg-[#c0c0c0] text-black text-[18px] font-medium rounded transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-6 py-3 bg-[#3e61ff] hover:bg-[#2d4ecc] disabled:bg-[#a0a0a0] text-white text-[18px] font-medium rounded transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
