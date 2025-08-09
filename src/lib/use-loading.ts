"use client";

import { useState, useCallback } from "react";

// Simple loading state hook
export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const toggleLoading = useCallback(() => setLoading((prev) => !prev), []);

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading,
  };
}

// Loading state hook with async operation wrapper
export function useAsyncLoading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFn();

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred");
        setError(error.message);

        if (onError) {
          onError(error);
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
}

// Multiple loading states manager
export function useMultipleLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const startLoading = useCallback(
    (key: string) => {
      setLoading(key, true);
    },
    [setLoading]
  );

  const stopLoading = useCallback(
    (key: string) => {
      setLoading(key, false);
    },
    [setLoading]
  );

  const isLoading = useCallback(
    (key: string) => {
      return Boolean(loadingStates[key]);
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
    clearAll,
  };
}

// Form loading state hook
export function useFormLoading() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitWithLoading = useCallback(
    async <T>(
      submitFn: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setErrors({});

        const result = await submitFn();

        if (onSuccess) {
          onSuccess(result);
        }

        return true;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred");

        // Try to parse validation errors if they exist
        if (error.message.includes("validation")) {
          try {
            const parsed = JSON.parse(error.message);
            if (parsed.errors) {
              setErrors(parsed.errors);
            }
          } catch {
            setErrors({ general: error.message });
          }
        } else {
          setErrors({ general: error.message });
        }

        if (onError) {
          onError(error);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearErrors = useCallback(() => setErrors({}), []);
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    loading,
    errors,
    submitWithLoading,
    clearErrors,
    setFieldError,
  };
}

// Loading state utilities
export const LoadingUtils = {
  // Delay execution to show loading state briefly (prevents flash)
  withMinimumDelay: async <T>(
    asyncFn: () => Promise<T>,
    minimumDelay = 300
  ): Promise<T> => {
    const [result] = await Promise.all([
      asyncFn(),
      new Promise((resolve) => setTimeout(resolve, minimumDelay)),
    ]);
    return result;
  },

  // Timeout wrapper for async operations
  withTimeout: async <T>(
    asyncFn: () => Promise<T>,
    timeoutMs = 10000,
    timeoutMessage = "Operation timed out"
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([asyncFn(), timeoutPromise]);
  },

  // Retry wrapper with loading state
  withRetry: async <T>(
    asyncFn: () => Promise<T>,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError!;
  },
};
