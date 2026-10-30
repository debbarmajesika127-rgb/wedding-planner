/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Guest, WeddingDetails } from './types/wedding';
import { INITIAL_GUESTS, INITIAL_WEDDING } from './data/mock-wedding';
import {
  calculateAttendanceEstimate,
  calculateCateringCounts,
  calculateArrivalDistribution,
} from './utils/wedding-logic';

import { HeaderNav, ActiveTab } from './components/HeaderNav';
import { AttendanceEstimatorCard } from './components/AttendanceEstimatorCard';
import { GuestListManager } from './components/GuestListManager';
import { WhatsAppHub } from './components/WhatsAppHub';
import { CateringScheduleSheet } from './components/CateringScheduleSheet';
import { GuestRSVPPortal } from './components/GuestRSVPPortal';
import { AddEditGuestModal } from './components/AddEditGuestModal';
import { WeddingSettingsModal } from './components/WeddingSettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Settings, Heart } from 'lucide-react';

const STORAGE_KEY = 'nuptia_wedding_guests_v4';
const WEDDING_STORAGE_KEY = 'nuptia_wedding_details_v5';

export default function App() {
  const [wedding, setWedding] = useState<WeddingDetails>(() => {
    try {
      const stored = localStorage.getItem(WEDDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.arrivalSchedule || parsed.arrivalSchedule.length === 0) {
          parsed.arrivalSchedule = INITIAL_WEDDING.arrivalSchedule;
        }
        return parsed;
      }
      return INITIAL_WEDDING;
    } catch {
      return INITIAL_WEDDING;
    }
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_GUESTS;
    } catch {
      return INITIAL_GUESTS;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  // Currently selected guest for Invitation & RSVP tab (null if list is empty)
  const [selectedGuestForPortal, setSelectedGuestForPortal] = useState<Guest | null>(() => {
    return guests.length > 0 ? guests[0] : null;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'details' | 'schedule' | 'catering'>('details');
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);

  // Keep selectedGuestForPortal in sync when guests change
  useEffect(() => {
    if (selectedGuestForPortal) {
      const found = guests.find((g) => g.id === selectedGuestForPortal.id);
      if (found) {
        setSelectedGuestForPortal(found);
      }
    } else if (guests.length > 0) {
      setSelectedGuestForPortal(guests[0]);
    }
  }, [guests]);

  // Sync guests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch {
      // localstorage errors ignored
    }
  }, [guests]);

  // Sync wedding details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WEDDING_STORAGE_KEY, JSON.stringify(wedding));
    } catch {
      // localstorage errors ignored
    }
  }, [wedding]);

  // Read URL query parameter "?guest=ID_OR_TOKEN" on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('guest');
    if (guestParam) {
      const found = guests.find(
        (g) => g.id === guestParam || g.inviteToken === guestParam
      );
      if (found) {
        setSelectedGuestForPortal(found);
        setActiveTab('invite');
      }
    }
  }, []);

  // Compute metrics
  const forecast = useMemo(() => calculateAttendanceEstimate(guests), [guests]);
  const catering = useMemo(
    () => calculateCateringCounts(guests, wedding.cateringDetails),
    [guests, wedding.cateringDetails]
  );
  const arrivals = useMemo(
    () => calculateArrivalDistribution(guests, wedding.arrivalSchedule),
    [guests, wedding.arrivalSchedule]
  );

  const pendingCount = useMemo(() => {
    return guests.filter((g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'uncertain').length;
  }, [guests]);

  // Guest CRUD handlers
  const handleSaveGuest = (savedGuest: Guest) => {
    setGuests((prev) => {
      const exists = prev.some((g) => g.id === savedGuest.id);
      if (exists) {
        return prev.map((g) => (g.id === savedGuest.id ? savedGuest : g));
      } else {
        return [savedGuest, ...prev];
      }
    });

    if (selectedGuestForPortal?.id === savedGuest.id) {
      setSelectedGuestForPortal(savedGuest);
    }
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    if (selectedGuestForPortal?.id === guestId) {
      const remaining = guests.filter((g) => g.id !== guestId);
      if (remaining.length > 0) setSelectedGuestForPortal(remaining[0]);
      else setSelectedGuestForPortal(null);
    }
  };

  const handleSaveWeddingDetails = (updated: WeddingDetails) => {
    setWedding(updated);
  };

  // Open guest in RSVP Portal mode
  const handleOpenGuestRSVP = (guest: Guest) => {
    setSelectedGuestForPortal(guest);
    setActiveTab('invite');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open guest in WhatsApp tab
  const handleOpenWhatsAppForGuest = (guest: Guest) => {
    setActiveTab('whatsapp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Share General Wedding RSVP link
  const handleShareInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(url);
    setCopiedInviteLink(true);
    setTimeout(() => setCopiedInviteLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black pb-20 sm:pb-12 antialiased selection:bg-[#800000] selection:text-white">
      {/* Top Header Navigation Bar */}
      <HeaderNav
        wedding={wedding}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onAddGuestClick={() => {
          setGuestToEdit(null);
          setIsModalOpen(true);
        }}
        onOpenSettings={() => {
          setSettingsInitialTab('details');
          setIsSettingsOpen(true);
        }}
        pendingCount={pendingCount}
        allGuests={guests}
        onShareInviteClick={handleShareInviteLink}
        copiedInviteLink={copiedInviteLink}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* Unobtrusive Setup Reminder when couple names are not yet entered */}
        {!wedding.brideName && !wedding.groomName && activeTab === 'overview' && (
          <div className="mb-4 p-4 bg-white rounded-2xl border-2 border-[#800000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white text-[#800000] border-2 border-[#800000] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-[#800000]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">Welcome to Nuptia!</h3>
                <p className="text-xs text-black/70">
                  Enter your bride & groom names, wedding date, and arrival schedule to personalize invitations and WhatsApp links.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsInitialTab('details');
                setIsSettingsOpen(true);
              }}
              className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> Set Bride & Groom Names
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <AttendanceEstimatorCard
            forecast={forecast}
            catering={catering}
            arrivals={arrivals}
            arrivalSchedule={wedding.arrivalSchedule}
            onNavigateToReminders={() => setActiveTab('whatsapp')}
            onOpenScheduleSettings={() => {
              setSettingsInitialTab('schedule');
              setIsSettingsOpen(true);
            }}
          />
        )}

        {activeTab === 'guests' && (
          <GuestListManager
            guests={guests}
            onAddGuestClick={() => {
              setGuestToEdit(null);
              setIsModalOpen(true);
            }}
            onEditGuest={(guest) => {
              setGuestToEdit(guest);
              setIsModalOpen(true);
            }}
            onDeleteGuest={handleDeleteGuest}
            onOpenGuestRSVP={handleOpenGuestRSVP}
            onOpenWhatsAppModal={handleOpenWhatsAppForGuest}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppHub
            guests={guests}
            wedding={wedding}
            onUpdateGuest={handleSaveGuest}
            onOpenGuestRSVP={handleOpenGuestRSVP}
          />
        )}

        {activeTab === 'catering' && (
          <CateringScheduleSheet
            guests={guests}
            catering={catering}
            arrivals={arrivals}
            wedding={wedding}
            onOpenSettings={(tab) => {
              setSettingsInitialTab(tab || 'catering');
              setIsSettingsOpen(true);
            }}
            onUpdateWeddingDetails={handleSaveWeddingDetails}
          />
        )}

        {activeTab === 'invite' && (
          <div className="space-y-4">
            <GuestRSVPPortal
              guest={selectedGuestForPortal}
              wedding={wedding}
              onSaveGuestRSVP={handleSaveGuest}
              onBackToOrganizer={() => setActiveTab('overview')}
              onOpenSettings={() => {
                setSettingsInitialTab('details');
                setIsSettingsOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Add / Edit Guest Modal */}
      <AddEditGuestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setGuestToEdit(null);
        }}
        onSave={handleSaveGuest}
        guestToEdit={guestToEdit}
        arrivalSchedule={wedding.arrivalSchedule}
      />

      {/* Bride & Groom Wedding Settings Modal */}
      <WeddingSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        wedding={wedding}
        onSave={handleSaveWeddingDetails}
        initialTab={settingsInitialTab}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        pendingCount={pendingCount}
      />
    </div>
  );
}
