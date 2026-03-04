import { Link } from 'react-router-dom';
import { Shield, Trophy, ArrowRight } from 'lucide-react';

export default function LoginSelectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #16a34a 1px, transparent 1px),
                             linear-gradient(to bottom, #16a34a 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-200/20 to-primary-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-secondary-200/15 to-secondary-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-5xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-white to-primary-50 rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.1)] mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent rounded-[28px]"></div>
            <img 
              src="/logo-app.png" 
              alt="GolfScore ID" 
              className="w-16 h-16 object-contain relative z-10"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'text-5xl relative z-10';
                  fallback.textContent = '⛳';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          
          <h1 className="text-4xl font-bold text-secondary-900 mb-3 tracking-tight">
            Welcome to GolfScore ID
          </h1>
          <p className="text-lg text-secondary-600 font-medium">
            Choose your login type to continue
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Player Login Card */}
          <Link
            to="/player/login"
            className="group relative bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-2 border-primary-100 hover:border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-[0_16px_48px_rgba(34,197,94,0.15)] hover:-translate-y-1"
          >
            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-500"></div>
            
            <div className="p-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[20px] shadow-[0_8px_24px_rgba(34,197,94,0.25)] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              {/* Content */}
              <h2 className="text-2xl font-bold text-secondary-900 mb-3">
                Player Login
              </h2>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                Access your tournament scorecard, track your performance, and view live leaderboards
              </p>
              
              {/* Features */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                  Submit scores in real-time
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                  View tournament leaderboard
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3"></div>
                  Track your scorecard
                </li>
              </ul>
              
              {/* Button */}
              <div className="flex items-center justify-between text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                <span>Login as Player</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Admin Login Card */}
          <Link
            to="/admin/login"
            className="group relative bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-2 border-secondary-200 hover:border-secondary-400 overflow-hidden transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:-translate-y-1"
          >
            {/* Decorative top bar */}
            <div className="h-2 bg-gradient-to-r from-secondary-600 via-secondary-700 to-secondary-600"></div>
            
            <div className="p-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-700 to-secondary-800 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              {/* Content */}
              <h2 className="text-2xl font-bold text-secondary-900 mb-3">
                Admin Portal
              </h2>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                Manage tournaments, register players, configure settings, and monitor live scoring
              </p>
              
              {/* Features */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-3"></div>
                  Create and manage tournaments
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-3"></div>
                  Register and manage players
                </li>
                <li className="flex items-center text-sm text-secondary-700">
                  <div className="w-1.5 h-1.5 bg-secondary-600 rounded-full mr-3"></div>
                  Live monitoring dashboard
                </li>
              </ul>
              
              {/* Button */}
              <div className="flex items-center justify-between text-secondary-700 font-semibold group-hover:text-secondary-900 transition-colors">
                <span>Login as Admin</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-secondary-500 font-medium">
            © 2024 GolfScore ID. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
