import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() → safely merge Tailwind + conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
