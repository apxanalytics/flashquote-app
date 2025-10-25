import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fn } from "../lib/api";

export function useJobDetail(id?: string) {
  const [data, setData] = useState<any|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Not authenticated");
        }

        const res = await fetch(
          `${fn('job-detail')}?id=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            }
          }
        );

        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed to load job");
        if (alive) setData(j);
      } catch (e: any) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();
    return () => { alive = false; };
  }, [id]);

  return { data, error, loading, refresh: () => setData(null) };
}
