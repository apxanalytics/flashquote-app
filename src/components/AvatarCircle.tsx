import React from "react";

export default function AvatarCircle({
  label,
  missing = false,
  size = 40,
}: { label: string; missing?: boolean; size?: number }) {
  const base =
    "flex items-center justify-center rounded-full select-none shrink-0";
  const style = { width: size, height: size };

  if (missing) {
    return (
      <div
        className={`${base} border-2`}
        style={{ ...style, borderColor: "#EE4444" }}
        title="No customer"
      />
    );
  }

  return (
    <div
      className={`${base} text-white font-semibold`}
      style={{ ...style, background: "#3B82F6" }}
      title={label}
    >
      {label}
    </div>
  );
}
