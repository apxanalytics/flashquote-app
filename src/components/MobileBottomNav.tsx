import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Mic, DollarSign, Menu } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/dashboard') && location.pathname === '/dashboard'
              ? 'text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link
          to="/dashboard/jobs"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/dashboard/jobs') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs font-medium">Jobs</span>
        </Link>

        <Link
          to="/dashboard/new-job"
          className="flex flex-col items-center justify-center -mt-6"
        >
          <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
            <Mic className="w-7 h-7" />
          </div>
          <span className="text-xs font-medium text-gray-600 mt-1">New Job</span>
        </Link>

        <Link
          to="/dashboard/invoices"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/dashboard/invoices') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <DollarSign className="w-6 h-6" />
          <span className="text-xs font-medium">Invoices</span>
        </Link>

        <Link
          to="/dashboard/settings"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/dashboard/settings') ||
            isActive('/dashboard/customers') ||
            isActive('/dashboard/reports') ||
            isActive('/dashboard/help')
              ? 'text-blue-600'
              : 'text-gray-600'
          }`}
        >
          <Menu className="w-6 h-6" />
          <span className="text-xs font-medium">More</span>
        </Link>
      </div>
    </nav>
  );
}
