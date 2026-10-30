import { Guest, WeddingDetails, DEFAULT_ARRIVAL_SCHEDULE } from '../types/wedding';

export const INITIAL_WEDDING: WeddingDetails = {
  brideName: '',
  groomName: '',
  date: '',
  time: '',
  venueName: '',
  venueAddress: '',
  rsvpDeadline: '',
  coupleContactPhone: '',
  storySnippet: '',
  arrivalSchedule: DEFAULT_ARRIVAL_SCHEDULE,
  cateringDetails: {
    catererName: '',
    catererPhone: '',
    vegBufferPercent: 10,
    nonVegBufferPercent: 8,
    menuHighlights: '',
    kitchenNotes: '',
    headcountDueDate: '',
  },
};

export const INITIAL_GUESTS: Guest[] = [];
