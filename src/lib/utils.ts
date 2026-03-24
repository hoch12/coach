import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getApiUrl = (path: string) => {
  // On GitHub Pages (Production), use the absolute Render URL.
  // In development, the Vite proxy handles /api correctly.
  const isProd = import.meta.env.PROD;
  const baseUrl = isProd ? "https://coach-3iwd.onrender.com" : "";
  return `${baseUrl}${path}`;
};
