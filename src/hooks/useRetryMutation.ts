import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import type { FunctionReference } from 'convex/server';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  onError?: (error: Error, attempt: number) => void;
  onSuccess?: () => void;
}

export function useRetryMutation<Args extends Record<string, unknown>, ReturnType>(
  mutation: FunctionReference<'mutation', 'public', Args, ReturnType>,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onError,
    onSuccess,
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const baseMutation = useMutation(mutation);

  const executeWithRetry = useCallback(
    async (args: Args): Promise<ReturnType> => {
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setRetryCount(attempt);
          if (attempt > 0) {
            setIsRetrying(true);
          }

          const result = await baseMutation(args as any);
          
          setIsRetrying(false);
          setRetryCount(0);
          
          if (onSuccess) {
            onSuccess();
          }
          
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          
          if (onError) {
            onError(lastError, attempt);
          }

          if (attempt < maxRetries) {
            // Exponential backoff with jitter
            const delay = Math.min(
              initialDelay * Math.pow(2, attempt) + Math.random() * 1000,
              maxDelay
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      setIsRetrying(false);
      setRetryCount(0);
      throw lastError || new Error('Mutation failed after retries');
    },
    [baseMutation, maxRetries, initialDelay, maxDelay, onError, onSuccess]
  );

  return {
    mutate: executeWithRetry,
    isRetrying,
    retryCount,
  };
}
