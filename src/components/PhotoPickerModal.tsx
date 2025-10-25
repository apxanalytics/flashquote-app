import { useEffect, useState } from "react";

export default function PhotoPickerModal({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-dark-card rounded-xl p-4 w-full max-w-md border border-dark-border">
        <div className="mb-2 text-lg font-semibold text-gray-100">Add Photo</div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="mb-3 w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-accent-cyan file:text-dark-bg hover:file:bg-accent-teal file:cursor-pointer"
        />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="mb-3 w-full rounded border border-dark-border"
          />
        )}
        <div className="flex justify-between">
          <button
            onClick={() => setFile(null)}
            className="rounded border border-dark-border px-3 py-2 text-gray-300 hover:bg-dark-hover transition-colors"
          >
            Retake
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded border border-dark-border px-3 py-2 text-gray-300 hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => file && onConfirm(file)}
              disabled={!file}
              className="rounded bg-accent-cyan text-dark-bg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-teal transition-colors font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
