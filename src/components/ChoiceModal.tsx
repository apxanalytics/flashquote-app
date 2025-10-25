export default function ChoiceModal({
  open,
  title,
  body,
  onPrimary,
  onSecondary,
  primaryText = "Yes",
  secondaryText = "Cancel"
}: {
  open: boolean;
  title: string;
  body?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryText?: string;
  secondaryText?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-dark-card border border-dark-border shadow-xl p-4">
        <div className="text-lg font-semibold text-gray-100">{title}</div>
        {body && <div className="mt-2 text-sm text-gray-400">{body}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onSecondary}
            className="rounded border border-dark-border px-3 py-2 text-gray-300 hover:bg-dark-hover transition-colors"
          >
            {secondaryText}
          </button>
          <button
            onClick={onPrimary}
            className="rounded bg-accent-cyan text-dark-bg px-3 py-2 font-semibold hover:bg-accent-teal shadow-sm hover-glow-blue focus-glow-blue transition-all duration-150"
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}
