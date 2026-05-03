import { useState, useEffect, useCallback, useRef } from 'react';

export function usePoll<T>(
  fetcher: () => Promise<T>,
  intervalMs = 10_000,
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(prev => (prev ? false : prev));
    }
  }, []);

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, intervalMs);
    const onFocus = () => doFetch();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [doFetch, intervalMs]);

  return { data, loading, error, refetch: doFetch };
}
