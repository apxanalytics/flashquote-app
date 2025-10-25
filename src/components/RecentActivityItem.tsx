import React from "react";
import AvatarCircle from "./AvatarCircle";
import { initialsFrom } from "../lib/initials";

type Activity = {
  id: string;
  job_name?: string | null;
  customer_name?: string | null;
  summary: string;
  detail?: string | null;
  ts: string | Date;
};

export default function RecentActivityItem({ a }: { a: Activity }) {
  const hasCustomer = !!a.customer_name && a.customer_name.trim() !== "";
  const label = hasCustomer
    ? initialsFrom(a.customer_name!)
    : initialsFrom(a.job_name || "");

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition">
      <div className="group-hover:ring-2 group-hover:ring-blue-500/40 rounded-full">
        <AvatarCircle label={label} missing={!hasCustomer} size={36} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate font-medium text-slate-100">
            {a.summary}
          </div>
          <div className="text-xs text-neutral-400 whitespace-nowrap">
            {new Date(a.ts).toLocaleString()}
          </div>
        </div>

        {a.detail && (
          <div className="text-sm text-neutral-400 truncate">
            {a.detail}
          </div>
        )}

        <div className="text-xs text-neutral-500 mt-1 truncate">
          {a.job_name || "Untitled Job"}
          {hasCustomer ? (
            <> • {a.customer_name}</>
          ) : (
            <> • <span className="text-red-400">No customer</span></>
          )}
        </div>
      </div>
    </div>
  );
}
