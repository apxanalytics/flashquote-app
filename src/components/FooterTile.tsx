import { Link } from 'react-router-dom';
import { MapPin, Settings } from 'lucide-react';

interface FooterTileProps {
  needsProfile?: boolean;
  serviceArea?: string;
}

export default function FooterTile({ needsProfile = false, serviceArea = '50 miles' }: FooterTileProps) {
  return (
    <div className="rounded-lg border border-dark-border bg-dark-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-300">
          {needsProfile ? (
            <>
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-blue-500" />
              </div>
              <span>Finish your Business Profile to unlock branded proposals and invoices.</span>
            </>
          ) : (
            <>
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <span>Service Area active · {serviceArea} · Edit Pricing & Terms to tune your rates.</span>
            </>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {needsProfile ? (
            <Link
              to="/dashboard/settings"
              className="rounded-lg border-2 border-accent-cyan px-4 py-2 text-sm font-semibold text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
            >
              Complete Profile
            </Link>
          ) : (
            <Link
              to="/dashboard/settings?tab=pricing"
              className="rounded-lg border border-dark-border bg-dark-hover px-4 py-2 text-sm font-semibold text-white hover:bg-dark-border transition-colors"
            >
              Pricing & Terms
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
