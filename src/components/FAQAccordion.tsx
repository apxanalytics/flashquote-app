import { useState } from 'react';
import { ChevronDown, Link as LinkIcon, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
  id: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [key: string]: 'helpful' | 'not-helpful' | null }>({});

  const toggleItem = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFeedback = (id: string, type: 'helpful' | 'not-helpful') => {
    setFeedback({ ...feedback, [id]: type });
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          id={item.id}
          className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-bold text-gray-900 text-lg pr-4">{item.question}</h3>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform ${
                expandedId === item.id ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedId === item.id && (
            <div className="px-5 pb-5">
              <div className="pt-2 pb-4 text-gray-700 leading-relaxed border-t border-gray-200">
                {typeof item.answer === 'string' ? <p>{item.answer}</p> : item.answer}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  {feedback[item.id] === null || feedback[item.id] === undefined ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFeedback(item.id, 'helpful')}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 transition-colors text-sm"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Yes
                      </button>
                      <button
                        onClick={() => handleFeedback(item.id, 'not-helpful')}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 transition-colors text-sm"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        No
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-green-600">
                      Thank you for your feedback!
                    </span>
                  )}
                </div>
                <button
                  onClick={() => copyLink(item.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy link
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
