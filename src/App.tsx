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

import { HeaderNav, ActiveTab, AppMode } from './components/HeaderNav';
import { AttendanceEstimatorCard } from './components/AttendanceEstimatorCard';
import { GuestListManager } from './components/GuestListManager';
import { WhatsAppHub } from './components/WhatsAppHub';
import { CateringScheduleSheet } from './components/CateringScheduleSheet';
import { GuestRSVPPortal } from './components/GuestRSVPPortal';
import { AddEditGuestModal } from './components/AddEditGuestModal';
import { MobileBottomNav } from './components/MobileBottomNav';

const STORAGE_KEY = 'nuptia_wedding_guests_v1';
const WEDDING_STORAGE_KEY = 'nuptia_wedding_details_v1';

export default function App() {
  const [wedding, setWedding] = useState<WeddingDetails>(() => {
    try {
      const stored = localStorage.getItem(WEDDING_STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_WEDDING;
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

  const [appMode, setAppMode] = useState<AppMode>('organizer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Currently selected guest for Guest RSVP Portal view
  const [selectedGuestForPortal, setSelectedGuestForPortal] = useState<Guest>(() => {
    return guests[0] || INITIAL_GUESTS[0];
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestToEdit, setGuestToEdit] = useState<Guest | null>(null);

  // Sync guests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    } catch {
      // localstorage errors ignored
    }
  }, [guests]);

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
        setAppMode('guest');
      }
    }
  }, []);

  // Compute metrics
  const forecast = useMemo(() => calculateAttendanceEstimate(guests), [guests]);
  const catering = useMemo(() => calculateCateringCounts(guests), [guests]);
  const arrivals = useMemo(() => calculateArrivalDistribution(guests), [guests]);

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
    }
  };

  const handleResetData = () => {
    if (confirm('Reset guest list and RSVPs to sample wedding data?')) {
      setGuests(INITIAL_GUESTS);
      setWedding(INITIAL_WEDDING);
      setSelectedGuestForPortal(INITIAL_GUESTS[0]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WEDDING_STORAGE_KEY);
    }
  };

  // Open guest in RSVP Portal mode
  const handleOpenGuestRSVP = (guest: Guest) => {
    setSelectedGuestForPortal(guest);
    setAppMode('guest');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open guest in WhatsApp tab
  const handleOpenWhatsAppForGuest = (guest: Guest) => {
    setActiveTab('whatsapp');
    setAppMode('organizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-black pb-20 sm:pb-12 antialiased selection:bg-[#800000] selection:text-white">
      {/* Top Header Navigation */}
      <HeaderNav
        wedding={wedding}
        appMode={appMode}
        onSetAppMode={setAppMode}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        onAddGuestClick={() => {
          setGuestToEdit(null);
          setIsModalOpen(true);
        }}
        onResetData={handleResetData}
        pendingCount={pendingCount}
        allGuests={guests}
        selectedGuestForPortal={selectedGuestForPortal}
        onSelectGuestForPortal={setSelectedGuestForPortal}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {appMode === 'guest' ? (
          /* Guest RSVP Portal View */
          <GuestRSVPPortal
            guest={selectedGuestForPortal}
            wedding={wedding}
            onSaveGuestRSVP={handleSaveGuest}
            onBackToOrganizer={() => setAppMode('organizer')}
          />
        ) : (
          /* Organizer Dashboard */
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <AttendanceEstimatorCard
                forecast={forecast}
                catering={catering}
                arrivals={arrivals}
                onNavigateToReminders={() => setActiveTab('whatsapp')}
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
              />
            )}
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
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        appMode={appMode}
        onSetAppMode={setAppMode}
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        pendingCount={pendingCount}
      />
    </div>
  );
}
