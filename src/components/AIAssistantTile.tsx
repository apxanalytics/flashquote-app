import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AIAssistantTile() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleAsk() {
    const text = query.toLowerCase().trim();

    if (text.includes('new job') || text.includes('create job') || text.includes('start job')) {
      navigate('/dashboard/new-job');
      setQuery('');
      return;
    }

    if (text.includes('invoice') && (text.includes('new') || text.includes('create') || text.includes('send'))) {
      navigate('/dashboard/invoices/new');
      setQuery('');
      return;
    }

    if (text.includes('customer') && (text.includes('new') || text.includes('add'))) {
      navigate('/dashboard/customers');
      setQuery('');
      return;
    }

    alert("AI Assistant can help you:\n• Create new job\n• Send invoice\n• Add customer\n\nTry: 'Create new job' or 'Send invoice'");
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleAsk();
    }
  }

  return (
    <div className="relative rounded-xl border border-[#1E3A8A] bg-[#0F172A]">
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.25),rgba(96,165,250,0.18))" }}
      />
      <div className="relative flex items-center gap-3 px-4 py-2">
        <Sparkles className="w-5 h-5 text-blue-300" />
        <span className="font-semibold text-blue-200">AI Assistant Ready</span>
        <div className="flex-1 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-white placeholder-gray-500 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
            placeholder="Ask me to create a job, send an invoice, or answer a question…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleAsk}
            className="rounded-lg bg-accent-cyan px-4 py-2 text-white font-semibold hover:bg-accent-teal shadow-sm hover-glow-blue focus-glow-blue transition-all duration-150"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
