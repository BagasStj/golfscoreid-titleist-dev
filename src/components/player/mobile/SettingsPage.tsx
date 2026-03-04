import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Bell, 
  Globe, 
  Moon, 
  Shield, 
  HelpCircle,
  ChevronRight,
  Check
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState({
    tournament: true,
    scores: true,
    news: false,
  });

  const [language, setLanguage] = useState('id');
  const [darkMode, setDarkMode] = useState(true);

  if (!user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#0f0f0f] to-black z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

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
            <h2 className="text-white font-bold text-xl">Settings</h2>
            <p className="text-red-100 text-sm">Manage app preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-5 pb-8">
          {/* Notifications Section */}
          <div className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Notifications</h3>
                  <p className="text-gray-400 text-xs">Manage notifications</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              <ToggleItem
                id="tournament-updates"
                label="Tournament Updates"
                description="Notifications about tournaments"
                checked={notifications.tournament}
                onChange={(checked) => setNotifications({ ...notifications, tournament: checked })}
              />
              <ToggleItem
                id="score-updates"
                label="Score Updates"
                description="Notifications when scores are updated"
                checked={notifications.scores}
                onChange={(checked) => setNotifications({ ...notifications, scores: checked })}
              />
              <ToggleItem
                id="news-announcements"
                label="News & Announcements"
                description="Latest news and announcements"
                checked={notifications.news}
                onChange={(checked) => setNotifications({ ...notifications, news: checked })}
              />
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Appearance</h3>
                  <p className="text-gray-400 text-xs">Customize app theme</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <ToggleItem
                id="dark-mode"
                label="Dark Mode"
                description="Use dark theme"
                checked={darkMode}
                onChange={setDarkMode}
              />
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Language</h3>
                  <p className="text-gray-400 text-xs">Select app language</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              <SelectItem
                label="Indonesian"
                selected={language === 'id'}
                onClick={() => setLanguage('id')}
              />
              <SelectItem
                label="English"
                selected={language === 'en'}
                onClick={() => setLanguage('en')}
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Privacy & Security</h3>
                  <p className="text-gray-400 text-xs">Manage data and security</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              <MenuItem
                label="Change Password"
                description="Update account password"
                onClick={() => alert('Feature coming soon')}
              />
              <MenuItem
                label="Personal Data"
                description="Manage personal information"
                onClick={() => navigate('/player/profile/edit')}
              />
              <MenuItem
                label="Privacy Policy"
                description="Read our privacy policy"
                onClick={() => alert('Feature coming soon')}
              />
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-black/30 rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Help & Support</h3>
                  <p className="text-gray-400 text-xs">Get assistance</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              <MenuItem
                label="FAQ"
                description="Frequently asked questions"
                onClick={() => navigate('/player/profile/faq')}
              />
              <MenuItem
                label="Contact Us"
                description="Send message to support team"
                onClick={() => alert('Email: support@golfscore.id')}
              />
              <MenuItem
                label="About App"
                description="Version 1.0.0"
                onClick={() => alert('GolfScore ID v1.0.0\n© 2024 All rights reserved')}
              />
            </div>
          </div>

          {/* App Info */}
          <div className="text-center text-gray-600 text-xs py-4">
            <p>GolfScore ID</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Item Component
const ToggleItem: React.FC<{
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ id, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 gap-4">
    <div className="flex-1 min-w-0">
      <Label htmlFor={id} className="text-white font-semibold text-sm cursor-pointer">
        {label}
      </Label>
      <p className="text-gray-400 text-xs mt-0.5">{description}</p>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onChange}
      className="flex-shrink-0"
    />
  </div>
);

// Select Item Component
const SelectItem: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-black/30 transition-all"
  >
    <span className="text-white font-semibold text-sm">{label}</span>
    {selected && <Check className="w-5 h-5 text-red-500" />}
  </button>
);

// Menu Item Component
const MenuItem: React.FC<{
  label: string;
  description: string;
  onClick: () => void;
}> = ({ label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 hover:bg-black/30 transition-all"
  >
    <div className="flex-1 text-left">
      <div className="text-white font-semibold text-sm">{label}</div>
      <div className="text-gray-400 text-xs mt-0.5">{description}</div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-500" />
  </button>
);

export default SettingsPage;
