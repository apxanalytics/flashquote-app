import { useState } from "react";
import DecimalInput from "./DecimalInput";

export default function TaxRateModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: number;
  onClose: () => void;
  onSave: (n: number | null) => void;
}) {
  const [v, setV] = useState(initial ?? 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 w-full max-w-[360px]">
        <div className="text-lg font-semibold mb-3">Set Tax Rate (%)</div>
        <DecimalInput
          value={v}
          onChange={setV}
          placeholder="e.g. 8.25"
          suffix="%"
          decimals={2}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(v === 0 ? null : v)}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
