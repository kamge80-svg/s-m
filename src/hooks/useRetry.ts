import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const retry = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options: RetryOptions = {}
    ): Promise<T> => {
      const { maxAttempts = 3, delay = 1000, backoff = true } = options;

      setIsRetrying(true);
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setAttempts(attempt + 1);
          const result = await fn();
          setIsRetrying(false);
          setAttempts(0);
          return result;
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < maxAttempts - 1) {
            const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      setIsRetrying(false);
      setAttempts(0);
      throw lastError;
    },
    []
  );

  return { retry, isRetrying, attempts };
}
