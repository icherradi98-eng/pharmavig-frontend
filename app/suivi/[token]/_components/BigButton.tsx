"use client";

const COLORS: Record<string, string> = {
  emerald: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
  gray: "bg-white hover:bg-gray-50 text-gray-800 border-gray-300",
  amber: "bg-white hover:bg-amber-50 text-amber-700 border-amber-300",
};

export function BigButton({ children, onClick, color, disabled }: {
  children: React.ReactNode;
  onClick: () => void;
  color: "emerald" | "gray" | "amber";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-base font-semibold py-4 rounded-2xl border-2 transition-colors disabled:opacity-40 ${COLORS[color]}`}
    >
      {children}
    </button>
  );
}
