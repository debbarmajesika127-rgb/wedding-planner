import React from 'react';
import {
  AttendanceForecast,
  CateringEstimate,
  ArrivalDistribution,
  ArrivalScheduleSlot,
  DEFAULT_ARRIVAL_SCHEDULE,
} from '../types/wedding';
import {
  Users,
  Utensils,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Settings,
} from 'lucide-react';

interface AttendanceEstimatorCardProps {
  forecast: AttendanceForecast;
  catering: CateringEstimate;
  arrivals: ArrivalDistribution;
  arrivalSchedule?: ArrivalScheduleSlot[];
  onNavigateToReminders: () => void;
  onOpenScheduleSettings?: () => void;
}

export const AttendanceEstimatorCard: React.FC<AttendanceEstimatorCardProps> = ({
  forecast,
  catering,
  arrivals,
  arrivalSchedule = DEFAULT_ARRIVAL_SCHEDULE,
  onNavigateToReminders,
  onOpenScheduleSettings,
}) => {
  return (
    <div className="space-y-4">
      {/* Main Attendance Card */}
      <div className="bg-white rounded-2xl p-5 border border-black/15 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-black">
              Attendance & Headcount
            </h2>
            <p className="text-xs text-black/60">
              Expected turnout based on confirmed RSVPs and response history
            </p>
          </div>

          <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-[#800000] text-[#800000] font-semibold bg-white">
            {forecast.totalInvited === 0
              ? 'Ready to Start'
              : forecast.attendanceConfidence === 'high'
              ? 'High Confidence'
              : forecast.attendanceConfidence === 'medium'
              ? 'Moderate Confidence'
              : 'Action Needed'}
          </span>
        </div>

        {/* 3 Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Estimated Turnout - Highlighted in Maroon */}
          <div className="bg-[#800000] rounded-xl p-4 text-white shadow-xs relative overflow-hidden">
            <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" /> Estimated Turnout
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-tight text-white">{forecast.mostLikelyExpected}</span>
              <span className="text-xs text-white/80 font-medium">guests</span>
            </div>
            <p className="text-[11px] text-white/80 mt-1">
              Estimated range: {forecast.minExpected} – {forecast.maxExpected} guests
            </p>
          </div>

          {/* Confirmed Yes */}
          <div className="bg-white border border-black/15 rounded-xl p-4 text-black">
            <span className="text-[11px] text-black/60 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#800000]" /> Confirmed Yes
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-black">{forecast.confirmedPartyCount}</span>
              <span className="text-xs text-black/60">attendees</span>
            </div>
            <p className="text-[11px] text-black/60 mt-1">
              {forecast.confirmedAttending} primary invitations
            </p>
          </div>

          {/* Awaiting RSVP */}
          <div className="bg-white border border-black/15 rounded-xl p-4 text-black">
            <span className="text-[11px] text-black/60 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-[#800000]" /> Awaiting Response
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#800000]">{forecast.pendingCount}</span>
              <span className="text-xs text-black/60">pending</span>
            </div>
            <p className="text-[11px] text-black/60 mt-1">
              {forecast.declinedCount} declined
            </p>
          </div>
        </div>

        {/* Onboarding hint when 0 guests */}
        {forecast.totalInvited === 0 && (
          <div className="mt-4 p-3 bg-white rounded-xl border border-black/20 flex items-center gap-2.5 text-xs text-black">
            <div className="w-7 h-7 rounded-full bg-white text-[#800000] border border-[#800000] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-black">Guest list is empty</p>
              <p className="text-[11px] text-black/60">
                Add guests or share your RSVP link to populate live attendance estimates and meal counts.
              </p>
            </div>
          </div>
        )}

        {/* Absence reminder callout if pending guests exist */}
        {forecast.pendingCount > 0 && (
          <div className="mt-4 p-3 bg-white rounded-xl border border-[#800000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white text-[#800000] border border-[#800000] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-black">
                  {forecast.pendingCount} guests haven't confirmed yet
                </p>
                <p className="text-[11px] text-black/60">
                  Send WhatsApp reminders to finalize catering numbers.
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToReminders}
              className="w-full sm:w-auto px-4 py-1.5 bg-[#800000] hover:bg-[#660000] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1 shrink-0"
            >
              Send Reminders <ArrowRight className="w-3.5 h-3.5" />
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
              <h3 className="text-sm font-bold text-black">
                Catering Meal Split
              </h3>
            </div>
            <span className="text-xs text-black/60 font-medium">
              {catering.totalAttendingGuests} Confirmed Meals
            </span>
          </div>

          {/* Visual split progress bar */}
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-white border border-black/20 rounded-full overflow-hidden flex">
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
                🌱 Vegetarian ({catering.vegPercentage}%)
              </span>
              <span className="flex items-center gap-1 font-semibold text-black">
                🥩 Non-Vegetarian ({catering.nonVegPercentage}%)
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
              <div className="text-[10px] text-black/70 mt-1 flex items-center justify-between border-t border-black/10 pt-1">
                <span>Kitchen order (+10%):</span>
                <strong className="text-[#800000] font-bold">{catering.recommendedVegWithBuffer}</strong>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-black/25 rounded-xl">
              <div className="text-black font-semibold flex items-center justify-between">
                <span>Non-Veg</span>
                <span className="font-bold text-sm text-black">{catering.nonVegCount}</span>
              </div>
              <div className="text-[10px] text-black/70 mt-1 flex items-center justify-between border-t border-black/10 pt-1">
                <span>Kitchen order (+8%):</span>
                <strong className="text-black font-bold">{catering.recommendedNonVegWithBuffer}</strong>
              </div>
            </div>
          </div>

          {/* Allergy alert pill */}
          {catering.allergyNotes.length > 0 && (
            <div className="text-[11px] text-black bg-white p-2 rounded-lg border border-[#800000]">
              <strong className="text-[#800000]">{catering.allergyNotes.length} Dietary Restrictions logged</strong> (Gluten-free, Lactose, Jain, etc.)
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
              <h3 className="text-sm font-bold text-black">
                Arrival Schedule
              </h3>
            </div>
            {onOpenScheduleSettings && (
              <button
                type="button"
                onClick={onOpenScheduleSettings}
                className="text-xs text-[#800000] hover:underline font-semibold flex items-center gap-1"
                title="Configure bride & groom arrival schedule"
              >
                <Settings className="w-3 h-3" /> Set Schedule
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {arrivalSchedule.map((slot, index) => {
              const count =
                arrivals.bySlotId?.[slot.id] ??
                (slot.id === 'ceremony'
                  ? arrivals.ceremony
                  : slot.id === 'cocktails'
                  ? arrivals.cocktails
                  : slot.id === 'dinner'
                  ? arrivals.dinner
                  : slot.id === 'late-party'
                  ? arrivals.lateParty
                  : 0);

              const dotColor =
                index % 3 === 0
                  ? 'bg-[#800000]'
                  : index % 3 === 1
                  ? 'bg-black'
                  : 'bg-black/60';

              return (
                <div
                  key={slot.id || index}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-black/15 hover:border-[#800000] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <span className="font-medium text-black truncate">
                      {slot.title} ({slot.time})
                    </span>
                  </div>
                  <span className="font-bold text-black shrink-0 ml-2">
                    {count} {count === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
              );
            })}

            {arrivals.unspecified > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-black/15 text-black/60">
                <span className="text-xs">Time Unspecified</span>
                <span className="font-semibold text-xs">{arrivals.unspecified} guests</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
