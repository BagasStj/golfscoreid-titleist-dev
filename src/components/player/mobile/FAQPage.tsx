import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    {
      category: 'General',
      question: 'What is GolfScore ID?',
      answer: 'GolfScore ID is a golf tournament management application that makes it easy for players to record scores, view leaderboards, and follow tournament progress in real-time.',
    },
    {
      category: 'General',
      question: 'How do I register an account?',
      answer: 'You can register by clicking the "Register" button on the login page, then filling out the registration form with complete information such as name, email, password, and other profile information.',
    },
    {
      category: 'Tournament',
      question: 'How do I join a tournament?',
      answer: 'The tournament admin will register you for the tournament. Once registered, you will see the tournament on the "My Tournaments" page and can start recording scores.',
    },
    {
      category: 'Tournament',
      question: 'What is a Flight in a tournament?',
      answer: 'A Flight is a group of players who play together in one tournament. Each flight has a different start time and starting hole to manage the flow of play.',
    },
    {
      category: 'Scoring',
      question: 'How do I record scores?',
      answer: 'Open the ongoing tournament, select "Start Scoring", then enter the number of strokes for each hole. Scores will be automatically saved and displayed on the leaderboard.',
    },
    {
      category: 'Scoring',
      question: 'What is the difference between Stroke Play and Stableford?',
      answer: 'Stroke Play counts total strokes (fewer is better), while Stableford uses a point system based on results at each hole (more points is better).',
    },
    {
      category: 'Scoring',
      question: 'What is System 36?',
      answer: 'System 36 is a scoring method that calculates points based on performance at certain holes. This system is often used for tournaments with players of various levels.',
    },
    {
      category: 'Scoring',
      question: 'What do the score symbols mean (Eagle, Birdie, etc)?',
      answer: 'Eagle (🦅) = 2 strokes under par, Birdie (🐦) = 1 stroke under par, Par (✓) = equal to par, Bogey (△) = 1 stroke over par, Double Bogey+ (✕) = 2+ strokes over par.',
    },
    {
      category: 'Leaderboard',
      question: 'How do I view the leaderboard?',
      answer: 'Open the tournament you want to view, then select the "Leaderboard" menu. You will see the ranking of all players based on their scores.',
    },
    {
      category: 'Leaderboard',
      question: 'How often is the leaderboard updated?',
      answer: 'The leaderboard is updated in real-time every time a player enters a new score. You can see ranking changes instantly.',
    },
    {
      category: 'Profile',
      question: 'How do I change my profile?',
      answer: 'Open the "Profile" tab, select "Edit Profile", then change the desired information such as name, phone number, handicap, and clothing size.',
    },
    {
      category: 'Profile',
      question: 'What is a Handicap?',
      answer: 'A Handicap is a number that indicates a golf player\'s skill level. The lower the handicap, the better the player\'s ability.',
    },
    {
      category: 'Profile',
      question: 'How do I view my statistics?',
      answer: 'Open the "Profile" tab, then select "My Statistics". You will see your overall performance, score distribution, and achievements.',
    },
    {
      category: 'Technical',
      question: 'Can the app be used offline?',
      answer: 'Currently the app requires an internet connection to save and retrieve data. Offline features are under development.',
    },
    {
      category: 'Technical',
      question: 'What if I forget my password?',
      answer: 'Contact the admin or support team at support@golfscore.id to reset your password. Automatic password reset feature will be available soon.',
    },
    {
      category: 'Technical',
      question: 'The app is not working properly, what should I do?',
      answer: 'Try refreshing the page or logging out and then logging back in. If the problem persists, contact the support team with details of the issue you are experiencing.',
    },
  ];

  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex flex-col">
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }
        .category-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .category-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scroll::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .category-scroll::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>

      {/* Header */}
      <div className="flex-shrink-0  shadow-2xl border-b border-gray-800">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate('/player?tab=profile')}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-white font-bold text-xl">Help & FAQ</h2>
            <p className="text-red-100 text-sm">Frequently asked questions</p>
          </div>
        </div>
      </div>

      {/* Content with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-5 pb-8">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 py-3 bg-black/30 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 category-scroll">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'bg-black/30 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No results found</p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((item, index) => (
                <div
                  key={index}
                  className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden transition-all hover:border-gray-700"
                >
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex items-start justify-between p-4 text-left"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-sm leading-relaxed">
                        {item.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedIndex === index && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="border-t border-gray-800 pt-3">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contact Support */}
          <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-xl p-5 border border-red-900/30">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1">Still need help?</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Our support team is ready to help you
                </p>
                <button
                  onClick={() => alert('Email: support@golfscore.id\nPhone: +62 812-3456-7890')}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
