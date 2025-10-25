import { useEffect, useMemo, useState } from 'react';
import type { PricingCategory } from '../lib/types';

type Unit = PricingCategory['unit'];

type Item = {
  description: string;
  categoryId?: string | null;
  unit: Unit;
  quantity: number;
  unitPrice: number;
  total?: number;
  reasoning?: string;
};

interface ScopeReviewModalProps {
  open: boolean;
  items: Item[];
  onClose: () => void;
  onConfirm: (items: Item[]) => void;
}

export default function ScopeReviewModal({
  open,
  items: initialItems,
  onClose,
  onConfirm,
}: ScopeReviewModalProps) {
  const [items, setItems] = useState<Item[]>(initialItems ?? []);

  useEffect(() => {
    setItems(
      (initialItems ?? []).map((it) => ({
        ...it,
        total: round2((it.quantity ?? 0) * (it.unitPrice ?? 0)),
      }))
    );
  }, [initialItems]);

  const grandTotal = useMemo(
    () => round2(items.reduce((s, it) => s + (it.total ?? 0), 0)),
    [items]
  );

  function updateRow(idx: number, patch: Partial<Item>) {
    setItems((prev) => {
      const next = [...prev];
      const merged = { ...next[idx], ...patch };
      merged.total = round2((merged.quantity ?? 0) * (merged.unitPrice ?? 0));
      next[idx] = merged;
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(items);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-dark-card border border-dark-border p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Review Scope & Pricing</h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="max-h-[50vh] overflow-auto rounded-lg border border-dark-border">
          <table className="min-w-full text-sm">
            <thead className="bg-dark-bg sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-white">Description</th>
                <th className="px-3 py-3 text-left font-semibold text-white">Unit</th>
                <th className="px-3 py-3 text-right font-semibold text-white">Qty</th>
                <th className="px-3 py-3 text-right font-semibold text-white">$ / Unit</th>
                <th className="px-3 py-3 text-right font-semibold text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t border-dark-border">
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{it.description}</div>
                    {it.reasoning && (
                      <div className="mt-1 text-xs text-gray-400">
                        AI note: {it.reasoning}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded bg-dark-bg px-2 py-1 text-xs uppercase text-accent-cyan font-medium">
                      {it.unit}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-28 rounded border border-dark-border bg-dark-bg px-3 py-2 text-right text-white focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      value={it.quantity ?? 0}
                      onChange={(e) =>
                        updateRow(idx, { quantity: parseFloatSafe(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-28 rounded border border-dark-border bg-dark-bg px-3 py-2 text-right text-white focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
                      value={it.unitPrice ?? 0}
                      onChange={(e) =>
                        updateRow(idx, { unitPrice: parseFloatSafe(e.target.value) })
                      }
                    />
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-white tabular-nums">
                    {formatCurrency(it.total ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-dark-bg">
                <td colSpan={4} className="px-3 py-4 text-right font-semibold text-white">
                  Subtotal
                </td>
                <td className="px-3 py-4 text-right font-bold text-accent-cyan text-lg">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            Tip: Quantities and unit prices are fully editable. Totals recalculate in real time.
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-lg border border-dark-border bg-dark-bg px-6 py-3 text-sm font-semibold text-white hover:bg-dark-card transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function parseFloatSafe(v: string) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(n || 0);
}
