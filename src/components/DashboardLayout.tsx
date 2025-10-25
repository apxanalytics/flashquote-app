import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AIChatButton from './AIChatButton';
import MobileBottomNav from './MobileBottomNav';
import PWAInstallPrompt from './PWAInstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import {
  Home,
  Mic,
  FileText,
  DollarSign,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  isPrimary?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'New Job', path: '/dashboard/new-job', icon: Mic, isPrimary: true },
  { name: 'Jobs', path: '/dashboard/jobs', icon: FileText },
  { name: 'Invoices', path: '/dashboard/invoices', icon: DollarSign },
  { name: 'Customers', path: '/dashboard/customers', icon: Users },
  { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  { name: 'Help', path: '/dashboard/help', icon: HelpCircle },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const NavLinks = () => {
    const anyNavItemActive = navItems.some(item =>
      item.path === location.pathname ||
      (location.pathname.startsWith(item.path + '/') && item.path !== '/dashboard')
    );

    return (
      <>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (location.pathname.startsWith(item.path + '/') && item.path !== '/dashboard');

          const shouldShowAsPrimary = item.isPrimary && !anyNavItemActive;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center px-4 py-3 ${
                isActive
                  ? 'rounded-lg text-white shadow-[0_0_8px_rgba(59,130,246,.45)] bg-[linear-gradient(135deg,#3B82F6,#60A5FA)]'
                  : shouldShowAsPrimary
                  ? 'rounded-lg bg-accent-cyan text-dark-bg hover:bg-accent-teal font-semibold'
                  : 'rounded-lg text-slate-300 hover:text-white hover:shadow-[0_0_6px_rgba(59,130,246,.45)] hover:bg-[#1E293B] focus:shadow-[0_0_8px_rgba(59,130,246,.6)] focus:outline-none transition-all duration-150'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden mr-3 text-gray-400 hover:text-accent-cyan"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/dashboard" className="text-2xl font-bold text-white">
                FlashQuote
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <div className="text-sm text-white font-medium">
                  {profile?.owner_name}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-400 hover:text-accent-cyan transition-colors p-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden lg:block w-64 bg-dark-card border-r border-dark-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            <NavLinks />
          </nav>
        </aside>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <div className="fixed top-0 left-0 w-64 h-full bg-dark-card z-50 lg:hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-dark-border">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  onClick={closeMobileMenu}
                  className="text-gray-400 hover:text-accent-cyan"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <NavLinks />
              </nav>
            </div>
          </>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <PWAInstallPrompt />
      <OfflineIndicator />
      <MobileBottomNav />
      <AIChatButton />
    </div>
  );
}
