import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function CustomerPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const res = await fetch(`/functions/v1/list-customers`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Failed to load customers");
        setAll(j.customers || []);
      } catch (e: any) {
        console.error(e);
        setAll([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter((c) => {
      const t = [
        c.full_name, c.first_name, c.last_name, c.business_name,
        c.email, c.phone
      ].filter(Boolean).join(" ").toLowerCase();
      return t.includes(s);
    });
  }, [all, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-neutral-900 border-l border-neutral-800 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Select Existing Customer</h3>

        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, or phone…"
          className="w-full mb-4 rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
        />

        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-neutral-400">No customers found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => {
              const selected = sel === c.id;
              return (
                <button
                  key={c.id}
                  onMouseEnter={() => setSel(c.id)}
                  onFocus={() => setSel(c.id)}
                  onClick={() => {
                    setSel(c.id);
                    onSelect(c);
                  }}
                  className={`w-full text-left rounded-xl p-3 bg-neutral-800 hover:bg-neutral-700 border transition ${
                    selected ? "border-blue-500 ring-2 ring-blue-500/40" : "border-transparent"
                  }`}
                >
                  <div className="font-medium">{c.full_name}</div>
                  <div className="text-sm text-neutral-400">
                    {c.email || "—"} • {c.phone || "—"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <a href="/dashboard/customers" className="text-sm underline text-neutral-400 hover:text-neutral-300">
            Open Customers page
          </a>
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700">
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
