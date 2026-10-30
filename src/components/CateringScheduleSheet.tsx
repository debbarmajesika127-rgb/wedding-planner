import React, { useState } from 'react';
import {
  Guest,
  CateringEstimate,
  ArrivalDistribution,
  WeddingDetails,
  DEFAULT_ARRIVAL_SCHEDULE,
} from '../types/wedding';
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
  Settings,
  Phone,
  Edit2,
  ChefHat,
  Percent,
} from 'lucide-react';

interface CateringScheduleSheetProps {
  guests: Guest[];
  catering: CateringEstimate;
  arrivals: ArrivalDistribution;
  wedding: WeddingDetails;
  onOpenSettings?: (tab?: 'details' | 'schedule' | 'catering') => void;
  onUpdateWeddingDetails?: (updated: WeddingDetails) => void;
}

export const CateringScheduleSheet: React.FC<CateringScheduleSheetProps> = ({
  guests,
  catering,
  arrivals,
  wedding,
  onOpenSettings,
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

  const schedule = wedding.arrivalSchedule && wedding.arrivalSchedule.length > 0
    ? wedding.arrivalSchedule
    : DEFAULT_ARRIVAL_SCHEDULE;

  const handleCopySummary = () => {
    const coupleTitle = (wedding.brideName && wedding.groomName)
      ? `${wedding.brideName} & ${wedding.groomName}`
      : 'Wedding Event';
    const dateVenue = [wedding.date, wedding.venueName].filter(Boolean).join(' | ') || 'Date & Venue TBD';

    const arrivalLines = schedule
      .map((slot) => {
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
        return `- ${slot.time} ${slot.title}: ${count} guests`;
      })
      .join('\n');

    const cateringInfo = wedding.cateringDetails;
    const catererSection = cateringInfo?.catererName || cateringInfo?.catererPhone
      ? `CATERER: ${cateringInfo.catererName || 'Not specified'} (${cateringInfo.catererPhone || 'No phone'})\n` +
        (cateringInfo.headcountDueDate ? `Final Headcount Due: ${cateringInfo.headcountDueDate}\n\n` : '\n')
      : '';

    const menuSection = cateringInfo?.menuHighlights
      ? `MENU HIGHLIGHTS:\n${cateringInfo.menuHighlights}\n\n`
      : '';

    const kitchenNotesSection = cateringInfo?.kitchenNotes
      ? `KITCHEN & SERVICE INSTRUCTIONS:\n${cateringInfo.kitchenNotes}\n\n`
      : '';

    const summaryText = `WEDDING CATERING & LOGISTICS BRIEF\n` +
      `Couple: ${coupleTitle}\n` +
      `${dateVenue}\n\n` +
      catererSection +
      `TOTAL CONFIRMED ATTENDEES: ${catering.totalAttendingGuests}\n\n` +
      `MEAL COUNTS:\n` +
      `- Vegetarian: ${catering.vegCount} (Recommended with +${catering.vegBufferPercent}% safety buffer: ${catering.recommendedVegWithBuffer})\n` +
      `- Non-Vegetarian: ${catering.nonVegCount} (Recommended with +${catering.nonVegBufferPercent}% safety buffer: ${catering.recommendedNonVegWithBuffer})\n` +
      `- Total Prepared Meals: ${catering.totalMealsRecommended}\n\n` +
      `ARRIVAL & SERVICE SCHEDULE:\n` +
      `${arrivalLines}\n\n` +
      menuSection +
      kitchenNotesSection +
      `ALLERGIES & SPECIAL DIETARY RESTRICTIONS:\n` +
      (catering.allergyNotes.length > 0
        ? catering.allergyNotes.map((a) => `• ${a.guestName}: ${a.note}`).join('\n')
        : 'None recorded.');

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const cateringInfo = wedding.cateringDetails;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-5 border border-black/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
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

        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => onOpenSettings('catering')}
              className="px-3 py-2 bg-white border-2 border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Edit catering notes, safety buffers, and caterer contact"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Catering
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => onOpenSettings('schedule')}
              className="px-3 py-2 bg-white border border-black/20 hover:border-black text-black text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Edit wedding arrival schedule milestones"
            >
              <Clock className="w-3.5 h-3.5 text-[#800000]" /> Edit Schedule
            </button>
          )}

          <button
            onClick={handleCopySummary}
            className="px-3 py-2 bg-white border border-black/20 hover:border-[#800000] text-black text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
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

      {/* Caterer Logistics & Contact Strip */}
      <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white border border-[#800000] text-[#800000] flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-black/60">Caterer / Kitchen</div>
              <div className="font-bold text-black">
                {cateringInfo?.catererName || 'Not configured'}
              </div>
            </div>
          </div>

          {cateringInfo?.catererPhone && (
            <div className="flex items-center gap-1.5 text-black/80 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#800000]" />
              <span>{cateringInfo.catererPhone}</span>
            </div>
          )}

          {cateringInfo?.headcountDueDate && (
            <div className="flex items-center gap-1.5 text-black/80">
              <Calendar className="w-3.5 h-3.5 text-[#800000]" />
              <span>Due: <strong className="text-black">{cateringInfo.headcountDueDate}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-black/80">
            <Percent className="w-3.5 h-3.5 text-[#800000]" />
            <span>Buffers: <strong>+{catering.vegBufferPercent}% Veg</strong>, <strong>+{catering.nonVegBufferPercent}% Non-Veg</strong></span>
          </div>
        </div>

        {onOpenSettings && (
          <button
            type="button"
            onClick={() => onOpenSettings('catering')}
            className="text-xs text-[#800000] hover:underline font-semibold flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" /> Edit Catering Settings
          </button>
        )}
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
            Prepare <strong className="text-[#800000]">{catering.recommendedVegWithBuffer} plates</strong> (+{catering.vegBufferPercent}% buffer)
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
            Prepare <strong className="text-black">{catering.recommendedNonVegWithBuffer} plates</strong> (+{catering.nonVegBufferPercent}% buffer)
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

      {/* Arrival Schedule & Service Timeline Card */}
      <div className="bg-white rounded-2xl p-5 border border-black/15 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white text-[#800000] border border-[#800000] rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-black">
                Wedding Day Arrival & Food Service Schedule
              </h3>
              <p className="text-xs text-black/60">
                Timeline configured by bride & groom for kitchen service coordination
              </p>
            </div>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => onOpenSettings('schedule')}
              className="text-xs text-[#800000] hover:underline font-semibold flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" /> Edit Schedule
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {schedule.map((slot, idx) => {
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

            return (
              <div
                key={slot.id || idx}
                className="p-3.5 bg-white rounded-xl border border-black/15 hover:border-[#800000] transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#800000] text-white text-[11px] font-bold">
                    {slot.time}
                  </span>
                  <span className="text-xs font-bold text-black">
                    {count} {count === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
                <div className="font-bold text-xs text-black truncate" title={slot.title}>
                  {slot.title}
                </div>
                {slot.description && (
                  <p className="text-[11px] text-black/60 line-clamp-2" title={slot.description}>
                    {slot.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Highlights & Kitchen Instructions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Menu Highlights */}
        <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-[#800000]" /> Menu Highlights & Courses
            </h3>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => onOpenSettings('catering')}
                className="text-[11px] text-[#800000] hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          {cateringInfo?.menuHighlights ? (
            <p className="text-xs text-black whitespace-pre-line bg-white p-2.5 rounded-xl border border-black/10">
              {cateringInfo.menuHighlights}
            </p>
          ) : (
            <p className="text-xs text-black/60 italic bg-white p-2.5 rounded-xl border border-black/10">
              No menu highlights entered yet. Click Edit to add course details for your catering staff.
            </p>
          )}
        </div>

        {/* Special Instructions for Kitchen Staff */}
        <div className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#800000]" /> Kitchen & Staff Handover Instructions
            </h3>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => onOpenSettings('catering')}
                className="text-[11px] text-[#800000] hover:underline font-semibold"
              >
                Edit
              </button>
            )}
          </div>
          {cateringInfo?.kitchenNotes ? (
            <p className="text-xs text-black whitespace-pre-line bg-white p-2.5 rounded-xl border border-black/10">
              {cateringInfo.kitchenNotes}
            </p>
          ) : (
            <p className="text-xs text-black/60 italic bg-white p-2.5 rounded-xl border border-black/10">
              No special instructions logged. Click Edit to add banquet handover notes.
            </p>
          )}
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

        {tableList.length === 0 ? (
          <div className="py-8 text-center text-black/60 text-xs border border-dashed border-black/20 rounded-xl p-4 space-y-1">
            <p className="font-semibold text-black">No confirmed guest seating yet</p>
            <p className="text-[11px] text-black/50">
              When guests confirm attendance, their table meal allocations will appear here.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
