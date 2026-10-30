import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCateringCounts,
  calculateAttendanceEstimate,
  calculateArrivalDistribution,
  generateWhatsAppMessage,
} from './wedding-logic.js';
import { Guest, WeddingDetails } from '../types/wedding.js';

const mockWedding: WeddingDetails = {
  brideName: 'Sophia Chen',
  groomName: 'Liam Montgomery',
  date: 'Saturday, Nov 14, 2026',
  time: '3:30 PM',
  venueName: 'Meadowood Vineyard',
  venueAddress: '900 Meadowood Ln, St. Helena, CA',
  rsvpDeadline: 'October 15, 2026',
  coupleContactPhone: '+15550192834',
  storySnippet: 'Celebrating our love surrounded by the vines of Napa Valley.',
};

const mockGuests: Guest[] = [
  {
    id: 'g1',
    name: 'Sarah Jenkins',
    phone: '+14155552671',
    side: 'bride',
    rsvpStatus: 'attending',
    partySize: 2,
    partyMembers: [
      { name: 'Sarah Jenkins', dietary: 'veg', notes: 'Gluten-sensitive' },
      { name: 'David Jenkins', dietary: 'non-veg' },
    ],
    arrivalTime: 'ceremony',
    lastUpdated: '2026-10-10T12:00:00Z',
    remindersSent: 0,
    inviteToken: 'sarah-j',
    relation: 'Maid of Honor',
  },
  {
    id: 'g2',
    name: 'Carlos Mendez',
    phone: '+14155559821',
    side: 'groom',
    rsvpStatus: 'attending',
    partySize: 1,
    partyMembers: [
      { name: 'Carlos Mendez', dietary: 'non-veg' },
    ],
    arrivalTime: 'cocktails',
    lastUpdated: '2026-10-12T14:30:00Z',
    remindersSent: 0,
    inviteToken: 'carlos-m',
    relation: 'College Friend',
  },
  {
    id: 'g3',
    name: 'Emily Watson',
    phone: '+14155553312',
    side: 'mutual',
    rsvpStatus: 'declined',
    partySize: 1,
    partyMembers: [],
    arrivalTime: 'not-attending',
    absenceReason: 'Prior international conference in Tokyo',
    blessingMessage: 'Wishing you both lifetime happiness!',
    lastUpdated: '2026-10-05T09:00:00Z',
    remindersSent: 1,
    inviteToken: 'emily-w',
    relation: 'Work Colleague',
  },
  {
    id: 'g4',
    name: 'Aiden Patel',
    phone: '+14155558844',
    side: 'groom',
    rsvpStatus: 'pending',
    partySize: 2,
    partyMembers: [],
    arrivalTime: 'unknown',
    lastUpdated: '2026-09-20T10:00:00Z',
    remindersSent: 1,
    inviteToken: 'aiden-p',
    relation: 'High School Friend',
  },
];

test('calculateCateringCounts correctly sums veg, non-veg and includes buffer', () => {
  const result = calculateCateringCounts(mockGuests);
  
  assert.equal(result.totalAttendingGuests, 3);
  assert.equal(result.vegCount, 1);
  assert.equal(result.nonVegCount, 2);
  // Veg buffer is ceil(1 * 1.10) = 2
  assert.equal(result.recommendedVegWithBuffer, 2);
  // Non-veg buffer is ceil(2 * 1.08) = 3
  assert.equal(result.recommendedNonVegWithBuffer, 3);
  assert.equal(result.totalMealsRecommended, 5);
  assert.equal(result.allergyNotes.length, 1);
  assert.ok(result.allergyNotes[0].note.includes('Gluten-sensitive'));
});

test('calculateCateringCounts applies couple-customized buffer percentages', () => {
  const customCatering = {
    catererName: 'Artisan Kitchen',
    catererPhone: '+15551234567',
    vegBufferPercent: 20,
    nonVegBufferPercent: 15,
  };
  const result = calculateCateringCounts(mockGuests, customCatering);
  assert.equal(result.vegBufferPercent, 20);
  assert.equal(result.nonVegBufferPercent, 15);
  // 1 veg * 1.20 = 1.2 -> ceil = 2
  assert.equal(result.recommendedVegWithBuffer, 2);
  // 2 non-veg * 1.15 = 2.3 -> ceil = 3
  assert.equal(result.recommendedNonVegWithBuffer, 3);
});

test('calculateAttendanceEstimate computes realistic headcount forecast with drop-off logic', () => {
  const forecast = calculateAttendanceEstimate(mockGuests);

  // Total invited: Sarah (2) + Carlos (1) + Emily (1) + Aiden (2) = 6
  assert.equal(forecast.totalInvited, 6);
  assert.equal(forecast.confirmedPartyCount, 3);
  assert.equal(forecast.declinedCount, 1);
  assert.equal(forecast.pendingCount, 1);
  // Response rate: 3 answered out of 4 guests = 75%
  assert.equal(forecast.responseRatePercentage, 75);
  // Most likely is calculated with weights (3*0.92 + 2*0.35 + ...) = 2.76 + 0.7 = ~3
  assert.ok(forecast.mostLikelyExpected >= 2 && forecast.mostLikelyExpected <= 5);
});

test('calculateArrivalDistribution breaks down attendance by time slots', () => {
  const arrivals = calculateArrivalDistribution(mockGuests);

  assert.equal(arrivals.ceremony, 2); // Sarah's party of 2
  assert.equal(arrivals.cocktails, 1); // Carlos's party of 1
  assert.equal(arrivals.dinner, 0);
  assert.equal(arrivals.lateParty, 0);
});

test('generateWhatsAppMessage creates customized links with deep link url', () => {
  const invite = generateWhatsAppMessage('invitation', mockGuests[0], mockWedding, 'https://example.com');
  assert.ok(invite.text.includes('Sophia Chen & Liam Montgomery'));
  assert.ok(invite.text.includes('Sarah Jenkins'));
  assert.ok(invite.url.startsWith('https://wa.me/14155552671?text='));

  const absenceReminder = generateWhatsAppMessage('absence-reminder', mockGuests[3], mockWedding, 'https://example.com');
  assert.ok(absenceReminder.text.includes('haven\'t received your RSVP yet'));
  assert.ok(absenceReminder.url.includes('aiden-p'));
});

test('calculateArrivalDistribution handles couple-configured custom arrival schedule', () => {
  const customSchedule = [
    { id: 'welcome-tea', title: 'Welcome Tea', time: '1:00 PM' },
    { id: 'ceremony', title: 'Ceremony', time: '3:00 PM' },
    { id: 'cocktails', title: 'Cocktails', time: '5:00 PM' },
  ];

  const guestsWithCustomSlot: Guest[] = [
    {
      id: 'g-tea',
      name: 'Grandma Rose',
      phone: '+14155550001',
      side: 'family',
      rsvpStatus: 'attending',
      partySize: 3,
      partyMembers: [
        { name: 'Rose', dietary: 'veg' },
        { name: 'Arthur', dietary: 'veg' },
        { name: 'Leo', dietary: 'non-veg' },
      ],
      arrivalTime: 'welcome-tea',
      lastUpdated: '2026-10-15T09:00:00Z',
      remindersSent: 0,
      inviteToken: 'grandma-rose',
      relation: 'Grandmother',
    },
    ...mockGuests,
  ];

  const arrivals = calculateArrivalDistribution(guestsWithCustomSlot, customSchedule);
  assert.equal(arrivals.bySlotId?.['welcome-tea'], 3);
  assert.equal(arrivals.ceremony, 2);
  assert.equal(arrivals.cocktails, 1);
});
