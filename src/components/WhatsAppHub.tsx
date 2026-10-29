import React, { useState } from 'react';
import { Guest, WeddingDetails } from '../types/wedding';
import {
  generateWhatsAppMessage,
  WhatsAppMessageType,
  getStatusBadgeInfo,
} from '../utils/wedding-logic';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Bell,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

interface WhatsAppHubProps {
  guests: Guest[];
  wedding: WeddingDetails;
  onUpdateGuest: (guest: Guest) => void;
  onOpenGuestRSVP: (guest: Guest) => void;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  guests,
  wedding,
  onUpdateGuest,
  onOpenGuestRSVP,
}) => {
  // Filter for absence reminders queue vs all
  const [activeQueueTab, setActiveQueueTab] = useState<'absence-queue' | 'all'>('absence-queue');
  
  // Selected guest for message staging
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'uncertain');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(
    pendingGuests.length > 0 ? pendingGuests[0].id : guests[0]?.id || ''
  );

  const [messageType, setMessageType] = useState<WhatsAppMessageType>('absence-reminder');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const selectedGuest = guests.find((g) => g.id === selectedGuestId) || guests[0];

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wedding.nuptia.app';

  const waData = selectedGuest
    ? generateWhatsAppMessage(messageType, selectedGuest, wedding, currentAppUrl)
    : { text: '', url: '#' };

  const handleCopyText = () => {
    if (!waData.text) return;
    navigator.clipboard.writeText(waData.text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyRSVPLink = () => {
    if (!selectedGuest) return;
    const rsvpLink = `${currentAppUrl}?guest=${encodeURIComponent(selectedGuest.inviteToken || selectedGuest.id)}`;
    navigator.clipboard.writeText(rsvpLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMarkSent = () => {
    if (!selectedGuest) return;
    const updated: Guest = {
      ...selectedGuest,
      remindersSent: (selectedGuest.remindersSent || 0) + 1,
      lastReminderDate: new Date().toISOString(),
    };
    onUpdateGuest(updated);
  };

  const handleSendWhatsApp = () => {
    handleMarkSent();
    window.open(waData.url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Hub Header Banner */}
      <div className="bg-white rounded-2xl p-5 border-2 border-[#800000] shadow-xs text-black">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-[#800000] text-[#800000]">
              <MessageSquare className="w-3.5 h-3.5 text-[#800000]" /> WhatsApp RSVP Engine
            </span>
            <h2 className="text-xl font-serif-wedding font-bold text-black">
              Guest WhatsApp & Absence Reminders
            </h2>
            <p className="text-xs text-black/70 max-w-xl">
              Nudge unconfirmed guests, send catering deadlines, and let guests update plans with personalized WhatsApp links.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-extrabold text-[#800000]">{pendingGuests.length}</div>
            <div className="text-xs text-black font-medium">Unanswered Invites</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Guest Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-black/15 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/10">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveQueueTab('absence-queue')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeQueueTab === 'absence-queue'
                    ? 'bg-[#800000] text-white'
                    : 'bg-white border border-black/20 text-black hover:border-black'
                }`}
              >
                Absence Queue ({pendingGuests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveQueueTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeQueueTab === 'all'
                    ? 'bg-[#800000] text-white'
                    : 'bg-white border border-black/20 text-black hover:border-black'
                }`}
              >
                All Guests ({guests.length})
              </button>
            </div>
            <span className="text-[11px] text-black/60 font-medium">Pick recipient</span>
          </div>

          {/* List of Guests */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {(activeQueueTab === 'absence-queue' ? pendingGuests : guests).map((guest) => {
              const isSelected = guest.id === selectedGuestId;
              const badge = getStatusBadgeInfo(guest.rsvpStatus);

              return (
                <div
                  key={guest.id}
                  onClick={() => setSelectedGuestId(guest.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-2 border-[#800000] shadow-xs'
                      : 'bg-white border-black/15 hover:border-black'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-black truncate">
                      {guest.name}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-black/60">
                    <span>{guest.phone || 'No phone logged'}</span>
                    <span className="flex items-center gap-1 text-black font-medium">
                      <Bell className="w-3 h-3 text-[#800000]" />
                      {guest.remindersSent > 0 ? `${guest.remindersSent} sent` : '0 sent'}
                    </span>
                  </div>
                </div>
              );
            })}

            {activeQueueTab === 'absence-queue' && pendingGuests.length === 0 && (
              <div className="py-8 text-center text-xs text-black/60 space-y-1">
                <p className="font-semibold text-black">🎉 No absent or pending guests!</p>
                <p>All your wedding guests have responded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Template Picker & Message Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-black/15 shadow-xs p-4 sm:p-5 space-y-4">
          {selectedGuest ? (
            <>
              {/* Selected guest strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-black/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-black">
                      {selectedGuest.name}
                    </span>
                    <span className="text-xs text-black/60">
                      ({selectedGuest.partySize} {selectedGuest.partySize === 1 ? 'person' : 'people'})
                    </span>
                  </div>
                  <p className="text-xs text-black/60 flex items-center gap-1.5 mt-0.5">
                    <span>WhatsApp: {selectedGuest.phone || 'Enter phone number in edit'}</span>
                    <span>•</span>
                    <span>{selectedGuest.relation}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenGuestRSVP(selectedGuest)}
                  className="px-2.5 py-1 text-xs text-[#800000] hover:bg-[#800000] hover:text-white border border-[#800000] rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Preview RSVP View
                </button>
              </div>

              {/* Message Type Selector Buttons */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-black">
                  Select WhatsApp Message Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageType('absence-reminder')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      messageType === 'absence-reminder'
                        ? 'bg-white border-2 border-[#800000] text-black font-semibold'
                        : 'border-black/20 text-black hover:border-black bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-[#800000]">
                      <Bell className="w-3.5 h-3.5" /> Absence Nudge
                    </div>
                    <div className="text-[10px] text-black/60 mt-0.5">Polite RSVP reminder</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageType('caterer-deadline')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      messageType === 'caterer-deadline'
                        ? 'bg-white border-2 border-[#800000] text-black font-semibold'
                        : 'border-black/20 text-black hover:border-black bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-[#800000]">
                      <Clock className="w-3.5 h-3.5" /> Food Deadline
                    </div>
                    <div className="text-[10px] text-black/60 mt-0.5">Final meal lock-in</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageType('update-plans')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      messageType === 'update-plans'
                        ? 'bg-white border-2 border-[#800000] text-black font-semibold'
                        : 'border-black/20 text-black hover:border-black bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-[#800000]">
                      <Sparkles className="w-3.5 h-3.5" /> Plan Updates
                    </div>
                    <div className="text-[10px] text-black/60 mt-0.5">Let guests revise times</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMessageType('invitation')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      messageType === 'invitation'
                        ? 'bg-white border-2 border-[#800000] text-black font-semibold'
                        : 'border-black/20 text-black hover:border-black bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-[#800000]">
                      <FileText className="w-3.5 h-3.5" /> Full Invitation
                    </div>
                    <div className="text-[10px] text-black/60 mt-0.5">Initial invite link</div>
                  </button>
                </div>
              </div>

              {/* Realistic WhatsApp Chat Bubble Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-black flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#800000]" /> WhatsApp Bubble Preview
                  </label>
                  <span className="text-[11px] text-black/60">Includes direct personalized link</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border-2 border-black/15 relative shadow-inner">
                  {/* Speech bubble */}
                  <div className="bg-white text-black p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs leading-relaxed max-w-md ml-auto whitespace-pre-wrap font-sans border-2 border-[#800000]">
                    {waData.text}
                    <div className="text-[10px] text-black/60 text-right mt-2 flex items-center justify-end gap-1">
                      <span>Just now</span>
                      <span className="text-[#800000] font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRSVPLink}
                    className="px-3 py-2 text-xs font-medium text-black bg-white border border-black/20 hover:border-[#800000] rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#800000]" /> : <Copy className="w-3.5 h-3.5 text-[#800000]" />}
                    {copiedLink ? 'Link Copied!' : 'Copy RSVP Link'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="px-3 py-2 text-xs font-medium text-black bg-white border border-black/20 hover:border-[#800000] rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-[#800000]" /> : <FileText className="w-3.5 h-3.5 text-[#800000]" />}
                    {copiedText ? 'Text Copied!' : 'Copy Message Text'}
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleMarkSent}
                    className="px-3 py-2 text-xs font-medium text-black border border-black/20 hover:border-black rounded-xl transition-colors bg-white"
                  >
                    Mark Reminder Sent
                  </button>

                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 sm:flex-none px-5 py-2 text-xs font-semibold text-white bg-[#800000] hover:bg-[#660000] rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Open in WhatsApp
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-black/60 text-sm">
              Select a guest from the left to compose a WhatsApp invitation or absence reminder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
