import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Toast utility functions
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "top-right",
    });
  },
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: "top-right",
    });
  },
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#f59e0b",
        color: "#fff",
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#3b82f6",
        color: "#fff",
      },
    });
  },
};
