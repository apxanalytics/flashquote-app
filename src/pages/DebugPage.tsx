import { useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';

export default function DebugPage() {
  const [healthResult, setHealthResult] = useState<any>(null);
  const [probeResult, setProbeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runHealthCheck() {
    setLoading(true);
    try {
      const apiUrl = `/functions/v1/health-check`;
      const res = await fetch(apiUrl);
      const data = await res.json();
      setHealthResult({ status: res.status, data });
      console.log('[health-check]', res.status, data);
    } catch (e: any) {
      setHealthResult({ error: e.message });
      console.error('[health-check] error:', e);
    }
    setLoading(false);
  }

  async function runProbe() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setProbeResult({ error: 'Not authenticated' });
        return;
      }

      const fd = new FormData();
      fd.append('audio', new Blob([new Uint8Array([0, 1, 2])], { type: 'audio/webm' }), 'test.webm');

      const apiUrl = `/functions/v1/whisper-transcribe`;
      console.log('[probe] calling', apiUrl);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: fd,
      });

      const text = await res.text();
      console.log('[probe] status', res.status, 'response:', text);

      setProbeResult({
        status: res.status,
        ok: res.ok,
        response: text,
        parsed: res.ok ? JSON.parse(text) : null,
      });
    } catch (e: any) {
      setProbeResult({ error: e.message });
      console.error('[probe] error:', e);
    }
    setLoading(false);
  }

  return (
          <div className="space-y-6 p-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">Debug Tools</h1>
          <p className="text-sm text-gray-400 mt-1">
            Diagnostic tools for troubleshooting transcription issues
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2">Environment Variables</h2>
            <div className="bg-dark-bg rounded p-4 space-y-2 text-sm font-mono">
              <div className="text-gray-300">
                <span className="text-gray-500">VITE_SUPABASE_URL:</span>{' '}
                {import.meta.env.VITE_SUPABASE_URL}
              </div>
              <div className="text-gray-300">
                <span className="text-gray-500">VITE_MOCK_TRANSCRIBE:</span>{' '}
                {import.meta.env.VITE_MOCK_TRANSCRIBE || '(not set)'}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2">1. Health Check</h2>
            <p className="text-sm text-gray-400 mb-3">
              Check if environment variables are configured correctly on the server
            </p>
            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="rounded-lg bg-accent-cyan px-4 py-2 font-semibold text-dark-bg hover:bg-accent-teal transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Health Check'}
            </button>
            {healthResult && (
              <div className="mt-3 bg-dark-bg rounded p-4">
                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(healthResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-2">2. Transcription Probe</h2>
            <p className="text-sm text-gray-400 mb-3">
              Test the whisper-transcribe endpoint with mock audio data
            </p>
            <button
              onClick={runProbe}
              disabled={loading}
              className="rounded-lg bg-accent-cyan px-4 py-2 font-semibold text-dark-bg hover:bg-accent-teal transition-colors disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Probe'}
            </button>
            {probeResult && (
              <div className="mt-3 bg-dark-bg rounded p-4">
                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(probeResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="border-t border-dark-border pt-4">
            <h2 className="text-lg font-semibold text-gray-100 mb-2">Expected Results</h2>
            <div className="text-sm text-gray-400 space-y-2">
              <div>
                <strong className="text-gray-300">With MOCK_TRANSCRIBE=1:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Health Check should show mock_transcribe: "1"</li>
                  <li>Probe should return status 200 with transcript about painting</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-300">With real OpenAI key:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Health Check should show fq_looks_like_key: true</li>
                  <li>Probe may fail with mock audio, but should not show "bad_key"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-4">
          <h3 className="font-semibold text-amber-400 mb-2">How to Use</h3>
          <ol className="text-sm text-amber-200 space-y-1 list-decimal list-inside">
            <li>Run Health Check first to verify environment configuration</li>
            <li>Run Probe to test the transcription endpoint</li>
            <li>Check browser console for detailed logs</li>
            <li>Try recording on the New Job page and check console logs</li>
          </ol>
        </div>
      </div>
  );
}
