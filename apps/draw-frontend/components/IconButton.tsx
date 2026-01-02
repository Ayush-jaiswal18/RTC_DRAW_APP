import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center
        rounded-lg border p-2
        transition-colors
        ${activated
          ? "bg-gray-700 text-white border-gray-500"
          : "bg-black text-white border-gray-700 hover:bg-gray-800"}
      `}
    >
      {icon}
    </button>
  );
}
