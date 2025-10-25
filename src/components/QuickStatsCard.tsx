import { LucideIcon } from 'lucide-react';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export default function QuickStatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
}: QuickStatsCardProps) {
  return (
    <div className="bg-dark-card rounded-xl shadow-sm border border-dark-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBgColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
    </div>
  );
}
