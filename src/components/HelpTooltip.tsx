import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
}

export default function HelpTooltip({ content, side = 'top', children }: HelpTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children || (
            <button
              type="button"
              className="inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className="z-50 max-w-xs px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg animate-fade-in"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
