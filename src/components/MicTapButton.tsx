import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Mic } from "lucide-react";

export type MicTapHandle = { stop: () => void; isRecording: () => boolean };

function pickMime() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return "";
}

export default React.forwardRef(function MicTapButton(
  {
    onResult,
    onRecordingChange,
  }: {
    onResult: (blob: Blob) => void;
    onRecordingChange?: (recording: boolean) => void;
  },
  ref: React.Ref<MicTapHandle>
) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mimeTypeRef = useRef(pickMime());

  useImperativeHandle(ref, () => ({ stop, isRecording: () => recording }));

  useEffect(() => {
    if (typeof MediaRecorder === "undefined") setUnsupported(true);
  }, []);

  async function start() {
    try {
      if (typeof MediaRecorder === "undefined" || !mimeTypeRef.current) {
        setUnsupported(true);
        fileInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, mimeTypeRef.current ? { mimeType: mimeTypeRef.current } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || "audio/webm" });
          onResult(blob);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
        }
      };
      mr.start();
      setRec(mr);
      setRecording(true);
      onRecordingChange?.(true);
    } catch (err: any) {
      const msg =
        err?.name === "NotAllowedError"
          ? "Microphone permission was denied. Click the mic icon in your browser's address bar and allow access."
          : err?.name === "NotFoundError"
          ? "No microphone input device found."
          : err?.name === "SecurityError"
          ? "Microphone requires HTTPS or localhost."
          : `Could not start microphone: ${err?.message || err}`;
      alert(msg);
      console.error(err);
    }
  }

  function stop() {
    try {
      if (rec && rec.state !== "inactive") rec.stop();
    } catch {}
    setRecording(false);
    onRecordingChange?.(false);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onResult(file);
    e.target.value = "";
  }

  return (
    <>
      <button
        onClick={() => (recording ? stop() : start())}
        className={`rounded-lg px-6 py-4 flex flex-col items-center justify-center font-bold text-white shadow-lg ${recording ? "bg-gray-600" : "bg-red-600"} hover:opacity-90 transition-all`}
        aria-pressed={recording}
        title={unsupported ? "Your browser doesn't support live recording. You can pick an audio file instead." : undefined}
      >
        <Mic className="w-8 h-8 mb-1" />
        <span className="text-sm">{recording ? "Stop" : unsupported ? "Upload" : "Tap & Talk"}</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        capture="microphone"
        className="hidden"
        onChange={onFilePicked}
      />
    </>
  );
});
