import { useState } from 'react';
import { ArrowLeft, Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqData, categories, FAQ } from '../data/faqData';
import { supabase } from '../lib/supabase';

export default function FAQsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [ratedFAQs, setRatedFAQs] = useState<Set<number>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  async function rateFAQ(faqId: number, rating: 'yes' | 'no') {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('faq_ratings').insert({
          user_id: user.id,
          faq_id: faqId.toString(),
          rating
        });
      }

      setRatedFAQs(prev => new Set(prev).add(faqId));
    } catch (error) {
      console.error('Failed to rate FAQ:', error);
    }
  }

  return (
          <div className="max-w-5xl mx-auto px-4 pb-12">
        <Link
          to="/dashboard/help"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Help Center
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about FlashQuote
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs... (e.g., 'how to send proposal')"
              className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-md"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                selectedCategory === cat.id
                  ? 'text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600'
              }`}
              style={selectedCategory === cat.id ? {background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'} : {}}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {filteredFAQs.length > 0 && (
          <p className="text-gray-600 mb-6">
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
          </p>
        )}

        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-xl text-gray-600 mb-2">No results found for "{searchTerm}"</p>
              <p className="text-gray-500 mb-6">Try a different search term or{' '}
                <Link to="/dashboard/help/support" className="text-blue-600 hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className={`bg-white rounded-lg border-2 transition-all ${
                  expandedFAQ === faq.id
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between group"
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                >
                  <span className="font-semibold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <span className="text-2xl text-gray-400 flex-shrink-0">
                    {expandedFAQ === faq.id ? '−' : '+'}
                  </span>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 text-gray-700 leading-relaxed space-y-3">
                      {faq.answer.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Was this helpful?</span>

                      {ratedFAQs.has(faq.id) ? (
                        <span className="text-sm text-green-600 font-medium">
                          Thanks for your feedback!
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => rateFAQ(faq.id, 'yes')}
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Yes
                          </button>
                          <button
                            onClick={() => rateFAQ(faq.id, 'no')}
                            className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <ThumbsDown className="w-4 h-4 mr-1" />
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Still Have Questions?</h3>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link
            to="/dashboard/help/support"
            className="inline-flex items-center text-white px-8 py-4 rounded-xl transition-all font-semibold text-lg shadow-lg" style={{background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}} onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)'}
          >
            Contact Support
          </Link>
        </div>
      </div>
  );
}
