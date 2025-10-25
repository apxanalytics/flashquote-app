import React from "react";
import RecentActivityItem from "./RecentActivityItem";

export default function RecentActivityList({ items }: { items: any[] }) {
  if (!items?.length) {
    return (
      <div className="text-neutral-400 text-sm bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        No recent activity yet.
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      {items.slice(0, 5).map((a) => (
        <RecentActivityItem key={a.id} a={a} />
      ))}
    </div>
  );
}
