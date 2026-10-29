import React, { useState, useMemo } from 'react';
import { Guest, RSVPStatus, GuestSide, ArrivalTimeSlot, DietaryChoice } from '../types/wedding';
import {
  getStatusBadgeInfo,
  formatArrivalTimeSlot,
} from '../utils/wedding-logic';
import {
  Search,
  Plus,
  Filter,
  MessageSquare,
  Copy,
  Check,
  Edit2,
  Trash2,
  Utensils,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  Users,
} from 'lucide-react';

interface GuestListManagerProps {
  guests: Guest[];
  onAddGuestClick: () => void;
  onEditGuest: (guest: Guest) => void;
  onDeleteGuest: (guestId: string) => void;
  onOpenGuestRSVP: (guest: Guest) => void;
  onOpenWhatsAppModal: (guest: Guest) => void;
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
  guests,
  onAddGuestClick,
  onEditGuest,
  onDeleteGuest,
  onOpenGuestRSVP,
  onOpenWhatsAppModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      // Search
      const matchesSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.relation.toLowerCase().includes(search.toLowerCase()) ||
        (g.phone && g.phone.includes(search)) ||
        (g.table && g.table.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter !== 'all' && g.rsvpStatus !== statusFilter) return false;

      // Side filter
      if (sideFilter !== 'all' && g.side !== sideFilter) return false;

      // Dietary filter
      if (dietaryFilter !== 'all') {
        const hasVeg = g.partyMembers?.some((m) => m.dietary === 'veg');
        const hasNonVeg = g.partyMembers?.some((m) => m.dietary === 'non-veg');

        if (dietaryFilter === 'veg' && !hasVeg) return false;
        if (dietaryFilter === 'non-veg' && !hasNonVeg) return false;
      }

      return true;
    });
  }, [guests, search, statusFilter, dietaryFilter, sideFilter]);

  const handleCopyLink = (guest: Guest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}?guest=${encodeURIComponent(guest.inviteToken || guest.id)}`;
    navigator.clipboard.writeText(link);
    setCopiedGuestId(guest.id);
    setTimeout(() => setCopiedGuestId(null), 2000);
  };

  const exportCSV = () => {
    const headers = [
      'Name',
      'Phone',
      'RSVP Status',
      'Party Size',
      'Vegetarian Count',
      'Non-Veg Count',
      'Arrival Slot',
      'Estimated Time',
      'Table',
      'Absence Reason',
      'Special Notes / Allergies',
    ];

    const rows = guests.map((g) => {
      const vegCount = g.partyMembers?.filter((m) => m.dietary === 'veg').length || 0;
      const nonVegCount = g.partyMembers?.filter((m) => m.dietary === 'non-veg').length || 0;
      const notes = [
        ...g.partyMembers?.map((m) => m.notes).filter(Boolean) || [],
        g.notes || '',
      ].join(' | ');

      return [
        `"${g.name}"`,
        `"${g.phone || ''}"`,
        `"${g.rsvpStatus}"`,
        g.partySize,
        vegCount,
        nonVegCount,
        `"${g.arrivalTime}"`,
        `"${g.estimatedArrivalHour || ''}"`,
        `"${g.table || ''}"`,
        `"${g.absenceReason || ''}"`,
        `"${notes}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wedding_guests_nuptia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest by name, phone, relation, or table..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/20 rounded-xl text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/60 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 bg-white border border-black/20 hover:border-black text-black text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download Excel/CSV for caterer"
          >
            <Download className="w-3.5 h-3.5 text-black" /> Export CSV
          </button>

          <button
            onClick={onAddGuestClick}
            className="px-4 py-2.5 bg-[#800000] hover:bg-[#660000] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-black font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#800000]" /> Filters:
        </span>

        {/* Status Filters */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-[#800000] text-white'
              : 'bg-white border border-black/20 text-black hover:border-black'
          }`}
        >
          All ({guests.length})
        </button>

        <button
          onClick={() => setStatusFilter('attending')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
            statusFilter === 'attending'
              ? 'bg-[#800000] text-white'
              : 'bg-white border border-black/20 text-black hover:border-[#800000]'
          }`}
        >
          Attending ({guests.filter((g) => g.rsvpStatus === 'attending').length})
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
            statusFilter === 'pending'
              ? 'bg-[#800000] text-white'
              : 'bg-white border border-black/20 text-black hover:border-[#800000]'
          }`}
        >
          Pending ({guests.filter((g) => g.rsvpStatus === 'pending').length})
        </button>

        <button
          onClick={() => setStatusFilter('declined')}
          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
            statusFilter === 'declined'
              ? 'bg-[#800000] text-white'
              : 'bg-white border border-black/20 text-black hover:border-[#800000]'
          }`}
        >
          Declined ({guests.filter((g) => g.rsvpStatus === 'declined').length})
        </button>

        {/* Dietary Split filter */}
        <select
          value={dietaryFilter}
          onChange={(e) => setDietaryFilter(e.target.value)}
          aria-label="Filter guests by meal preference"
          className="px-2.5 py-1 bg-white border border-black/20 rounded-lg text-black font-medium focus:outline-none focus:border-[#800000]"
        >
          <option value="all">Meals: Any</option>
          <option value="veg">🌱 Has Veg</option>
          <option value="non-veg">🥩 Has Non-Veg</option>
        </select>

        {/* Side filter */}
        <select
          value={sideFilter}
          onChange={(e) => setSideFilter(e.target.value)}
          aria-label="Filter guests by wedding side"
          className="px-2.5 py-1 bg-white border border-black/20 rounded-lg text-black font-medium focus:outline-none focus:border-[#800000]"
        >
          <option value="all">Side: All</option>
          <option value="bride">Bride</option>
          <option value="groom">Groom</option>
          <option value="family">Family</option>
          <option value="mutual">Mutual</option>
        </select>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredGuests.map((guest) => {
          const badge = getStatusBadgeInfo(guest.rsvpStatus);
          const vegCount = guest.partyMembers?.filter((m) => m.dietary === 'veg').length || 0;
          const nonVegCount = guest.partyMembers?.filter((m) => m.dietary === 'non-veg').length || 0;

          return (
            <div
              key={guest.id}
              className="bg-white rounded-2xl p-4 border border-black/15 shadow-xs hover:border-[#800000] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Header: Name, relation & Status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-black text-sm flex items-center gap-1.5">
                      {guest.name}
                      <span className="text-[11px] font-normal text-black/60">
                        ({guest.relation})
                      </span>
                    </h3>
                    <p className="text-xs text-black/60 mt-0.5">
                      {guest.phone || 'No WhatsApp phone'} • {guest.table || 'Table unassigned'}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Attending Details: Party, Meals, Arrival */}
                {guest.rsvpStatus === 'attending' && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {/* Meal Breakdown */}
                    <div className="p-2 bg-white rounded-xl border border-black/15 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-black font-semibold flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-[#800000]" /> {guest.partySize} Meal{guest.partySize > 1 ? 's' : ''}
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {vegCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-white border border-[#800000] text-[#800000] rounded font-medium text-[11px]">
                            🌱 {vegCount} Veg
                          </span>
                        )}
                        {nonVegCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-white border border-black text-black rounded font-medium text-[11px]">
                            🥩 {nonVegCount} Non-Veg
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrival Slot */}
                    <div className="p-2 bg-white rounded-xl border border-black/15 space-y-1">
                      <div className="text-[10px] uppercase tracking-wider text-black font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#800000]" /> Arrival Time
                      </div>
                      <div className="text-black font-medium truncate" title={formatArrivalTimeSlot(guest.arrivalTime)}>
                        {guest.estimatedArrivalHour || formatArrivalTimeSlot(guest.arrivalTime)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Absence reason if declined */}
                {guest.rsvpStatus === 'declined' && guest.absenceReason && (
                  <div className="mt-2 p-2.5 bg-white border border-black/20 rounded-xl text-xs text-black">
                    <p className="font-semibold text-[11px] text-[#800000]">Absence note:</p>
                    <p className="italic text-[11px] mt-0.5">"{guest.absenceReason}"</p>
                  </div>
                )}

                {/* Dietary allergies alert if any */}
                {guest.partyMembers?.some((m) => m.notes) && (
                  <div className="mt-2 text-[11px] text-black bg-white px-2 py-1 rounded-lg border border-[#800000]">
                    ⚠️ <strong className="text-[#800000]">Note:</strong> {guest.partyMembers.map((m) => m.notes).filter(Boolean).join(', ')}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2.5 border-t border-black/10 text-xs">
                {/* Left quick actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenWhatsAppModal(guest)}
                    className="p-1.5 text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white rounded-lg transition-colors flex items-center gap-1"
                    title="Send WhatsApp message / absence reminder"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(guest)}
                    className="p-1.5 text-black hover:text-[#800000] hover:bg-black/5 rounded-lg transition-colors flex items-center gap-1"
                    title="Copy unique RSVP link"
                  >
                    {copiedGuestId === guest.id ? (
                      <Check className="w-3.5 h-3.5 text-[#800000]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px]">
                      {copiedGuestId === guest.id ? 'Copied' : 'RSVP Link'}
                    </span>
                  </button>
                </div>

                {/* Right actions: preview as guest & edit & delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onOpenGuestRSVP(guest)}
                    className="p-1.5 text-black hover:text-[#800000] hover:bg-black/5 rounded-lg transition-colors"
                    title="Open as Guest (Plan Update Portal)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditGuest(guest)}
                    className="p-1.5 text-black hover:text-[#800000] hover:bg-black/5 rounded-lg transition-colors"
                    title="Edit Guest Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Remove ${guest.name} from wedding list?`)) {
                        onDeleteGuest(guest.id);
                      }
                    }}
                    className="p-1.5 text-black/40 hover:text-[#800000] hover:bg-black/5 rounded-lg transition-colors"
                    title="Delete Guest"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredGuests.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-black/20 p-6 space-y-2">
            <Users className="w-8 h-8 text-black/30 mx-auto" />
            <p className="text-sm font-semibold text-black">No wedding guests match filters</p>
            <p className="text-xs text-black/60">
              Try clearing your search query or reset status and dietary filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
