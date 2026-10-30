import React, { useState } from 'react';
import {
  Guest,
  WeddingDetails,
  RSVPStatus,
  ArrivalTimeSlot,
  DietaryChoice,
  DEFAULT_ARRIVAL_SCHEDULE,
} from '../types/wedding';
import { formatArrivalTimeSlot } from '../utils/wedding-logic';
import {
  Heart,
  CheckCircle2,
  XCircle,
  Utensils,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  Share2,
  Music,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface GuestRSVPPortalProps {
  guest?: Guest | null;
  wedding: WeddingDetails;
  onSaveGuestRSVP: (updatedGuest: Guest) => void;
  onBackToOrganizer?: () => void;
  onOpenSettings?: () => void;
}

export const GuestRSVPPortal: React.FC<GuestRSVPPortalProps> = ({
  guest,
  wedding,
  onSaveGuestRSVP,
  onBackToOrganizer,
  onOpenSettings,
}) => {
  const schedule = wedding.arrivalSchedule && wedding.arrivalSchedule.length > 0
    ? wedding.arrivalSchedule
    : DEFAULT_ARRIVAL_SCHEDULE;

  const [guestName, setGuestName] = useState(guest?.name || '');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(
    guest?.rsvpStatus === 'pending' || guest?.rsvpStatus === 'uncertain' || !guest?.rsvpStatus
      ? 'attending'
      : guest.rsvpStatus
  );
  const [partySize, setPartySize] = useState<number>(guest?.partySize || 1);
  const [arrivalTime, setArrivalTime] = useState<ArrivalTimeSlot>(
    guest?.arrivalTime && guest.arrivalTime !== 'not-attending' && guest.arrivalTime !== 'unknown'
      ? guest.arrivalTime
      : schedule[0]?.id || 'ceremony'
  );
  const [partyMembers, setPartyMembers] = useState(
    guest?.partyMembers?.length
      ? guest.partyMembers
      : [
          {
            name: guest?.name?.split('&')[0]?.trim() || '',
            dietary: 'non-veg' as DietaryChoice,
            notes: '',
          },
        ]
  );
  const [absenceReason, setAbsenceReason] = useState(guest?.absenceReason || '');
  const [blessingMessage, setBlessingMessage] = useState(guest?.blessingMessage || '');
  const [songRequest, setSongRequest] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  const handlePartySizeChange = (newSize: number) => {
    const size = Math.max(1, Math.min(8, newSize));
    setPartySize(size);

    const updated = [...partyMembers];
    while (updated.length < size) {
      updated.push({
        name: `Guest ${updated.length + 1}`,
        dietary: 'non-veg',
        notes: '',
      });
    }
    setPartyMembers(updated.slice(0, size));
  };

  const updateMemberDietary = (index: number, dietary: DietaryChoice) => {
    const updated = [...partyMembers];
    updated[index].dietary = dietary;
    setPartyMembers(updated);
  };

  const updateMemberName = (index: number, name: string) => {
    const updated = [...partyMembers];
    updated[index].name = name;
    setPartyMembers(updated);
  };

  const updateMemberNotes = (index: number, notes: string) => {
    const updated = [...partyMembers];
    updated[index].notes = notes;
    setPartyMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedSlot = schedule.find((s) => s.id === arrivalTime);
    const arrivalLabel = selectedSlot
      ? `${selectedSlot.title} (${selectedSlot.time})`
      : formatArrivalTimeSlot(arrivalTime, schedule);

    const finalName = (guestName.trim() || guest?.name || 'Wedding Guest').trim();
    const finalId = guest?.id || `g-${Date.now()}`;
    const finalToken = guest?.inviteToken || finalName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    // Ensure member 0 has name
    const finalMembers = partyMembers.map((m, idx) => {
      if (idx === 0 && !m.name) {
        return { ...m, name: finalName };
      }
      return m;
    });

    const updated: Guest = {
      id: finalId,
      name: finalName,
      phone: guest?.phone || '',
      relation: guest?.relation || 'Guest',
      side: guest?.side || 'mutual',
      table: guest?.table,
      inviteToken: finalToken,
      remindersSent: guest?.remindersSent || 0,
      lastReminderDate: guest?.lastReminderDate,
      rsvpStatus,
      partySize: rsvpStatus === 'attending' ? partySize : 1,
      partyMembers: rsvpStatus === 'attending' ? finalMembers : [],
      arrivalTime: rsvpStatus === 'attending' ? arrivalTime : 'not-attending',
      estimatedArrivalHour: arrivalLabel,
      absenceReason: rsvpStatus === 'declined' ? absenceReason : undefined,
      blessingMessage: blessingMessage.trim() || undefined,
      lastUpdated: new Date().toISOString(),
      notes: songRequest.trim() ? `Song request: ${songRequest}` : (guest?.notes || ''),
    };

    onSaveGuestRSVP(updated);
    setIsSubmitted(true);
  };

  // Google Calendar link
  const createGoogleCalendarLink = () => {
    const title = encodeURIComponent(`${wedding.brideName} & ${wedding.groomName}'s Wedding`);
    const details = encodeURIComponent(
      `Celebrating the wedding of ${wedding.brideName} & ${wedding.groomName} at ${wedding.venueName}.\n${wedding.venueAddress}`
    );
    const location = encodeURIComponent(`${wedding.venueName}, ${wedding.venueAddress}`);
    const dates = '20261114T233000Z/20261115T073000Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
  };

  // Send WhatsApp confirmation back to couple
  const sendWhatsAppBackToCouple = () => {
    const phone = wedding.coupleContactPhone.replace(/[^0-9]/g, '');
    const currentName = guestName.trim() || guest?.name || 'Wedding Guest';
    let text = '';
    if (rsvpStatus === 'attending') {
      const vegCount = partyMembers.filter((m) => m.dietary === 'veg').length;
      const nonVegCount = partyMembers.filter((m) => m.dietary === 'non-veg').length;
      text = `Hi ${wedding.brideName} & ${wedding.groomName}! 🥂\n\n` +
        `This is ${currentName}. I've confirmed our wedding RSVP!\n` +
        `• Party size: ${partySize} attending\n` +
        `• Meals: ${vegCount} Veg, ${nonVegCount} Non-Veg\n` +
        `• Arrival: ${formatArrivalTimeSlot(arrivalTime, schedule)}\n\n` +
        (blessingMessage ? `Message: "${blessingMessage}"\n\n` : '') +
        `Can't wait to celebrate with you! ❤️`;
    } else {
      text = `Hi ${wedding.brideName} & ${wedding.groomName} ❤️,\n\n` +
        `This is ${currentName}. Sadly we won't be able to make it to the wedding.\n` +
        (absenceReason ? `Reason: ${absenceReason}\n` : '') +
        (blessingMessage ? `Note: "${blessingMessage}"\n\n` : '') +
        `Wishing you both the most wonderful celebration and a lifetime of joy! ✨`;
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12 bg-white text-black">
      {/* Optional top quick action bar for sharing */}
      {onBackToOrganizer && (
        <div className="flex items-center justify-between p-3.5 bg-white border border-black/15 rounded-2xl shadow-xs text-xs">
          <div>
            <span className="font-bold text-black">Guest RSVP Portal</span>
            <p className="text-[11px] text-black/60">Guests use this link to confirm or update their plans</p>
          </div>
          <button
            type="button"
            onClick={onBackToOrganizer}
            className="px-3 py-1.5 bg-[#800000] text-white hover:bg-[#660000] font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </button>
        </div>
      )}

      {/* Main Wedding Invitation Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black/15 shadow-sm relative overflow-hidden text-center">
        {/* Subtle corner accents in maroon */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#800000] rounded-tl-3xl m-2 pointer-events-none" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#800000] rounded-tr-3xl m-2 pointer-events-none" />

        {/* Monogram / Heart */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#800000] mb-3 border-2 border-[#800000] shadow-2xs">
          <Heart className="w-6 h-6 fill-[#800000]" />
        </div>

        <p className="text-xs tracking-widest uppercase text-black font-semibold mb-1">
          Together with their families
        </p>

        {wedding.brideName && wedding.groomName ? (
          <h1 className="text-3xl sm:text-4xl font-serif-wedding font-bold text-black tracking-tight">
            {wedding.brideName} & {wedding.groomName}
          </h1>
        ) : (
          <div className="space-y-1 mb-2">
            <h1 className="text-2xl sm:text-3xl font-serif-wedding font-bold text-black tracking-tight">
              Our Wedding Celebration
            </h1>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-xs font-semibold text-[#800000] hover:underline inline-flex items-center gap-1"
              >
                <span>Set Bride & Groom Names</span>
              </button>
            )}
          </div>
        )}

        {wedding.storySnippet && (
          <p className="text-sm text-black/80 mt-2 max-w-sm mx-auto font-serif-wedding italic">
            "{wedding.storySnippet}"
          </p>
        )}

        {/* Date & Location Pills */}
        {(wedding.date || wedding.venueName) && (
          <div className="my-6 p-4 bg-white rounded-2xl border border-black/15 space-y-2 text-xs">
            {wedding.date && (
              <div className="flex items-center justify-center gap-2 text-black font-semibold">
                <Calendar className="w-4 h-4 text-[#800000]" />
                <span>{wedding.date}{wedding.time ? ` at ${wedding.time}` : ''}</span>
              </div>
            )}
            {(wedding.venueName || wedding.venueAddress) && (
              <div className="flex items-center justify-center gap-2 text-black/70">
                <MapPin className="w-4 h-4 text-[#800000] shrink-0" />
                <span>{wedding.venueName}{wedding.venueAddress ? ` • ${wedding.venueAddress}` : ''}</span>
              </div>
            )}
          </div>
        )}

        {/* Guest Personalized Greeting or Name Input */}
        {guest ? (
          <div className="py-2 px-4 bg-white rounded-xl border border-[#800000] inline-block mb-6">
            <p className="text-xs text-black font-medium">
              Invitation prepared for: <strong className="font-bold text-[#800000]">{guest.name}</strong>
            </p>
          </div>
        ) : (
          <div className="py-3 px-4 bg-white rounded-xl border border-[#800000] mb-6 text-left max-w-sm mx-auto">
            <label className="block text-[11px] font-semibold text-black mb-1">
              Your Name / Family Name *
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (partyMembers.length > 0) {
                  updateMemberName(0, e.target.value);
                }
              }}
              placeholder="Enter guest or family name"
              className="w-full px-3 py-1.5 text-xs text-black border border-black/20 rounded-lg focus:outline-none focus:border-[#800000] bg-white font-medium"
            />
          </div>
        )}

        {/* Already responded notice if not submitted in this view */}
        {guest && guest.rsvpStatus !== 'pending' && !isSubmitted && (
          <div className="mb-6 p-3 bg-white rounded-xl text-xs text-black border border-black/20 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#800000]" />
              Current status: <strong className="capitalize text-[#800000]">{guest.rsvpStatus}</strong> ({guest.partySize} guest{guest.partySize > 1 ? 's' : ''})
            </span>
            <span className="text-[11px] text-black/60">Update plans anytime</span>
          </div>
        )}

        {/* Interactive RSVP Form or Success View */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="text-left space-y-5">
            {/* Step 1: Coming or Not */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 text-center">
                Will you be joining our celebration? *
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRsvpStatus('attending')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    rsvpStatus === 'attending'
                      ? 'border-[#800000] bg-white text-black shadow-xs ring-2 ring-[#800000]/20'
                      : 'border-black/20 bg-white text-black hover:border-black'
                  }`}
                >
                  <CheckCircle2
                    className={`w-6 h-6 mx-auto mb-1 ${
                      rsvpStatus === 'attending' ? 'text-[#800000]' : 'text-black/40'
                    }`}
                  />
                  <div className={`font-bold text-sm ${rsvpStatus === 'attending' ? 'text-[#800000]' : 'text-black'}`}>
                    Joyfully Accept
                  </div>
                  <div className="text-[11px] text-black/60 mt-0.5">I will be there!</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRsvpStatus('declined')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    rsvpStatus === 'declined'
                      ? 'border-black bg-white text-black shadow-xs ring-2 ring-black/10'
                      : 'border-black/20 bg-white text-black hover:border-black'
                  }`}
                >
                  <XCircle
                    className={`w-6 h-6 mx-auto mb-1 ${
                      rsvpStatus === 'declined' ? 'text-black' : 'text-black/40'
                    }`}
                  />
                  <div className="font-bold text-sm text-black">Regretfully Decline</div>
                  <div className="text-[11px] text-black/60 mt-0.5">Celebrating from afar</div>
                </button>
              </div>
            </div>

            {/* If Attending: Details */}
            {rsvpStatus === 'attending' && (
              <div className="space-y-4 p-4 sm:p-5 bg-white rounded-2xl border-2 border-black/15">
                {/* Party Size */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-black">
                      Total Number in Your Party
                    </label>
                    <span className="text-xs text-black/60">
                      Including yourself & plus ones
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handlePartySizeChange(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          partySize === num
                            ? 'bg-[#800000] text-white border-[#800000] shadow-xs'
                            : 'bg-white border-black/20 text-black hover:border-black'
                        }`}
                      >
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meals per party member: Veg vs Non-Veg */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-black flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#800000]" />
                      Meal Selection per Guest
                    </label>
                    <span className="text-[11px] text-black/60">
                      Helps our caterer prepare fresh plates
                    </span>
                  </div>

                  {partyMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-black/15 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateMemberName(idx, e.target.value)}
                          placeholder={`Guest ${idx + 1} Name`}
                          className="flex-1 px-3 py-1.5 text-xs border border-black/20 rounded-lg text-black bg-white focus:outline-none focus:border-[#800000]"
                        />

                        {/* Veg / Non-Veg toggle */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateMemberDietary(idx, 'veg')}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                              member.dietary === 'veg'
                                ? 'bg-[#800000] text-white border border-[#800000]'
                                : 'bg-white text-black border border-black/20 hover:border-black'
                            }`}
                          >
                            🌱 Veg
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMemberDietary(idx, 'non-veg')}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors ${
                              member.dietary === 'non-veg'
                                ? 'bg-black text-white border border-black'
                                : 'bg-white text-black border border-black/20 hover:border-black'
                            }`}
                          >
                            🥩 Non-Veg
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={member.notes || ''}
                        onChange={(e) => updateMemberNotes(idx, e.target.value)}
                        placeholder="Dietary notes or allergies"
                        className="w-full px-2.5 py-1 text-[11px] text-black bg-white border border-black/20 rounded-md focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  ))}
                </div>

                {/* Estimated Arrival Time Slot */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#800000]" />
                    When do you plan on arriving?
                  </label>
                  <p className="text-[11px] text-black/60 mb-2">
                    Letting us know your arrival window helps ensure seamless parking, drinks & seating.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {schedule.map((slot) => {
                      const isSelected = arrivalTime === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setArrivalTime(slot.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                            isSelected
                              ? 'border-2 border-[#800000] bg-white font-bold text-black shadow-2xs'
                              : 'border border-black/20 bg-white text-black hover:border-black'
                          }`}
                        >
                          <div className="font-bold text-black">{slot.title}</div>
                          <div className="text-[10px] text-black/60 mt-0.5">
                            {slot.time}
                            {slot.description ? ` • ${slot.description}` : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Song Request (Delight feature) */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#800000]" />
                    Song Request for the Dance Floor (Optional)
                  </label>
                  <input
                    type="text"
                    value={songRequest}
                    onChange={(e) => setSongRequest(e.target.value)}
                    placeholder="Song request or artist"
                    className="w-full px-3 py-2 text-xs border border-black/20 rounded-xl bg-white text-black focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>
            )}

            {/* If Declined: Reason & Warm Wishes */}
            {rsvpStatus === 'declined' && (
              <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-black/15">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Absence Reason (Optional)
                  </label>
                  <select
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-black/20 rounded-xl bg-white text-black focus:border-[#800000]"
                  >
                    <option value="">Select a reason or write below...</option>
                    <option value="Prior travel or out of town">Prior travel or out of town</option>
                    <option value="Work commitment or scheduling conflict">Work commitment</option>
                    <option value="Family obligation or newborn baby">Family obligation</option>
                    <option value="Unable to make travel arrangements">Travel arrangements</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-[#800000]" />
                    Warm Wishes & Blessings for the Couple
                  </label>
                  <textarea
                    rows={3}
                    value={blessingMessage}
                    onChange={(e) => setBlessingMessage(e.target.value)}
                    placeholder={`Leave a sweet note for ${wedding.brideName} & ${wedding.groomName}...`}
                    className="w-full px-3 py-2 text-xs border border-black/20 rounded-xl bg-white text-black focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>
            )}

            {/* Reassurance banner: Guests can update their plans anytime! */}
            <div className="p-3 bg-white border border-[#800000] rounded-xl flex items-center gap-2.5 text-xs text-black">
              <Sparkles className="w-4 h-4 text-[#800000] shrink-0" />
              <span>
                <strong>Plans change?</strong> You can come back to this link anytime up to 24 hours before the wedding to update your response, meals, or arrival time.
              </span>
            </div>

            {/* Submit Button - Maroon Highlight */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#800000] hover:bg-[#660000] text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              Confirm & Save Wedding RSVP
            </button>
          </form>
        ) : (
          /* Confirmation Success View */
          <div className="py-6 space-y-5 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-[#800000] text-[#800000] flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-serif-wedding font-bold text-black">
                {rsvpStatus === 'attending' ? 'See You at the Wedding!' : 'Thank You for Letting Us Know'}
              </h2>
              <p className="text-xs text-black/70 max-w-sm mx-auto">
                {rsvpStatus === 'attending'
                  ? `Your attendance is confirmed for ${partySize} guest${partySize > 1 ? 's' : ''}. We can't wait to celebrate with you!`
                  : 'We will truly miss having you there with us, but thank you warmly for letting us know so we could finalize our numbers.'}
              </p>
            </div>

            {/* Summary card */}
            <div className="p-4 bg-white rounded-2xl border-2 border-black/15 text-left text-xs space-y-2">
              <div className="flex justify-between pb-1.5 border-b border-black/10 font-semibold text-black">
                <span>Summary of Your RSVP:</span>
                <span className="capitalize text-[#800000] font-bold">{rsvpStatus}</span>
              </div>
              {rsvpStatus === 'attending' && (
                <>
                  <div className="flex justify-between text-black/70">
                    <span>Party:</span>
                    <span className="font-medium text-black">{partyMembers.map((m) => m.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-black/70">
                    <span>Meals:</span>
                    <span className="font-semibold text-black">
                      {partyMembers.map((m) => `${m.dietary === 'veg' ? '🌱 Veg' : '🥩 Non-Veg'}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-black/70">
                    <span>Arrival Window:</span>
                    <span className="font-medium text-black">
                      {formatArrivalTimeSlot(arrivalTime, schedule)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick action buttons for guest */}
            <div className="space-y-2 pt-2">
              {rsvpStatus === 'attending' && (
                <a
                  href={createGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-white border border-black hover:bg-black hover:text-white text-black text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#800000]" /> Add to Google Calendar
                </a>
              )}

              <button
                type="button"
                onClick={sendWhatsAppBackToCouple}
                className="w-full py-2.5 px-4 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" /> Send Note on WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full py-2 text-xs font-medium text-black/70 hover:text-[#800000] transition-colors"
              >
                ✏️ Need to edit or update your plans again?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
