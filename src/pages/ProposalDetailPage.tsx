import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { proposalsAPI } from '../lib/api';
import type { ProposalDetail, ScopeItem } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Send, CheckCircle, Download, ArrowLeft } from 'lucide-react';

export default function ProposalDetailPage() {
  const params = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const proposalId = params?.proposalId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProposalDetail | null>(null);
  const [taxPct, setTaxPct] = useState<number>(0);
  const [depositPct, setDepositPct] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!proposalId) return;
    loadProposal();
  }, [proposalId]);

  async function loadProposal() {
    if (!proposalId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await proposalsAPI.getDetail(proposalId);
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  }

  const subtotal = data?.summary?.subtotal || 0;
  const taxAmount = useMemo(() => round2(subtotal * (Number(taxPct) || 0) / 100), [subtotal, taxPct]);
  const total = useMemo(() => round2(subtotal + taxAmount), [subtotal, taxAmount]);
  const depositAmount = useMemo(() => round2(total * (Number(depositPct) || 0) / 100), [total, depositPct]);

  async function handleSend() {
    if (!proposalId || !data) return;

    const viaInput = window.prompt('Send via: sms | email | both', 'both');
    if (!viaInput) return;

    const via = viaInput.toLowerCase() as 'sms' | 'email' | 'both';

    let smsTo: string | undefined;
    let emailTo: string | undefined;

    if (via === 'sms' || via === 'both') {
      const phone = data.customer?.phone || '';
      smsTo = window.prompt(
        'SMS to (E.164 format, e.g., +15551234567). Leave blank to use customer phone.',
        phone
      ) || undefined;
    }

    if (via === 'email' || via === 'both') {
      const email = data.customer?.email || '';
      emailTo = window.prompt(
        'Email to. Leave blank to use customer email.',
        email
      ) || undefined;
    }

    const message = window.prompt(
      'Optional message to include:',
      'Your proposal is ready for review.'
    ) || undefined;

    setUpdating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-proposal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          via,
          smsTo,
          emailTo,
          message,
          includePdf: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send proposal');
      }

      alert(`Proposal sent via ${via}!\n\nView URL: ${result.viewUrl}`);
      await loadProposal();
    } catch (e: any) {
      alert(e?.message || 'Failed to send proposal');
    } finally {
      setUpdating(false);
    }
  }

  async function handleApprove() {
    if (!proposalId) return;
    setUpdating(true);
    try {
      await proposalsAPI.updateStatus(proposalId, 'signed');
      alert('Proposal marked as approved. Stripe invoice integration will be added in a future step.');
      await loadProposal();
    } catch (e: any) {
      alert(e?.message || 'Failed to mark as approved');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDownloadPDF() {
    if (!proposalId) return;
    setUpdating(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-proposal-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposalId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      alert('PDF generated successfully!');
      window.open(result.pdfUrl, '_blank');
      await loadProposal();
    } catch (e: any) {
      alert(e?.message || 'Failed to generate PDF');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
              <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
    );
  }

  if (error || !data) {
    return (
              <div className="p-6">
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error || 'Proposal not found'}
          </div>
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="mt-4 text-accent-cyan hover:text-accent-teal"
          >
            ← Back to Jobs
          </button>
        </div>
    );
  }

  const { proposal, job, customer, items } = data;

  return (
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            to="/dashboard/jobs"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>

        <div className="bg-dark-card border border-gray-800 rounded-xl p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-accent-cyan" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">Proposal</h1>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>
                  <span className="text-gray-500">Job:</span>{' '}
                  <span className="font-medium text-white">{job?.title || job?.id}</span>
                </div>
                {customer && (
                  <>
                    <div>
                      <span className="text-gray-500">Customer:</span>{' '}
                      <span className="font-medium text-white">{customer.name}</span>
                    </div>
                    {customer.address && (
                      <div className="text-gray-400">{customer.address}</div>
                    )}
                    {(customer.email || customer.phone) && (
                      <div className="text-gray-400">
                        {customer.email}
                        {customer.phone ? ` • ${customer.phone}` : ''}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-gray-500 mb-1">Status</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                proposal.status === 'signed' ? 'bg-green-500/20 text-green-400' :
                proposal.status === 'sent' ? 'bg-blue-500/20 text-blue-400' :
                proposal.status === 'viewed' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {proposal.status}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-3 font-medium text-gray-400">Description</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-400">Qty</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-400">Unit</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-400">$/Unit</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-800">
                    <td className="py-3 px-3 text-white">{item.description}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-gray-300">{fmtNum(item.quantity)}</td>
                    <td className="py-3 px-3 text-right uppercase text-gray-300">{item.unit}</td>
                    <td className="py-3 px-3 text-right tabular-nums text-gray-300">{fmtCurrency(item.unit_price)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium text-white">{fmtCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td colSpan={4} className="py-3 px-3 text-right font-semibold text-white">Subtotal</td>
                  <td className="py-3 px-3 text-right font-bold text-white">{fmtCurrency(subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-400 mb-2">Tax %</div>
            <input
              type="number"
              className="w-full bg-dark-bg border border-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
              placeholder="e.g., 8.25"
              value={taxPct}
              onChange={(e) => setTaxPct(Number(e.target.value))}
            />
            <div className="mt-2 text-right text-sm text-gray-400">
              Tax: {fmtCurrency(taxAmount)}
            </div>
          </div>

          <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-400 mb-2">Deposit %</div>
            <input
              type="number"
              className="w-full bg-dark-bg border border-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent-cyan focus:border-transparent"
              placeholder="e.g., 30"
              value={depositPct}
              onChange={(e) => setDepositPct(Number(e.target.value))}
            />
            <div className="mt-2 text-right text-sm text-gray-400">
              Deposit: {fmtCurrency(depositAmount)}
            </div>
          </div>

          <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-400 mb-2">Total</div>
            <div className="text-3xl font-bold text-white text-right">{fmtCurrency(total)}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSend}
            className="inline-flex items-center gap-2 bg-accent-cyan text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-accent-teal transition-colors"
          >
            <Send className="w-4 h-4" />
            Send (SMS/Email)
          </button>
          <button
            onClick={handleApprove}
            disabled={updating || proposal.status === 'signed'}
            className="inline-flex items-center gap-2 bg-dark-card border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            {proposal.status === 'signed' ? 'Approved' : 'Mark Approved'}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={updating}
            className="inline-flex items-center gap-2 bg-dark-card border border-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {updating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>
  );
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n) || 0);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(n) || 0);
}
