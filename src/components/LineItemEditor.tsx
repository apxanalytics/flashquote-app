import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const UNITS = ["each", "sqft", "lf", "hour", "day"];

export default function LineItemEditor({
  open,
  jobId,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  jobId: string;
  item: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [description, setDescription] = useState("");
  const [quantity, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>("each");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [finalized, setFinalized] = useState(false);
  const [taxable, setTaxable] = useState(true);
  const [taxableAmtStr, setTaxableAmtStr] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErr(null);
    if (item) {
      setDescription(item.description_clean || item.description_raw || item.description || "");
      setQty(Number(item.quantity ?? 1));
      setUnit(item.unit || "each");
      setUnitPrice(Number(item.unit_price ?? 0));
      setFinalized(!!item.finalized);
      setTaxable(item.taxable !== false);
      setTaxableAmtStr(item.taxable_amount == null ? "" : String(item.taxable_amount));
    } else {
      setDescription("");
      setQty(1);
      setUnit("each");
      setUnitPrice(0);
      setFinalized(false);
      setTaxable(true);
      setTaxableAmtStr("");
    }
  }, [open, item]);

  const save = async (polish = false) => {
    try {
      setBusy(true);
      setErr(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const payload: any = {
        job_id: jobId,
        item_id: item?.id,
        description: description,
        quantity: quantity,
        unit: unit,
        unit_price: unitPrice,
        finalize: finalized,
        taxable: taxable,
        taxable_amount: taxable ? (taxableAmtStr.trim() === "" ? null : Number(taxableAmtStr)) : 0,
      };

      const res = await fetch(`/functions/v1/upsert-line`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Save failed");

      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const lineTotal = Number((quantity * unitPrice).toFixed(2));

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[480px] bg-neutral-900 border-l border-neutral-800 p-6 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{item ? "Edit Line Item" : "Add Line Item"}</h3>

        <label className="block text-sm mb-1 text-neutral-300">Description</label>
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
          placeholder="Describe the work…"
        />

        <label className="block text-sm mb-1 text-neutral-300">Quantity</label>
        <input
          inputMode="decimal"
          value={Number.isFinite(quantity) ? String(quantity) : ""}
          onFocus={(e) => { if (Number(e.currentTarget.value) === 0) e.currentTarget.select(); }}
          onChange={(e) => setQty(e.target.value === "" ? 0 : Number(e.target.value))}
          onBlur={(e) => { if (e.target.value === "") setQty(0); }}
          className="w-full mb-3 rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
        />

        <label className="block text-sm mb-1 text-neutral-300">Unit</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full mb-3 rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <label className="block text-sm mb-1 text-neutral-300">Unit Price ($)</label>
        <input
          inputMode="decimal"
          value={Number.isFinite(unitPrice) ? String(unitPrice) : ""}
          onFocus={(e) => { if (Number(e.currentTarget.value) === 0) e.currentTarget.select(); }}
          onChange={(e) => setUnitPrice(e.target.value === "" ? 0 : Number(e.target.value))}
          onBlur={(e) => { if (e.target.value === "") setUnitPrice(0); }}
          className="w-full mb-3 rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
        />

        <div className="text-sm text-neutral-300 mb-4">
          Line total: <span className="font-semibold">${lineTotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={taxable}
            onChange={(e) => setTaxable(e.target.checked)}
          />
          <span className="text-sm text-neutral-300">Apply tax to this line</span>
        </div>

        {taxable && (
          <div className="mb-3">
            <label className="block text-sm mb-1 text-neutral-300">Taxable amount (defaults to line total)</label>
            <input
              inputMode="decimal"
              placeholder={lineTotal.toFixed(2)}
              value={taxableAmtStr}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setTaxableAmtStr(e.target.value)}
              className="w-full rounded-md bg-neutral-800 px-3 py-2 outline-none text-white"
            />
            <div className="text-xs text-neutral-400 mt-1">Leave blank to use ${lineTotal.toFixed(2)}.</div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={finalized}
            onChange={(e) => setFinalized(e.target.checked)}
            disabled={!description || lineTotal <= 0}
          />
          <span className="text-sm text-neutral-300">Finalize line (locks green when description + total &gt; 0)</span>
        </div>

        {err && <div className="text-red-400 text-sm mb-3">{err}</div>}

        <div className="flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-neutral-800 text-white hover:bg-neutral-700">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              disabled={busy || !description}
              onClick={() => save(true)}
              className="px-3 py-2 rounded-xl text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#5b21b6,#2e1065)" }}
            >
              AI Polish
            </button>
            <button
              disabled={busy}
              onClick={() => save(false)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60 hover:bg-emerald-700"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
