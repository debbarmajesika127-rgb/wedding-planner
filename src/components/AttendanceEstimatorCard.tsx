import React, { useState } from 'react';
import {
  AttendanceForecast,
  CateringEstimate,
  ArrivalDistribution,
} from '../types/wedding';
import {
  Users,
  Utensils,
  TrendingUp,
  Clock,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

interface AttendanceEstimatorCardProps {
  forecast: AttendanceForecast;
  catering: CateringEstimate;
  arrivals: ArrivalDistribution;
  onNavigateToReminders: () => void;
}

export const AttendanceEstimatorCard: React.FC<AttendanceEstimatorCardProps> = ({
  forecast,
  catering,
  arrivals,
  onNavigateToReminders,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Attendance Card */}
      <div className="bg-white rounded-2xl p-5 border border-black/15 shadow-xs relative overflow-hidden">
        {/* Subtle decorative top bar in maroon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#800000]" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white text-[#800000] border border-[#800000] rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-black flex items-center gap-1.5">
                Accurate Attendance Forecast
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white text-[#800000] border border-[#800000]">
                  AI & Wedding Math
                </span>
              </h2>
              <p className="text-xs text-black/70">
                Predictive turnout adjusted for real-world drop-offs & pending replies
              </p>
            </div>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full border border-[#800000] text-[#800000] bg-white font-medium">
            {forecast.attendanceConfidence === 'high'
              ? 'High Confidence (85%+ RSVPed)'
              : forecast.attendanceConfidence === 'medium'
              ? 'Medium Confidence'
              : 'Low Confidence (Needs Reminders)'}
          </span>
        </div>

        {/* 3 Metric Hero Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          {/* Expected True Attendance - Highlighted in Maroon */}
          <div className="col-span-3 sm:col-span-1 bg-[#800000] rounded-xl p-3.5 text-white shadow-xs relative overflow-hidden border border-[#660000]">
            <div className="absolute -right-2 -bottom-2 opacity-15">
              <Users className="w-20 h-20" />
            </div>
            <span className="text-[11px] font-medium text-white/90 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Most Likely Turnout
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold tracking-tight text-white">{forecast.mostLikelyExpected}</span>
              <span className="text-xs text-white/90 font-medium">guests</span>
            </div>
            <p className="text-[11px] text-white/80 mt-1">
              Forecast range: {forecast.minExpected} – {forecast.maxExpected} guests
            </p>
          </div>

          {/* Raw RSVP Yes */}
          <div className="bg-white border border-black/20 rounded-xl p-3 text-black">
            <span className="text-[11px] text-black/70 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#800000]" /> Confirmed Yes
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-black">{forecast.confirmedPartyCount}</span>
              <span className="text-xs text-black/60">people</span>
            </div>
            <p className="text-[10px] text-black/60 mt-0.5">
              from {forecast.confirmedAttending} primary invites
            </p>
          </div>

          {/* Pending / Unanswered */}
          <div className="bg-white border border-[#800000] rounded-xl p-3 text-black">
            <span className="text-[11px] text-[#800000] font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#800000]" /> Awaiting RSVP
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#800000]">{forecast.pendingCount}</span>
              <span className="text-xs text-black/60">invites</span>
            </div>
            <p className="text-[10px] text-black/60 mt-0.5">
              {forecast.declinedCount} declined gracefully
            </p>
          </div>
        </div>

        {/* Predictive formula explainer toggle */}
        <div className="border-t border-black/10 pt-3">
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="w-full flex items-center justify-between text-xs text-black hover:text-[#800000] py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-[#800000]" />
              How Nuptia calculates your actual expected turnout
            </span>
            {showFormulaDetails ? <ChevronUp className="w-4 h-4 text-[#800000]" /> : <ChevronDown className="w-4 h-4 text-black/60" />}
          </button>

          {showFormulaDetails && (
            <div className="mt-2.5 p-3 bg-white rounded-xl text-xs text-black space-y-2 border border-black/20">
              <p className="font-semibold text-black">
                Why standard RSVPs are notoriously inaccurate for wedding catering:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] text-black/80">
                <li>
                  <strong className="text-black">8% Confirmed Drop-off:</strong> Nationally, ~8% of confirmed guests experience sudden flight delays, illness, or childcare cancellations in the final 48 hours.
                </li>
                <li>
                  <strong className="text-black">35% Pending Turnout:</strong> Over 1 in 3 unconfirmed guests end up attending without updating their RSVP, leading to last-minute seating panics.
                </li>
                <li>
                  <strong className="text-black">50% Uncertain Turnout:</strong> Guests with tentative work or pregnancy schedules have a 50/50 probability.
                </li>
              </ul>
              <div className="p-2 bg-white rounded-lg text-black text-[11px] font-medium border border-[#800000]">
                💡 Nuptia factors these statistical weights to save you $1,000+ in unnecessary catering minimums while preventing empty chairs or food shortages.
              </div>
            </div>
          )}
        </div>

        {/* Absence reminder callout if pending guests exist */}
        {forecast.pendingCount > 0 && (
          <div className="mt-3.5 p-3.5 bg-white rounded-xl border-2 border-[#800000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-[#800000] border border-[#800000] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-black">
                  {forecast.pendingCount} guests haven't updated their plans yet
                </p>
                <p className="text-[11px] text-black/70">
                  Send automated WhatsApp absence reminders to lock in your numbers.
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToReminders}
              className="w-full sm:w-auto px-4 py-1.5 bg-[#800000] hover:bg-[#660000] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors text-center shrink-0"
            >
              Send Reminders Now →
            </button>
          </div>
        )}
      </div>

      {/* Catering & Meals Counter Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Vegetarian vs Non-Vegetarian */}
        <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white text-[#800000] border border-[#800000] rounded-lg">
                <Utensils className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-black">
                Catering Meal Split
              </h3>
            </div>
            <span className="text-xs text-black/70 font-medium">
              {catering.totalAttendingGuests} Confirmed Meals
            </span>
          </div>

          {/* Visual split progress bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-white border border-black/20 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${catering.vegPercentage}%` }}
                className="bg-[#800000] transition-all duration-500"
                title={`Vegetarian: ${catering.vegCount}`}
              />
              <div
                style={{ width: `${catering.nonVegPercentage}%` }}
                className="bg-black transition-all duration-500"
                title={`Non-Vegetarian: ${catering.nonVegCount}`}
              />
            </div>
            <div className="flex justify-between text-[11px] text-black px-0.5">
              <span className="flex items-center gap-1 font-semibold text-[#800000]">
                🌱 Veg ({catering.vegPercentage}%)
              </span>
              <span className="flex items-center gap-1 font-semibold text-black">
                🥩 Non-Veg ({catering.nonVegPercentage}%)
              </span>
            </div>
          </div>

          {/* Caterer Order Recommendation Boxes */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 bg-white border border-[#800000] rounded-xl">
              <div className="text-[#800000] font-semibold flex items-center justify-between">
                <span>Vegetarian</span>
                <span className="font-bold text-sm text-[#800000]">{catering.vegCount}</span>
              </div>
              <div className="text-[10px] text-black mt-1 flex items-center justify-between border-t border-black/10 pt-1">
                <span>Caterer buffer (+10%):</span>
                <strong className="text-[#800000]">{catering.recommendedVegWithBuffer} plates</strong>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-black/30 rounded-xl">
              <div className="text-black font-semibold flex items-center justify-between">
                <span>Non-Veg</span>
                <span className="font-bold text-sm text-black">{catering.nonVegCount}</span>
              </div>
              <div className="text-[10px] text-black mt-1 flex items-center justify-between border-t border-black/10 pt-1">
                <span>Caterer buffer (+8%):</span>
                <strong className="text-black">{catering.recommendedNonVegWithBuffer} plates</strong>
              </div>
            </div>
          </div>

          {/* Allergy alert pill */}
          {catering.allergyNotes.length > 0 && (
            <div className="text-[11px] text-black bg-white p-2 rounded-lg border border-[#800000]">
              <strong className="text-[#800000]">{catering.allergyNotes.length} Dietary Allergies logged</strong> (Gluten, Lactose, Jain, etc.)
            </div>
          )}
        </div>

        {/* Arrival Times Timeline Distribution */}
        <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white text-[#800000] border border-[#800000] rounded-lg">
                <Clock className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-black">
                Arrival Schedule
              </h3>
            </div>
            <span className="text-xs text-black/70 font-medium">
              Guest Inflow
            </span>
          </div>

          <p className="text-xs text-black/70">
            Helps coordinate welcome drinks, ceremony seating, and late evening arrivals.
          </p>

          <div className="space-y-2 text-xs">
            {/* Ceremony */}
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-black/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                <span className="font-medium text-black">Ceremony (3:00 - 3:30 PM)</span>
              </div>
              <span className="font-bold text-black">{arrivals.ceremony} guests</span>
            </div>

            {/* Cocktail Hour */}
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-black/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black" />
                <span className="font-medium text-black">Cocktails (4:30 PM)</span>
              </div>
              <span className="font-bold text-black">{arrivals.cocktails} guests</span>
            </div>

            {/* Dinner Only */}
            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-black/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#800000]" />
                <span className="font-medium text-black">Dinner Arrival (6:00 PM)</span>
              </div>
              <span className="font-bold text-black">{arrivals.dinner} guests</span>
            </div>

            {/* Late Party */}
            {arrivals.lateParty > 0 && (
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-black/15">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/60" />
                  <span className="font-medium text-black">Late Dancing (8:00 PM+)</span>
                </div>
                <span className="font-bold text-black">{arrivals.lateParty} guests</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
