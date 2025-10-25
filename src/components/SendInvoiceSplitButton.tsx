import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FileText, RefreshCw, DollarSign } from 'lucide-react';

export default function SendInvoiceSplitButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        className="flex items-center justify-center w-full bg-dark-bg text-accent-cyan border-2 border-accent-cyan px-4 py-3 rounded-lg font-semibold hover:bg-dark-border hover-glow-blue focus-glow-blue transition-all duration-150 relative"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center justify-center gap-2">
          <DollarSign className="w-5 h-5" />
          <span>Send Invoice</span>
        </div>
        <ChevronDown className={`w-4 h-4 absolute right-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-10 mt-2 rounded-lg border border-dark-border bg-dark-card shadow-xl">
          <button
            onClick={() => {
              navigate('/dashboard/invoices/new');
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 rounded-t-lg px-4 py-3 text-left text-white hover:bg-dark-hover transition-colors"
          >
            <FileText className="w-5 h-5 text-accent-cyan" />
            <div>
              <div className="font-semibold">Create New</div>
              <div className="text-xs text-gray-400">Start fresh invoice</div>
            </div>
          </button>

          <div className="border-t border-dark-border" />

          <button
            onClick={() => {
              navigate('/dashboard/jobs?status=signed');
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 rounded-b-lg px-4 py-3 text-left text-white hover:bg-dark-hover transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-accent-teal" />
            <div>
              <div className="font-semibold">Convert from Proposal</div>
              <div className="text-xs text-gray-400">Pick a signed job</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
