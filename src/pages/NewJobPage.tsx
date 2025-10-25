import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fn, authHeaders, fetchJSON } from "../lib/http";

export default function NewJobPage() {
  const [name, setName] = useState("");
  const nav = useNavigate();

  const create = async () => {
    if (!name.trim()) return alert("Job Name is required");

    try {
      const { id } = await fetchJSON(fn("create-job"), {
        method: "POST",
        headers: { "content-type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ job_name: name.trim() }),
      });

      nav(`/dashboard/jobs/${id}`);
    } catch (e: any) {
      alert(e.message || "Failed to create job");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D1117] text-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-[#1F2937] p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-3">Create New Job</h1>
        <p className="text-slate-400 mb-6">
          Give your job a name before adding photos or using Tap & Talk.
        </p>

        <label className="block text-sm mb-2">Job Name *</label>
        <input
          className="w-full rounded-lg bg-[#0F172A] border border-[#1F2937] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Kitchen Remodel – Johnson Residence"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && create()}
          autoFocus
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={create}
            className="flex-1 px-4 py-2 rounded-lg text-white font-medium"
            style={{
              background: "linear-gradient(135deg,#3B82F6,#60A5FA)",
            }}
          >
            Continue
          </button>
          <button
            onClick={() => history.back()}
            className="px-4 py-2 rounded-lg border border-[#1F2937]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
