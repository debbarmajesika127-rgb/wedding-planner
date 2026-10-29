import React from 'react';
import { ActiveTab, AppMode } from './HeaderNav';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Utensils,
  Eye,
  LayoutDashboard,
} from 'lucide-react';

interface MobileBottomNavProps {
  appMode: AppMode;
  onSetAppMode: (mode: AppMode) => void;
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  appMode,
  onSetAppMode,
  activeTab,
  onSetActiveTab,
  pendingCount,
}) => {
  if (appMode === 'guest') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/15 px-4 py-2.5 flex items-center justify-between sm:hidden shadow-md">
        <button
          type="button"
          onClick={() => onSetAppMode('organizer')}
          className="w-full py-2 bg-[#800000] hover:bg-[#660000] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" /> Return to Couple Dashboard
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/15 px-2 py-1.5 flex items-center justify-around sm:hidden shadow-md">
      <button
        type="button"
        onClick={() => {
          onSetAppMode('organizer');
          onSetActiveTab('overview');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'overview' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <TrendingUp className={`w-5 h-5 mb-0.5 ${activeTab === 'overview' ? 'text-[#800000]' : 'text-black'}`} />
        Estimates
      </button>

      <button
        type="button"
        onClick={() => {
          onSetAppMode('organizer');
          onSetActiveTab('guests');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'guests' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'guests' ? 'text-[#800000]' : 'text-black'}`} />
        Guests
      </button>

      <button
        type="button"
        onClick={() => {
          onSetAppMode('organizer');
          onSetActiveTab('whatsapp');
        }}
        className={`relative flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'whatsapp' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <MessageSquare className={`w-5 h-5 mb-0.5 ${activeTab === 'whatsapp' ? 'text-[#800000]' : 'text-black'}`} />
        WhatsApp
        {pendingCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 bg-[#800000] rounded-full" />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          onSetAppMode('organizer');
          onSetActiveTab('catering');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'catering' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <Utensils className={`w-5 h-5 mb-0.5 ${activeTab === 'catering' ? 'text-[#800000]' : 'text-black'}`} />
        Catering
      </button>

      <button
        type="button"
        onClick={() => onSetAppMode('guest')}
        className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold text-[#800000]"
      >
        <Eye className="w-5 h-5 mb-0.5 text-[#800000]" />
        RSVP View
      </button>
    </nav>
  );
};
