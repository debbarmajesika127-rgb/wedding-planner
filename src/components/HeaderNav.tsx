import React from 'react';
import { WeddingDetails, Guest } from '../types/wedding';
import {
  Heart,
  TrendingUp,
  Users,
  MessageSquare,
  Utensils,
  ExternalLink,
  RotateCcw,
  Plus,
  Share2,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'guests' | 'whatsapp' | 'catering';
export type AppMode = 'organizer' | 'guest';

interface HeaderNavProps {
  wedding: WeddingDetails;
  appMode: AppMode;
  onSetAppMode: (mode: AppMode) => void;
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  onAddGuestClick: () => void;
  onResetData: () => void;
  pendingCount: number;
  allGuests: Guest[];
  selectedGuestForPortal: Guest;
  onSelectGuestForPortal: (guest: Guest) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  wedding,
  appMode,
  onSetAppMode,
  activeTab,
  onSetActiveTab,
  onAddGuestClick,
  onResetData,
  pendingCount,
  allGuests,
  selectedGuestForPortal,
  onSelectGuestForPortal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/10 shadow-2xs">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Couple Monogram */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white text-[#800000] flex items-center justify-center border-2 border-[#800000] shadow-2xs">
            <Heart className="w-5 h-5 fill-[#800000]" />
          </div>
          <div>
            <h1 className="text-base font-serif-wedding font-bold text-black leading-tight">
              {wedding.brideName} & {wedding.groomName}
            </h1>
            <p className="text-[11px] text-black/60 hidden sm:block">
              {wedding.venueName} • {wedding.date}
            </p>
          </div>
        </div>

        {/* View Switcher: Organizer vs Guest RSVP Experience */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-black/20 text-xs">
          <button
            type="button"
            onClick={() => onSetAppMode('organizer')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              appMode === 'organizer'
                ? 'bg-[#800000] text-white shadow-2xs'
                : 'text-black hover:text-[#800000]'
            }`}
          >
            Couple Dashboard
          </button>
          <button
            type="button"
            onClick={() => onSetAppMode('guest')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              appMode === 'guest'
                ? 'bg-[#800000] text-white shadow-2xs'
                : 'text-black hover:text-[#800000]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Guest RSVP View
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={onResetData}
            title="Reset to sample guests"
            className="p-2 text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Reset Sample</span>
          </button>

          <button
            type="button"
            onClick={onAddGuestClick}
            className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Guest
          </button>
        </div>
      </div>

      {/* Sub-bar: If in Guest Mode, show preview guest selector */}
      {appMode === 'guest' ? (
        <div className="bg-white border-t border-b border-[#800000]/30 px-4 py-2">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#800000] font-semibold">
              💡 Simulating how this specific wedding guest views their invitation:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-black text-[11px] font-medium">Switch Guest:</label>
              <select
                value={selectedGuestForPortal?.id || ''}
                onChange={(e) => {
                  const found = allGuests.find((g) => g.id === e.target.value);
                  if (found) onSelectGuestForPortal(found);
                }}
                className="px-2.5 py-1 text-xs bg-white border border-[#800000] rounded-lg text-black font-medium focus:outline-none focus:ring-1 focus:ring-[#800000]"
              >
                {allGuests.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.rsvpStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Organizer Desktop & Tablet Tabs */
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 border-t border-black/10 overflow-x-auto py-1 text-xs bg-white">
          <button
            type="button"
            onClick={() => onSetActiveTab('overview')}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'text-white bg-[#800000]'
                : 'text-black hover:text-[#800000] hover:bg-black/5'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Accurate Estimates
          </button>

          <button
            type="button"
            onClick={() => onSetActiveTab('guests')}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'guests'
                ? 'text-white bg-[#800000]'
                : 'text-black hover:text-[#800000] hover:bg-black/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Guest List ({allGuests.length})
          </button>

          <button
            type="button"
            onClick={() => onSetActiveTab('whatsapp')}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'whatsapp'
                ? 'text-white bg-[#800000]'
                : 'text-black hover:text-[#800000] hover:bg-black/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp & Absence Reminders
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                activeTab === 'whatsapp' ? 'bg-white text-[#800000]' : 'bg-[#800000] text-white'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSetActiveTab('catering')}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'catering'
                ? 'text-white bg-[#800000]'
                : 'text-black hover:text-[#800000] hover:bg-black/5'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Catering & Schedule
          </button>
        </div>
      )}
    </header>
  );
};
