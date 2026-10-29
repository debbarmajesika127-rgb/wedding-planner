import React, { useState } from 'react';
import { Guest, CateringEstimate, ArrivalDistribution, WeddingDetails } from '../types/wedding';
import {
  Utensils,
  Clock,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CateringScheduleSheetProps {
  guests: Guest[];
  catering: CateringEstimate;
  arrivals: ArrivalDistribution;
  wedding: WeddingDetails;
}

export const CateringScheduleSheet: React.FC<CateringScheduleSheetProps> = ({
  guests,
  catering,
  arrivals,
  wedding,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Group attending guests by table
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');

  const tablesMap = new Map<string, { table: string; guests: Guest[]; veg: number; nonVeg: number }>();

  attendingGuests.forEach((g) => {
    const tableKey = g.table || 'Unassigned Seating';
    if (!tablesMap.has(tableKey)) {
      tablesMap.set(tableKey, { table: tableKey, guests: [], veg: 0, nonVeg: 0 });
    }
    const entry = tablesMap.get(tableKey)!;
    entry.guests.push(g);

    g.partyMembers?.forEach((m) => {
      if (m.dietary === 'veg') entry.veg += 1;
      else entry.nonVeg += 1;
    });
  });

  const tableList = Array.from(tablesMap.values()).sort((a, b) => a.table.localeCompare(b.table));

  const handleCopySummary = () => {
    const summaryText = `WEDDING CATERING & LOGISTICS BRIEF\n` +
      `Couple: ${wedding.brideName} & ${wedding.groomName}\n` +
      `Date: ${wedding.date} | Venue: ${wedding.venueName}\n\n` +
      `TOTAL CONFIRMED ATTENDEES: ${catering.totalAttendingGuests}\n\n` +
      `MEAL COUNTS:\n` +
      `- Vegetarian: ${catering.vegCount} (Recommended with +10% safety buffer: ${catering.recommendedVegWithBuffer})\n` +
      `- Non-Vegetarian: ${catering.nonVegCount} (Recommended with +8% safety buffer: ${catering.recommendedNonVegWithBuffer})\n` +
      `- Total Prepared Meals: ${catering.totalMealsRecommended}\n\n` +
      `ARRIVAL SCHEDULE:\n` +
      `- 3:00 PM Ceremony: ${arrivals.ceremony} guests\n` +
      `- 4:30 PM Cocktail Hour: ${arrivals.cocktails} guests\n` +
      `- 6:00 PM Dinner Reception: ${arrivals.dinner} guests\n` +
      `- 8:00 PM Late Party: ${arrivals.lateParty} guests\n\n` +
      `ALLERGIES & SPECIAL DIETARY RESTRICTIONS:\n` +
      catering.allergyNotes.map((a) => `• ${a.guestName}: ${a.note}`).join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-5 border border-black/15 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border border-[#800000] text-[#800000] bg-white">
            Official Kitchen & Venue Handover
          </span>
          <h2 className="text-lg font-serif-wedding font-bold text-black mt-1">
            Catering Orders, Allergies & Arrival Schedule
          </h2>
          <p className="text-xs text-black/70">
            Share directly with your catering chef, banquet captain, and day-of coordinator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-2 bg-white border border-black/20 hover:border-[#800000] text-black text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-[#800000]" /> : <Copy className="w-3.5 h-3.5 text-black" />}
            {copiedSummary ? 'Copied Brief!' : 'Copy Summary'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print Manifest
          </button>
        </div>
      </div>

      {/* Caterer Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Vegetarian Orders */}
        <div className="bg-white border-2 border-[#800000] rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#800000] flex items-center gap-1">
              🌱 Vegetarian Plates
            </span>
            <span className="text-xs font-bold px-2 py-0.5 border border-[#800000] text-[#800000] rounded-md">
              {catering.vegPercentage}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#800000] mt-1">
            {catering.vegCount}
          </div>
          <p className="text-xs text-black">
            Prepare <strong className="text-[#800000]">{catering.recommendedVegWithBuffer} plates</strong> (+10% buffer)
          </p>
        </div>

        {/* Non-Vegetarian Orders */}
        <div className="bg-white border-2 border-black/25 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-black flex items-center gap-1">
              🥩 Non-Vegetarian Plates
            </span>
            <span className="text-xs font-bold px-2 py-0.5 border border-black text-black rounded-md">
              {catering.nonVegPercentage}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-black mt-1">
            {catering.nonVegCount}
          </div>
          <p className="text-xs text-black">
            Prepare <strong className="text-black">{catering.recommendedNonVegWithBuffer} plates</strong> (+8% buffer)
          </p>
        </div>

        {/* Total Meal Count - Highlighted in Maroon */}
        <div className="bg-[#800000] text-white rounded-2xl p-4 space-y-1 shadow-xs border border-[#660000]">
          <span className="text-xs font-medium text-white/90">
            Total Recommended Orders
          </span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {catering.totalMealsRecommended}
          </div>
          <p className="text-xs text-white/90">
            Covers {catering.totalAttendingGuests} confirmed guests + extra buffers
          </p>
        </div>
      </div>

      {/* Allergies & Dietary Restrictions Box */}
      <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-white text-[#800000] border border-[#800000] rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-black">
            Critical Dietary Allergies & Notes ({catering.allergyNotes.length})
          </h3>
        </div>

        {catering.allergyNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {catering.allergyNotes.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-black/15 flex items-start gap-2.5"
              >
                <span className="text-[#800000] font-bold text-xs mt-0.5">•</span>
                <div>
                  <div className="text-xs font-semibold text-black">{item.guestName}</div>
                  <div className="text-xs text-[#800000] mt-0.5 border border-[#800000] px-2 py-0.5 rounded inline-block font-semibold">
                    {item.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-black/60 italic">No specific allergies recorded yet.</p>
        )}
      </div>

      {/* Table by Table Seating Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white text-[#800000] border border-[#800000] rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-black">
              Table-by-Table Meal Deliveries
            </h3>
          </div>
          <span className="text-xs text-black/70 font-semibold">
            {tableList.length} Tables Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tableList.map((entry, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-black/15 space-y-2 hover:border-[#800000] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-black">
                  {entry.table}
                </span>
                <span className="text-[11px] text-black/60">
                  {entry.guests.reduce((s, g) => s + g.partySize, 0)} Seats
                </span>
              </div>

              {/* Veg / Non-veg badges */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 bg-white border border-[#800000] text-[#800000] rounded font-semibold">
                  🌱 {entry.veg} Veg
                </span>
                <span className="px-2 py-0.5 bg-white border border-black text-black rounded font-semibold">
                  🥩 {entry.nonVeg} Non-Veg
                </span>
              </div>

              {/* Guest names */}
              <div className="pt-1.5 border-t border-black/10 text-[11px] text-black/70 space-y-0.5">
                {entry.guests.map((g) => (
                  <div key={g.id} className="truncate">
                    • {g.name} ({g.partySize})
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
