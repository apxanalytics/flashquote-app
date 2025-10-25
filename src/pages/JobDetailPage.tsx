import { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import CustomerEditor from "../components/CustomerEditor";
import CustomerPicker from "../components/CustomerPicker";
import LineItemEditor from "../components/LineItemEditor";
import TaxRateModal from "../components/TaxRateModal";
import { supabase } from "../lib/supabase";
import { statusColor } from "../lib/statusColor";

async function transcribe(blob: Blob) {
  const fd = new FormData();
  fd.append("file", blob, "audio.webm");
  const res = await fetch(`/functions/v1/whisper-transcribe`, {
    method: "POST",
    body: fd
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return (json.text || "").trim();
}

function parseIntent(text: string) {
  const t = text.toLowerCase();
  const m = t.match(/adjust (?:line )?item\s*(\d+)/);
  if (m) return { intent: "adjust", index: Number(m[1]) };
  return { intent: "add", text };
}

export default function JobDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, error, loading } = useJobDetail(id);
  const [openCreateCust, setOpenCreateCust] = useState(false);
  const [openPickCust, setOpenPickCust] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [taxModal, setTaxModal] = useState(false);
  const taxCheckboxRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => Array.isArray(data?.scope_items) ? data!.scope_items : [], [data]);
  const subtotal = useMemo(() =>
    items.reduce((sum: number, it: any) => sum + Number(it.total ?? (it.quantity || 0) * (it.unit_price || 0)), 0),
    [items]
  );

  useEffect(() => {
    if (taxCheckboxRef.current && data?.tax) {
      const indeterminate = !data.tax.job_tax_exempt && !data.tax.allTaxable;
      taxCheckboxRef.current.indeterminate = indeterminate;
    }
  }, [data]);

  if (!id) return <div className="p-6">Invalid Job ID</div>;
  if (loading) return <div className="p-6">Loading job…</div>;
  if (error) return (
    <div className="p-6">
      <div className="text-red-300 mb-3">Error: {error}</div>
      <button className="bg-neutral-800 px-3 py-2 rounded-lg" onClick={() => nav("/dashboard/jobs")}>Back to Jobs</button>
    </div>
  );
  if (!data?.job) return <div className="p-6">Job not found.</div>;

  const job = data.job;

  const openNew = () => { setEditingItem(null); setEditorOpen(true); };
  const openEdit = (it: any) => { setEditingItem(it); setEditorOpen(true); };

  const attachCustomer = async (customer_id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Not authenticated");
        return;
      }

      const res = await fetch(
        `/functions/v1/attach-customer`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ job_id: job.id, customer_id }),
        }
      );

      const j = await res.json();
      if (!res.ok) return alert(j.error || "Attach failed");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "Failed to attach customer");
    }
  };

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const text = await transcribe(blob);
        if (!text) return alert("No transcript");

        const { intent, index } = parseIntent(text);

        if (intent === "adjust") {
          const target = items[index - 1];
          if (!target) return alert(`Line item ${index} not found.`);
          setEditingItem(target);
          setEditorOpen(true);
          return;
        }

        if (intent === "add") {
          setEditingItem(null);
          setEditorOpen(true);
        }
      };
      rec.start();
      setTimeout(() => rec.stop(), 3500);
    } catch (e: any) {
      alert(e.message || "Failed to record audio");
    }
  };

  const createProposal = async () => {
    if (!job.customer_id) {
      alert("Attach a customer before creating a proposal.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Not authenticated");
        return;
      }

      const res = await fetch(
        `/functions/v1/create-proposal-from-job`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ job_id: job.id }),
        }
      );

      const j = await res.json();
      if (!res.ok) return alert(j.error || "Failed to create proposal");

      nav(`/dashboard/jobs/${job.id}/proposal/${j.proposal_id}`);
    } catch (e: any) {
      alert(e.message || "Failed to create proposal");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Job #{String(job.id).slice(0, 8)}</h1>
          <div className="text-sm text-neutral-300 flex items-center gap-3 flex-wrap">
            <span>Subtotal: ${subtotal.toFixed(2)}</span>
            <span>•</span>
            <label className="flex items-center gap-2">
              <input
                ref={taxCheckboxRef}
                type="checkbox"
                checked={!data.tax?.job_tax_exempt && data.tax?.allTaxable}
                onChange={async (e) => {
                  const apply = e.currentTarget.checked;
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;

                  await fetch(`/functions/v1/set-job-tax`, {
                    method: "POST",
                    headers: {
                      'Authorization': `Bearer ${session.access_token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ job_id: job.id, tax_exempt: !apply }),
                  });

                  if (apply && items.length > 0) {
                    await Promise.all(
                      items.map((it: any) =>
                        fetch(`/functions/v1/upsert-line`, {
                          method: "POST",
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ job_id: job.id, item_id: it.id, taxable: true }),
                        })
                      )
                    );
                  }

                  window.location.reload();
                }}
              />
              Apply tax ({Number(data.tax?.rate_percent ?? 0).toFixed(2)}%)
            </label>
            <button
              className="text-xs underline text-neutral-400 hover:text-neutral-300"
              onClick={() => setTaxModal(true)}
            >
              set rate
            </button>
            <span>•</span>
            <span>Tax: ${Number(data.tax?.amount ?? 0).toFixed(2)}</span>
            <span>•</span>
            <span className="font-semibold">Total: ${Number(data.total ?? subtotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-xl text-white hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)" }}
            onClick={openNew}
          >
            + Add Item
          </button>
          <button className="px-3 py-2 rounded-xl bg-[#1E293B] text-white hover:bg-[#293548] transition" onClick={startVoice}>
            🎤 Tap & Talk
          </button>
          <button className="px-3 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 transition" onClick={() => setOpenCreateCust(true)}>
            New Customer
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-[#1E293B] text-white hover:bg-[#293548] transition"
            onClick={() => nav(`/dashboard/customers?attachToJob=${job.id}`)}
          >
            Select Existing
          </button>
          {job.customer_id && (
            <button className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition" onClick={createProposal}>
              Create Proposal
            </button>
          )}
          <button className="px-3 py-2 rounded-xl bg-[#1E293B] text-white hover:bg-[#293548] transition" onClick={() => nav("/dashboard/jobs")}>Back</button>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="text-neutral-400 mb-6 text-lg">No line items yet.</div>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-3 rounded-xl text-white font-medium hover:opacity-90 transition shadow-lg"
                style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)" }}
                onClick={openNew}
              >
                + Add Item
              </button>
              <button
                className="px-4 py-3 rounded-xl bg-[#1E293B] text-white font-medium hover:bg-[#293548] transition"
                onClick={startVoice}
              >
                🎤 Tap & Talk
              </button>
            </div>
          </div>
        ) : items.map((it: any, idx: number) => {
          const colors = statusColor(it);
          return (
            <button
              key={it.id}
              onClick={() => openEdit(it)}
              className="w-full text-left rounded-xl p-4 border transition hover:opacity-95"
              style={{ border: colors.border, background: colors.background }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-neutral-400">Line #{it.line_no}</div>
                  <div className="font-medium mb-1">{it.description_clean || it.description_raw || it.description || "—"}</div>
                  <div className="text-sm text-neutral-300">
                    {it.quantity ?? 1} {it.unit || "each"} @ ${Number(it.unit_price || 0).toFixed(2)} •
                    <span className="ml-1 font-semibold"> ${Number(it.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-400">{it.finalized ? "Finalized" : "Needs review"}</div>
                  {!it.finalized && Number(it.total) > 0 && it.description_clean && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) return;
                        await fetch(`/functions/v1/finalize-scope-item`, {
                          method: "POST",
                          headers: {
                            'Authorization': `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ item_id: it.id, finalized: true }),
                        });
                        window.location.reload();
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                      title="Mark as finalized"
                    >
                      Finalize
                    </button>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <CustomerEditor
        open={openCreateCust}
        mode="create"
        onClose={() => setOpenCreateCust(false)}
        onSaved={(cust: any) => attachCustomer(cust.id)}
      />

      <CustomerPicker
        open={openPickCust}
        onClose={() => setOpenPickCust(false)}
        onSelect={(cust: any) => attachCustomer(cust.id)}
      />

      <LineItemEditor
        open={editorOpen}
        jobId={job.id}
        item={editingItem}
        onClose={() => setEditorOpen(false)}
        onSaved={() => window.location.reload()}
      />

      <TaxRateModal
        open={taxModal}
        initial={Number(data.tax?.rate_percent ?? 0)}
        onClose={() => setTaxModal(false)}
        onSave={async (val) => {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          await fetch(`/functions/v1/set-job-tax`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job_id: job.id, tax_override_rate: val }),
          });

          setTaxModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
