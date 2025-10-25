import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Rocket, Video, HelpCircle, Phone, Lightbulb, ArrowRight } from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const quickLinks = [
    {
      icon: Rocket,
      title: 'Getting Started Guide',
      description: 'Everything you need to know in 5 minutes',
      link: '/dashboard/help/getting-started',
      bgColor: 'bg-blue-500',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch and learn in minutes',
      link: '/dashboard/help/tutorials',
      bgColor: 'bg-green-500',
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Find answers to common questions',
      link: '/dashboard/help/faqs',
      bgColor: 'bg-pink-500',
    },
    {
      icon: Phone,
      title: 'Contact Support',
      description: 'Get help from our team',
      link: '/dashboard/help/support',
      bgColor: 'bg-red-500',
    },
  ];

  const popularArticles = [
    { title: 'How to create your first proposal', category: 'Getting Started', link: '/dashboard/help/getting-started#step3' },
    { title: 'Using voice input for proposals', category: 'Voice Input', link: '/dashboard/help/tutorials' },
    { title: 'Setting up payment processing with Stripe', category: 'Payments', link: '/dashboard/help/getting-started#step4' },
    { title: 'Understanding AI-generated estimates', category: 'AI Settings', link: '/dashboard/help/faqs#ai-pricing' },
    { title: 'How to send and track proposals', category: 'Proposals', link: '/dashboard/help/faqs#sending' },
    { title: 'Managing customer communications', category: 'Customers', link: '/dashboard/help/faqs#customers' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length > 2) {
      const results = popularArticles
        .filter(article =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.category.toLowerCase().includes(query.toLowerCase())
        )
        .map(article => article.title);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
          <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-400 mb-10">
            Get answers, watch tutorials, and learn how to make the most of FlashQuote
          </p>

          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for help... (e.g., 'how to send proposal')"
                className="w-full pl-14 pr-6 py-5 text-lg bg-dark-card border-2 border-dark-border text-white rounded-2xl focus:ring-2 focus:ring-accent-cyan focus:border-transparent shadow-lg hover:shadow-xl transition-shadow"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-dark-card border-2 border-dark-border rounded-2xl shadow-xl z-10 max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-6 py-4 hover:bg-dark-bg border-b border-dark-border last:border-b-0 transition-colors"
                    onClick={() => setSearchQuery(result)}
                  >
                    <div className="flex items-center">
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-white">{result}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                to={link.link}
                className="group bg-dark-card rounded-2xl border-2 border-dark-border p-6 hover:border-accent-cyan hover:shadow-2xl transition-all duration-300"
              >
                <div className={`${link.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-cyan transition-colors">
                  {link.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{link.description}</p>
                <div className="mt-4 flex items-center text-accent-cyan font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16 px-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-start">
              <div className="bg-accent-cyan/10 backdrop-blur-sm rounded-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold mr-5 flex-shrink-0">
                AI
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">
                  New to FlashQuote?
                </h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Start here! Our Getting Started Guide walks you through everything in just 5 minutes. No complicated setup required.
                </p>
                <Link
                  to="/dashboard/help/getting-started"
                  className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors font-semibold shadow-lg"
                >
                  Start Setup Guide <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-accent-cyan to-purple-700 rounded-2xl p-8 border-2 border-accent-cyan">
            <div className="flex items-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-16 h-16 flex items-center justify-center mr-5 flex-shrink-0 shadow-lg">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Have a Feature Idea?
                </h3>
                <p className="text-purple-50 mb-6 leading-relaxed">
                  We love hearing from our users! Share your ideas, vote on upcoming features, and help shape FlashQuote.
                </p>
                <Link
                  to="/dashboard/help/feature-requests"
                  className="inline-flex items-center bg-white text-accent-teal px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-semibold shadow-lg"
                >
                  Submit Ideas <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular Articles</h2>
            <Link to="/dashboard/help/faqs" className="text-accent-cyan hover:text-accent-teal font-semibold flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                to={article.link}
                className="bg-dark-card p-5 rounded-xl border-2 border-dark-border hover:border-accent-cyan hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block text-xs font-semibold text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full mb-3">
                      {article.category}
                    </span>
                    <h3 className="text-white font-semibold text-lg group-hover:text-accent-cyan transition-colors">
                      {article.title}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-cyan group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-dark-card rounded-2xl border-2 border-dark-border p-8 text-center mb-8 mx-4">
          <Phone className="w-12 h-12 text-accent-cyan mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Still Need Help?
          </h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Our support team is here for you. Get help via email, text, or schedule a call with a real person.
          </p>
          <Link
            to="/dashboard/help/support"
            className="inline-flex items-center bg-accent-cyan text-dark-bg px-8 py-4 rounded-xl hover:bg-accent-teal transition-colors font-semibold text-lg shadow-lg"
          >
            Contact Support <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
  );
}
