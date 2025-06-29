import { useState, useEffect, useCallback } from "react";

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: unknown[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, isLoading, error, execute };
};
