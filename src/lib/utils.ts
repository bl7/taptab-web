import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Toast utility functions
// Re-export loading components for convenience
export {
  Spinner,
  PageLoader,
  ButtonLoader,
  InlineLoader,
  SectionLoader,
  LoadingOverlay,
  LoadingSkeleton,
  SkeletonCard,
  SkeletonTable,
} from "@/components/ui/loading";

export {
  useLoading,
  useAsyncLoading,
  useMultipleLoading,
  useFormLoading,
  LoadingUtils,
} from "./use-loading";

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
  // Common patterns for our use cases
  saved: (item: string = "Item") => {
    toast.success(`${item} saved successfully!`, {
      duration: 3000,
      position: "top-right",
    });
  },
  deleted: (item: string = "Item") => {
    toast.success(`${item} deleted successfully!`, {
      duration: 3000,
      position: "top-right",
    });
  },
  created: (item: string = "Item") => {
    toast.success(`${item} created successfully!`, {
      duration: 3000,
      position: "top-right",
    });
  },
  updated: (item: string = "Item") => {
    toast.success(`${item} updated successfully!`, {
      duration: 3000,
      position: "top-right",
    });
  },
  loaded: (item: string = "Data") => {
    toast.success(`${item} loaded successfully!`, {
      duration: 2000,
      position: "top-right",
    });
  },
  validationError: (errors: string[] | string) => {
    const message = Array.isArray(errors)
      ? `Please fix the following errors:\n${errors.join("\n")}`
      : errors;
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        whiteSpace: "pre-line",
        maxWidth: "400px",
      },
    });
  },
  operationFailed: (operation: string, error?: string) => {
    const message = error
      ? `Failed to ${operation}: ${error}`
      : `Failed to ${operation}. Please try again.`;
    toast.error(message, {
      duration: 4000,
      position: "top-right",
    });
  },
};
