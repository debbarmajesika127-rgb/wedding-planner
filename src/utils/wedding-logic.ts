import {
  Guest,
  RSVPStatus,
  ArrivalTimeSlot,
  CateringEstimate,
  AttendanceForecast,
  ArrivalDistribution,
  WeddingDetails,
} from '../types/wedding';

/**
 * Calculates vegetarian vs non-vegetarian meal counts and safety buffers for caterers.
 */
export function calculateCateringCounts(guests: Guest[]): CateringEstimate {
  let vegCount = 0;
  let nonVegCount = 0;
  let totalAttendingGuests = 0;
  const allergyNotes: { guestName: string; note: string }[] = [];

  for (const guest of guests) {
    if (guest.rsvpStatus === 'attending') {
      // If party members are detailed, count each
      if (guest.partyMembers && guest.partyMembers.length > 0) {
        for (const member of guest.partyMembers) {
          totalAttendingGuests += 1;
          if (member.dietary === 'veg') {
            vegCount += 1;
          } else {
            nonVegCount += 1;
          }
          if (member.notes && member.notes.trim()) {
            allergyNotes.push({
              guestName: `${guest.name} (${member.name})`,
              note: member.notes.trim(),
            });
          }
        }
      } else {
        // Fallback if party members array is empty
        const count = Math.max(1, guest.partySize || 1);
        totalAttendingGuests += count;
        // Default to non-veg if not specified
        nonVegCount += count;
      }

      if (guest.notes && guest.notes.trim()) {
        allergyNotes.push({
          guestName: guest.name,
          note: guest.notes.trim(),
        });
      }
    }
  }

  const totalKnown = vegCount + nonVegCount;
  const vegPercentage = totalKnown > 0 ? Math.round((vegCount / totalKnown) * 100) : 0;
  const nonVegPercentage = totalKnown > 0 ? Math.round((nonVegCount / totalKnown) * 100) : 0;

  // Professional wedding caterer standard: +10% buffer on veg (veg is popular as last-minute switch), +8% on non-veg
  const recommendedVegWithBuffer = Math.ceil(vegCount * 1.10);
  const recommendedNonVegWithBuffer = Math.ceil(nonVegCount * 1.08);

  return {
    totalAttendingGuests,
    vegCount,
    nonVegCount,
    vegPercentage,
    nonVegPercentage,
    recommendedVegWithBuffer,
    recommendedNonVegWithBuffer,
    totalMealsRecommended: recommendedVegWithBuffer + recommendedNonVegWithBuffer,
    allergyNotes,
  };
}

/**
 * Advanced attendance estimation algorithm.
 * Accounts for:
 * 1. Historical 8% last-minute drop-out rate among confirmed RSVPs (illness, emergencies, childcare)
 * 2. 35% turnout probability of unresponded/pending invites (they often show up or respond late)
 * 3. 50% turnout probability of "uncertain" guests
 * 4. 2% unexpected surprise turnout from declined guests
 */
export function calculateAttendanceEstimate(guests: Guest[]): AttendanceForecast {
  const totalInvited = guests.reduce((sum, g) => sum + Math.max(1, g.partySize || 1), 0);

  let confirmedAttending = 0;
  let confirmedPartyCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let pendingPartyCount = 0;
  let uncertainCount = 0;
  let uncertainPartyCount = 0;

  for (const guest of guests) {
    const size = Math.max(1, guest.partySize || 1);
    switch (guest.rsvpStatus) {
      case 'attending':
        confirmedAttending += 1;
        confirmedPartyCount += size;
        break;
      case 'declined':
        declinedCount += size;
        break;
      case 'pending':
        pendingCount += 1;
        pendingPartyCount += size;
        break;
      case 'uncertain':
        uncertainCount += 1;
        uncertainPartyCount += size;
        break;
    }
  }

  const totalAnswered = confirmedAttending + (guests.filter(g => g.rsvpStatus === 'declined').length);
  const responseRatePercentage = guests.length > 0 
    ? Math.round((totalAnswered / guests.length) * 100) 
    : 0;

  // Expected model:
  // - Confirmed attending: 92% turnout (8% dropoff factor)
  // - Pending: 35% probability of showing up
  // - Uncertain: 50% probability
  // - Declined: 1.5%
  const likelyFromConfirmed = confirmedPartyCount * 0.92;
  const likelyFromPending = pendingPartyCount * 0.35;
  const likelyFromUncertain = uncertainPartyCount * 0.50;
  const likelyFromDeclined = declinedCount * 0.015;

  const mostLikelyExpected = Math.round(likelyFromConfirmed + likelyFromPending + likelyFromUncertain + likelyFromDeclined);

  // Conservative (Min): assumes 15% drop-off on confirmed and only 10% from pending
  const minExpected = Math.round(confirmedPartyCount * 0.85 + pendingPartyCount * 0.10);

  // Upper ceiling (Max): assumes 98% turnout of confirmed + 70% from pending + 80% uncertain
  const maxExpected = Math.round(confirmedPartyCount * 0.98 + pendingPartyCount * 0.70 + uncertainPartyCount * 0.80);

  let attendanceConfidence: 'high' | 'medium' | 'low' = 'low';
  let summaryInsight = '';

  if (responseRatePercentage >= 85) {
    attendanceConfidence = 'high';
    summaryInsight = `Strong confidence! With ${responseRatePercentage}% response rate, plan catering for ${mostLikelyExpected} guests (buffer range ${minExpected} - ${maxExpected}).`;
  } else if (responseRatePercentage >= 50) {
    attendanceConfidence = 'medium';
    summaryInsight = `${pendingCount} invitations pending. While ${confirmedPartyCount} confirmed yes, our predictive model expects ~${mostLikelyExpected} actual attendees. Send absence reminders to tighten estimate.`;
  } else {
    attendanceConfidence = 'low';
    summaryInsight = `Low response rate (${responseRatePercentage}%). Many guests have not updated plans yet. High variance in expected guest count (${minExpected} to ${maxExpected}).`;
  }

  return {
    totalInvited,
    confirmedAttending,
    confirmedPartyCount,
    declinedCount,
    pendingCount,
    uncertainCount,
    mostLikelyExpected: Math.max(0, mostLikelyExpected),
    minExpected: Math.max(0, minExpected),
    maxExpected: Math.max(mostLikelyExpected, maxExpected),
    responseRatePercentage,
    attendanceConfidence,
    summaryInsight,
  };
}

/**
 * Calculates arrival time distribution so couples know how many guests will be present
 * for ceremony vs cocktail hour vs dinner.
 */
export function calculateArrivalDistribution(guests: Guest[]): ArrivalDistribution {
  const result: ArrivalDistribution = {
    ceremony: 0,
    cocktails: 0,
    dinner: 0,
    lateParty: 0,
    unspecified: 0,
  };

  for (const guest of guests) {
    if (guest.rsvpStatus === 'attending') {
      const party = Math.max(1, guest.partySize || 1);
      switch (guest.arrivalTime) {
        case 'ceremony':
          result.ceremony += party;
          break;
        case 'cocktails':
          result.cocktails += party;
          break;
        case 'dinner':
          result.dinner += party;
          break;
        case 'late-party':
          result.lateParty += party;
          break;
        default:
          result.unspecified += party;
          break;
      }
    }
  }

  return result;
}

export type WhatsAppMessageType = 
  | 'invitation' 
  | 'absence-reminder' 
  | 'update-plans' 
  | 'caterer-deadline' 
  | 'venue-details';

/**
 * Generates personalized WhatsApp message text and deep-link wa.me URL.
 */
export function generateWhatsAppMessage(
  type: WhatsAppMessageType,
  guest: Guest,
  wedding: WeddingDetails,
  appUrl: string = window.location.origin
): { text: string; url: string } {
  const rsvpLink = `${appUrl}?guest=${encodeURIComponent(guest.inviteToken || guest.id)}`;
  let message = '';

  const cleanPhone = (guest.phone || '').replace(/[^0-9]/g, '');

  switch (type) {
    case 'invitation':
      message = `✨ Warm Greetings ${guest.name}! ✨\n\n` +
        `We are delighted to invite you to celebrate our wedding!\n\n` +
        `💍 *${wedding.brideName} & ${wedding.groomName}*\n` +
        `📅 Date: ${wedding.date}\n` +
        `📍 Venue: ${wedding.venueName}\n\n` +
        `To help us plan catering (Vegetarian/Non-Veg) and arrival seating, please confirm your attendance or decline here:\n` +
        `👉 ${rsvpLink}\n\n` +
        `Kindly respond by ${wedding.rsvpDeadline}. We can't wait to celebrate together! 🥂`;
      break;

    case 'absence-reminder':
      message = `Dear ${guest.name} 💌,\n\n` +
        `We hope you are having a wonderful week! We are finalizing wedding details for *${wedding.brideName} & ${wedding.groomName}* on ${wedding.date}.\n\n` +
        `We noticed we haven't received your RSVP yet. Could you take 30 seconds to let us know if you'll be able to join us (Yes or No)?\n\n` +
        `👉 RSVP / Update Plans: ${rsvpLink}\n\n` +
        `Even if you can't make it, letting us know helps us give our caterers an exact headcount. Thank you so much! ❤️`;
      break;

    case 'caterer-deadline':
      message = `⏰ Final Headcount Reminder for ${guest.name}!\n\n` +
        `Our wedding caterer requires the final guest list and meal preferences (Vegetarian vs Non-Veg) this week.\n\n` +
        `Please confirm or update your plans today so we have your table ready:\n` +
        `👉 ${rsvpLink}\n\n` +
        `With love, ${wedding.brideName} & ${wedding.groomName} 💐`;
      break;

    case 'update-plans':
      message = `Hi ${guest.name}! 🌟\n\n` +
        `Just a reminder that you can easily update your wedding plans, arrival time, or dietary needs (Vegetarian/Non-Veg) anytime up to 24 hours before our celebration:\n\n` +
        `👉 Update your plans here: ${rsvpLink}\n\n` +
        `Can't wait to see you on ${wedding.date}!\n` +
        `${wedding.brideName} & ${wedding.groomName}`;
      break;

    case 'venue-details':
      message = `🎉 Wedding Day Details for ${guest.name}!\n\n` +
        `💍 *${wedding.brideName} & ${wedding.groomName}*\n` +
        `📅 ${wedding.date} at ${wedding.time}\n` +
        `📍 ${wedding.venueName}\n` +
        `🗺️ Address: ${wedding.venueAddress}\n\n` +
        `View event schedule, arrival directions & your invitation details:\n` +
        `👉 ${rsvpLink}\n\n` +
        `See you soon! 🥂`;
      break;
  }

  const encodedText = encodeURIComponent(message);
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}` 
    : `https://wa.me/?text=${encodedText}`;

  return { text: message, url };
}

export function formatArrivalTimeSlot(slot: ArrivalTimeSlot): string {
  switch (slot) {
    case 'ceremony':
      return 'Ceremony & Full Day (3:00 PM)';
    case 'cocktails':
      return 'Cocktail Hour & Reception (4:30 PM)';
    case 'dinner':
      return 'Dinner & Toasts (6:00 PM)';
    case 'late-party':
      return 'Late Night Dancing (8:00 PM+)';
    case 'not-attending':
      return 'Unable to Attend';
    case 'unknown':
    default:
      return 'Time Unspecified';
  }
}

export function getStatusBadgeInfo(status: RSVPStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'attending':
      return { label: 'Attending', bg: 'bg-[#800000]', text: 'text-white', border: 'border-[#800000]' };
    case 'declined':
      return { label: 'Declined', bg: 'bg-white', text: 'text-black', border: 'border-black/30' };
    case 'uncertain':
      return { label: 'Uncertain', bg: 'bg-white', text: 'text-[#800000]', border: 'border-[#800000] border-dashed' };
    case 'pending':
    default:
      return { label: 'Pending RSVP', bg: 'bg-white', text: 'text-[#800000]', border: 'border-[#800000]' };
  }
}
