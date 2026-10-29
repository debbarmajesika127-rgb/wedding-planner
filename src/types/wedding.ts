export type RSVPStatus = 'attending' | 'declined' | 'pending' | 'uncertain';

export type DietaryChoice = 'veg' | 'non-veg';

export type ArrivalTimeSlot = 
  | 'ceremony'    // 3:00 PM - 3:30 PM (Full Day)
  | 'cocktails'   // 4:30 PM - 5:00 PM (Cocktail & Dinner)
  | 'dinner'      // 6:00 PM - 6:30 PM (Dinner & Reception)
  | 'late-party'  // 8:00 PM+ (Dancing & Late Night)
  | 'not-attending'
  | 'unknown';

export type GuestSide = 'bride' | 'groom' | 'mutual' | 'family' | 'vip';

export interface GuestPartyMember {
  name: string;
  dietary: DietaryChoice;
  isChild?: boolean;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  side: GuestSide;
  table?: string;
  rsvpStatus: RSVPStatus;
  partySize: number;
  partyMembers: GuestPartyMember[];
  arrivalTime: ArrivalTimeSlot;
  estimatedArrivalHour?: string;
  lastUpdated: string;
  absenceReason?: string;
  blessingMessage?: string;
  remindersSent: number;
  lastReminderDate?: string;
  inviteToken: string;
  relation: string;
  notes?: string;
}

export interface WeddingDetails {
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  rsvpDeadline: string;
  coupleContactPhone: string;
  storySnippet: string;
}

export interface CateringEstimate {
  totalAttendingGuests: number;
  vegCount: number;
  nonVegCount: number;
  vegPercentage: number;
  nonVegPercentage: number;
  recommendedVegWithBuffer: number;
  recommendedNonVegWithBuffer: number;
  totalMealsRecommended: number;
  allergyNotes: { guestName: string; note: string }[];
}

export interface AttendanceForecast {
  totalInvited: number;
  confirmedAttending: number;
  confirmedPartyCount: number;
  declinedCount: number;
  pendingCount: number;
  uncertainCount: number;
  mostLikelyExpected: number;
  minExpected: number;
  maxExpected: number;
  responseRatePercentage: number;
  attendanceConfidence: 'high' | 'medium' | 'low';
  summaryInsight: string;
}

export interface ArrivalDistribution {
  ceremony: number;
  cocktails: number;
  dinner: number;
  lateParty: number;
  unspecified: number;
}
