import { useState, useEffect, useCallback } from "react";
import { getExpenses, getSummary } from "../api/expenses";

export function useExpenses(filters) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses(filters);
      setExpenses(data.results ?? data);
    } catch (e) {
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { load(); }, [load]);

  return { expenses, loading, error, reload: load };
}

export function useSummary(year, month) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSummary(year, month);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  return { summary, loading, reload: load };
}
