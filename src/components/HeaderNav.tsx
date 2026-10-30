import React from 'react';
import { WeddingDetails, Guest } from '../types/wedding';
import {
  Heart,
  TrendingUp,
  Users,
  MessageSquare,
  Utensils,
  Plus,
  Share2,
  Mail,
  Check,
  Settings,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'guests' | 'whatsapp' | 'catering' | 'invite';

interface HeaderNavProps {
  wedding: WeddingDetails;
  activeTab: ActiveTab;
  onSetActiveTab: (tab: ActiveTab) => void;
  onAddGuestClick: () => void;
  onOpenSettings: () => void;
  pendingCount: number;
  allGuests: Guest[];
  onShareInviteClick: () => void;
  copiedInviteLink: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  wedding,
  activeTab,
  onSetActiveTab,
  onAddGuestClick,
  onOpenSettings,
  pendingCount,
  allGuests,
  onShareInviteClick,
  copiedInviteLink,
}) => {
  const hasNames = Boolean(wedding.brideName && wedding.groomName);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/10 shadow-2xs">
      {/* Top App Bar */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand / Title / Clickable for Settings */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-white text-[#800000] flex items-center justify-center border-2 border-[#800000] shadow-2xs hover:scale-105 transition-transform"
            title="Configure wedding details"
          >
            <Heart className="w-4 h-4 fill-[#800000]" />
          </button>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#800000]">Nuptia</span>
              <span className="text-black/30 text-xs">•</span>
              {hasNames ? (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="text-sm font-serif-wedding font-bold text-black leading-tight hover:text-[#800000] transition-colors flex items-center gap-1.5"
                  title="Click to edit bride & groom names"
                >
                  <span>{wedding.brideName} & {wedding.groomName}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="text-xs font-semibold text-[#800000] hover:underline flex items-center gap-1"
                >
                  <span>Set Bride & Groom Names</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-black/60 hidden sm:block">
              {wedding.date ? `${wedding.date}${wedding.venueName ? ` • ${wedding.venueName}` : ''}` : 'Wedding Guest & WhatsApp RSVP'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-1.5 bg-white border border-black/20 hover:border-black text-black text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            title="Wedding & Couple Settings"
          >
            <Settings className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            type="button"
            onClick={onShareInviteClick}
            className="px-3 py-1.5 bg-white border border-black/20 hover:border-black text-black text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            title="Copy or share wedding RSVP invitation link"
          >
            {copiedInviteLink ? <Check className="w-3.5 h-3.5 text-[#800000]" /> : <Share2 className="w-3.5 h-3.5 text-[#800000]" />}
            <span className="hidden sm:inline">{copiedInviteLink ? 'Link Copied!' : 'Share Invite'}</span>
          </button>

          <button
            type="button"
            onClick={onAddGuestClick}
            className="px-3.5 py-1.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Segmented Tab Bar */}
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1.5 border-t border-black/10 overflow-x-auto py-1 text-xs bg-white">
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
          Overview
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
          Guests ({allGuests.length})
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
          WhatsApp
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

        <button
          type="button"
          onClick={() => onSetActiveTab('invite')}
          className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
            activeTab === 'invite'
              ? 'text-white bg-[#800000]'
              : 'text-black hover:text-[#800000] hover:bg-black/5'
          }`}
        >
          <Mail className="w-4 h-4" />
          Invitation & RSVP
        </button>
      </div>
    </header>
  );
};
