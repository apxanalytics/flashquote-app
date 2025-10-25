import { LucideIcon } from 'lucide-react';

interface ActivityFeedItemProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  text: string;
  time: string;
}

export default function ActivityFeedItem({
  icon: Icon,
  iconBgColor,
  text,
  time,
}: ActivityFeedItemProps) {
  return (
    <div className="flex items-start space-x-3 py-3 border-b border-dark-border last:border-0">
      <div className={`${iconBgColor} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">{text}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
