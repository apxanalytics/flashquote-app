import { useEffect, useState } from "react";

export default function RecordingStrip({ visible, onStop }: { visible: boolean; onStop: () => void }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!visible) {
      setSecs(0);
      return;
    }
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [visible]);

  if (!visible) return null;

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse" />
        <span className="font-medium">Recording…</span>
        <span className="tabular-nums">{mm}:{ss}</span>
      </div>
      <button
        onClick={onStop}
        className="rounded-md bg-red-600 px-3 py-1.5 text-white font-semibold hover:bg-red-700 transition-colors"
      >
        Stop
      </button>
    </div>
  );
}
