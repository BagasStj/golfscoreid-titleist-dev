import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



/* ─────────────────────────── helpers ─────────────────────────── */
export const statusConfig = (status: string) => {
  switch (status) {
    case "upcoming":
      return {
        label: "Akan Datang",
        bg: "rgba(59,130,246,0.12)",
        border: "rgba(59,130,246,0.3)",
        text: "#93c5fd",
        dot: "#60a5fa",
      };
    case "active":
      return {
        label: "Berlangsung",
        bg: "rgba(16,185,129,0.12)",
        border: "rgba(16,185,129,0.3)",
        text: "#6ee7b7",
        dot: "#34d399",
      };
    case "completed":
      return {
        label: "Selesai",
        bg: "rgba(107,114,128,0.12)",
        border: "rgba(107,114,128,0.3)",
        text: "#9ca3af",
        dot: "#6b7280",
      };
    default:
      return {
        label: status,
        bg: "rgba(107,114,128,0.12)",
        border: "rgba(107,114,128,0.3)",
        text: "#9ca3af",
        dot: "#6b7280",
      };
  }
};
