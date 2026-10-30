export type RSVPStatus = 'attending' | 'declined' | 'pending' | 'uncertain';

export type DietaryChoice = 'veg' | 'non-veg';

export type StandardArrivalTimeSlot = 
  | 'ceremony'    // Full Day & Ceremony
  | 'cocktails'   // Cocktail Hour
  | 'dinner'      // Dinner & Reception
  | 'late-party'  // Dancing & Late Party
  | 'not-attending'
  | 'unknown';

export type ArrivalTimeSlot = StandardArrivalTimeSlot | string;

export interface ArrivalScheduleSlot {
  id: string;
  title: string;
  time: string;
  description?: string;
}

export const DEFAULT_ARRIVAL_SCHEDULE: ArrivalScheduleSlot[] = [
  { id: 'ceremony', title: 'Ceremony', time: '3:00 PM', description: 'Exchange of vows' },
  { id: 'cocktails', title: 'Cocktails & Reception', time: '4:30 PM', description: 'Drinks & appetizers' },
  { id: 'dinner', title: 'Dinner & Toasts', time: '6:00 PM', description: 'Seated meal & speeches' },
  { id: 'late-party', title: 'Dancing & Late Party', time: '8:00 PM', description: 'Music & evening celebration' },
];

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

export interface CateringDetails {
  catererName?: string;
  catererPhone?: string;
  vegBufferPercent?: number;
  nonVegBufferPercent?: number;
  menuHighlights?: string;
  kitchenNotes?: string;
  headcountDueDate?: string;
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
  arrivalSchedule?: ArrivalScheduleSlot[];
  cateringDetails?: CateringDetails;
}

export interface CateringEstimate {
  totalAttendingGuests: number;
  vegCount: number;
  nonVegCount: number;
  vegPercentage: number;
  nonVegPercentage: number;
  vegBufferPercent: number;
  nonVegBufferPercent: number;
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
  bySlotId?: Record<string, number>;
}
