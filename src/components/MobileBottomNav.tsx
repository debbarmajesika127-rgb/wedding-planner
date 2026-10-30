import React from 'react';
import { ActiveTab } from './HeaderNav';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Utensils,
  Mail,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSetActiveTab,
  pendingCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-black/15 px-2 py-1.5 flex items-center justify-around sm:hidden shadow-md">
      <button
        type="button"
        onClick={() => onSetActiveTab('overview')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'overview' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <TrendingUp className={`w-5 h-5 mb-0.5 ${activeTab === 'overview' ? 'text-[#800000]' : 'text-black'}`} />
        Overview
      </button>

      <button
        type="button"
        onClick={() => onSetActiveTab('guests')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'guests' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'guests' ? 'text-[#800000]' : 'text-black'}`} />
        Guests
      </button>

      <button
        type="button"
        onClick={() => onSetActiveTab('whatsapp')}
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
        onClick={() => onSetActiveTab('catering')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'catering' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <Utensils className={`w-5 h-5 mb-0.5 ${activeTab === 'catering' ? 'text-[#800000]' : 'text-black'}`} />
        Catering
      </button>

      <button
        type="button"
        onClick={() => onSetActiveTab('invite')}
        className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] transition-colors ${
          activeTab === 'invite' ? 'text-[#800000] font-bold' : 'text-black'
        }`}
      >
        <Mail className={`w-5 h-5 mb-0.5 ${activeTab === 'invite' ? 'text-[#800000]' : 'text-black'}`} />
        RSVP Link
      </button>
    </nav>
  );
};
