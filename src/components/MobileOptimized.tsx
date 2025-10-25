import { ReactNode } from 'react';

export function MobileCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function MobileGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
}

export function MobileStack({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled = false,
  type = 'button'
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) {
  const baseClasses = 'px-4 py-2.5 sm:py-2 rounded-lg font-semibold transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function MobileTable({
  children,
  headers,
  className = ''
}: {
  children: ReactNode;
  headers: string[];
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden sm:table-header-group">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  fullScreen?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 sm:pb-0 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className={`inline-block align-bottom bg-white rounded-t-2xl sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${
          fullScreen ? 'sm:max-w-full sm:h-screen' : 'sm:max-w-lg'
        }`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 -mr-2"
              >
                ×
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = ''
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base sm:text-sm"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function MobileTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base sm:text-sm resize-none"
      />
    </div>
  );
}

export function MobileSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  className = ''
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-base sm:text-sm appearance-none bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MobilePageHeader({
  title,
  subtitle,
  action,
  className = ''
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function MobileTabs({
  tabs,
  activeTab,
  onChange,
  className = ''
}: {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}) {
  return (
    <div className={`border-b border-gray-200 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 ${className}`}>
      <nav className="flex space-x-4 sm:space-x-6 min-w-max sm:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pb-3 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function MobileEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-8 sm:py-12 ${className}`}>
      <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">{description}</p>
      {action}
    </div>
  );
}
