import { useEffect, useState } from "react";
import DecimalInput from "./DecimalInput";

export type Unit = 'sf' | 'lf' | 'ea' | 'room' | 'hr' | 'job' | 'sy' | 'cy' | 'point';

export type DraftItem = {
  id: string;
  description: string;
  rawTranscript?: string;
  photos: string[];
  categoryId?: string | null;
  unit: Unit;
  quantity?: number;
  unitPrice?: number;
  confidence?: number;
  status?: 'processing' | 'ready';
  justAdded?: boolean;
};

export default function LineItemRow({
  item,
  categories,
  onChange,
  onDeletePhoto,
  onAppend,
  onAddPhoto,
}: {
  item: DraftItem;
  categories: { id: string; name: string; unit: Unit; rate: number }[];
  onChange: (patch: Partial<DraftItem>) => void;
  onDeletePhoto: (url: string) => void;
  onAppend: () => void;
  onAddPhoto: () => void;
}) {
  const [local, setLocal] = useState(item);

  useEffect(() => setLocal(item), [item]);

  function apply(patch: Partial<DraftItem>) {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(patch);
  }

  const unitOptions: Unit[] = ['sf', 'lf', 'ea', 'room', 'hr', 'job', 'sy', 'cy', 'point'];

  return (
    <div className={`rounded-lg border ${item.justAdded ? 'bg-amber-900/20 border-amber-600/30' : 'bg-dark-card border-dark-border'} p-3 space-y-3 transition-colors`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <input
            className="w-full rounded border border-dark-border bg-dark-bg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50"
            placeholder="Description"
            value={local.description}
            onChange={(e) => apply({ description: e.target.value })}
            disabled={local.status === 'processing'}
          />
          {item.status === 'processing' && item.rawTranscript && (
            <div className="mt-1 text-xs text-gray-400">
              Captured: "{item.rawTranscript}" — polishing…
            </div>
          )}
          {typeof local.confidence === "number" && item.status !== 'processing' && (
            <div className={`mt-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${local.confidence > 0.7 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
              AI confidence {Math.round((local.confidence || 0) * 100)}%
            </div>
          )}
        </div>

        <span className={`ml-2 h-6 shrink-0 rounded px-2 text-xs leading-6 font-medium ${item.status === 'processing' ? 'bg-blue-900/30 text-blue-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
          {item.status === 'processing' ? 'Polishing…' : 'Ready'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded border border-dark-border bg-dark-bg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50"
          value={local.categoryId || ""}
          onChange={(e) => {
            const cat = categories.find(c => c.id === e.target.value);
            apply({ categoryId: e.target.value || null, unit: (cat?.unit || local.unit) });
          }}
          disabled={local.status === 'processing'}
        >
          <option value="">Select category…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="rounded border border-dark-border bg-dark-bg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent-cyan disabled:opacity-50"
          value={local.unit}
          onChange={(e) => apply({ unit: e.target.value as Unit })}
          disabled={local.status === 'processing'}
        >
          {unitOptions.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
        </select>

        <div className="w-28">
          <DecimalInput
            value={local.quantity ?? 0}
            onChange={(val) => apply({ quantity: val || undefined })}
            placeholder="Qty"
            className={`${local.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
            decimals={2}
          />
        </div>

        <button
          onClick={onAddPhoto}
          className="rounded border border-dark-border px-3 py-2 text-sm text-gray-300 hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={local.status === 'processing'}
        >
          Add photo
        </button>

        <button
          onClick={onAppend}
          className="rounded border border-dark-border px-3 py-2 text-sm text-gray-300 hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={local.status === 'processing'}
        >
          + Append (voice)
        </button>
      </div>

      {item.photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.photos.map(url => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt=""
                className="h-24 w-24 rounded border border-dark-border object-cover"
              />
              <button
                onClick={() => onDeletePhoto(url)}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 text-white w-6 h-6 text-xs font-bold hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
