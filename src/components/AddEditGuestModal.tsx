import React, { useState } from 'react';
import {
  Guest,
  GuestSide,
  RSVPStatus,
  ArrivalTimeSlot,
  DietaryChoice,
  ArrivalScheduleSlot,
  DEFAULT_ARRIVAL_SCHEDULE,
} from '../types/wedding';
import { X, UserPlus, Save, Utensils, Clock, Phone, MapPin } from 'lucide-react';

interface AddEditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guest: Guest) => void;
  guestToEdit?: Guest | null;
  arrivalSchedule?: ArrivalScheduleSlot[];
}

export const AddEditGuestModal: React.FC<AddEditGuestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  guestToEdit,
  arrivalSchedule = DEFAULT_ARRIVAL_SCHEDULE,
}) => {
  if (!isOpen) return null;

  const isEditing = !!guestToEdit;

  const [name, setName] = useState(guestToEdit?.name || '');
  const [phone, setPhone] = useState(guestToEdit?.phone || '');
  const [email, setEmail] = useState(guestToEdit?.email || '');
  const [side, setSide] = useState<GuestSide>(guestToEdit?.side || 'mutual');
  const [table, setTable] = useState(guestToEdit?.table || '');
  const [relation, setRelation] = useState(guestToEdit?.relation || '');
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(guestToEdit?.rsvpStatus || 'pending');
  const [partySize, setPartySize] = useState<number>(guestToEdit?.partySize || 1);
  const schedule = arrivalSchedule.length > 0 ? arrivalSchedule : DEFAULT_ARRIVAL_SCHEDULE;
  const [arrivalTime, setArrivalTime] = useState<ArrivalTimeSlot>(
    guestToEdit?.arrivalTime || schedule[0]?.id || 'ceremony'
  );
  const [estimatedArrivalHour, setEstimatedArrivalHour] = useState(guestToEdit?.estimatedArrivalHour || '');
  const [absenceReason, setAbsenceReason] = useState(guestToEdit?.absenceReason || '');
  const [notes, setNotes] = useState(guestToEdit?.notes || '');
  
  // Party members dietary configuration
  const [partyMembers, setPartyMembers] = useState<{ name: string; dietary: DietaryChoice; notes?: string }[]>(
    guestToEdit?.partyMembers?.length
      ? guestToEdit.partyMembers
      : [
          {
            name: guestToEdit?.name || 'Guest 1',
            dietary: 'non-veg',
            notes: '',
          },
        ]
  );

  const handlePartySizeChange = (newSize: number) => {
    const size = Math.max(1, Math.min(10, newSize));
    setPartySize(size);
    const updated = [...partyMembers];
    while (updated.length < size) {
      updated.push({
        name: `Guest ${updated.length + 1}`,
        dietary: 'non-veg',
        notes: '',
      });
    }
    setPartyMembers(updated.slice(0, size));
  };

  const updateMemberDietary = (index: number, dietary: DietaryChoice) => {
    const updated = [...partyMembers];
    updated[index].dietary = dietary;
    setPartyMembers(updated);
  };

  const updateMemberName = (index: number, memberName: string) => {
    const updated = [...partyMembers];
    updated[index].name = memberName;
    setPartyMembers(updated);
  };

  const updateMemberNotes = (index: number, note: string) => {
    const updated = [...partyMembers];
    updated[index].notes = note;
    setPartyMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const token = guestToEdit?.inviteToken || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const id = guestToEdit?.id || `g-${Date.now()}`;

    // Ensure member 0 matches primary name if not explicitly changed
    const finalMembers = partyMembers.map((m, idx) => {
      if (idx === 0 && (!m.name || m.name.startsWith('Guest'))) {
        return { ...m, name };
      }
      return m;
    });

    const updatedGuest: Guest = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      side,
      table: table.trim() || undefined,
      relation: relation.trim() || 'Friend',
      rsvpStatus,
      partySize,
      partyMembers: rsvpStatus === 'attending' ? finalMembers : [],
      arrivalTime: rsvpStatus === 'attending' ? arrivalTime : 'not-attending',
      estimatedArrivalHour: rsvpStatus === 'attending' ? estimatedArrivalHour : undefined,
      absenceReason: rsvpStatus === 'declined' ? absenceReason : undefined,
      lastUpdated: new Date().toISOString(),
      remindersSent: guestToEdit?.remindersSent || 0,
      lastReminderDate: guestToEdit?.lastReminderDate,
      inviteToken: token,
      notes: notes.trim(),
    };

    onSave(updatedGuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-xl border-2 border-black/20 overflow-hidden text-black">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white text-[#800000] border-2 border-[#800000] flex items-center justify-center">
              {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-serif-wedding font-semibold text-black">
                {isEditing ? 'Edit Wedding Guest' : 'Add New Guest'}
              </h2>
              <p className="text-xs text-black/60">Manage RSVP, dietary choices & arrival times</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black/40 hover:text-black rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white">
          {/* Guest Name & Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Guest / Family Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Guest or family name"
                className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Wedding Side
              </label>
              <select
                value={side}
                onChange={(e) => setSide(e.target.value as GuestSide)}
                className="w-full px-3 py-2 text-sm text-black border border-black/20 rounded-lg focus:outline-none focus:border-[#800000] bg-white font-medium"
              >
                <option value="bride">Bride's Side</option>
                <option value="groom">Groom's Side</option>
                <option value="mutual">Mutual Friends</option>
                <option value="family">Family</option>
                <option value="vip">Wedding Party / VIP</option>
              </select>
            </div>
          </div>

          {/* Phone & Relation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#800000]" /> WhatsApp / Mobile Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Relationship"
                className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
              />
            </div>
          </div>

          {/* RSVP Status & Party Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-black/20">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                RSVP Response Status
              </label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RSVPStatus)}
                className="w-full px-3 py-2 text-sm text-black border border-black/20 rounded-lg focus:outline-none focus:border-[#800000] bg-white font-semibold"
              >
                <option value="attending">Joyfully Attending (Yes)</option>
                <option value="declined">Regretfully Declined (No)</option>
                <option value="pending">Pending (Awaiting RSVP)</option>
                <option value="uncertain">Uncertain / Tentative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Party Size (People)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={partySize}
                onChange={(e) => handlePartySizeChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm text-black border border-black/20 rounded-lg focus:outline-none focus:border-[#800000] bg-white"
              />
            </div>
          </div>

          {/* If Attending: Detailed Meal & Arrival info */}
          {rsvpStatus === 'attending' && (
            <div className="space-y-3 p-3.5 bg-white rounded-xl border-2 border-[#800000]">
              <div className="flex items-center gap-2 text-black text-sm font-bold">
                <Utensils className="w-4 h-4 text-[#800000]" />
                <span>Meal Preferences ({partySize} Person{partySize > 1 ? 's' : ''})</span>
              </div>

              {partyMembers.map((member, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-black/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMemberName(idx, e.target.value)}
                      placeholder={`Person ${idx + 1} Name`}
                      className="flex-1 px-2.5 py-1.5 text-xs text-black border border-black/20 rounded-md bg-white focus:outline-none focus:border-[#800000]"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateMemberDietary(idx, 'veg')}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                          member.dietary === 'veg'
                            ? 'bg-[#800000] text-white border border-[#800000]'
                            : 'bg-white text-black border border-black/20 hover:border-black'
                        }`}
                      >
                        🌱 Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => updateMemberDietary(idx, 'non-veg')}
                        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${
                          member.dietary === 'non-veg'
                            ? 'bg-black text-white border border-black'
                            : 'bg-white text-black border border-black/20 hover:border-black'
                        }`}
                      >
                        🥩 Non-Veg
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={member.notes || ''}
                    onChange={(e) => updateMemberNotes(idx, e.target.value)}
                    placeholder="Dietary requirements or allergies"
                    className="w-full px-2.5 py-1 text-[11px] text-black bg-white border border-black/20 rounded-md focus:outline-none focus:border-[#800000]"
                  />
                </div>
              ))}

              {/* Arrival time */}
              <div className="pt-2 border-t border-black/10">
                <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#800000]" /> Planned Arrival Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={arrivalTime}
                    onChange={(e) => {
                      const val = e.target.value as ArrivalTimeSlot;
                      setArrivalTime(val);
                      const found = schedule.find((s) => s.id === val);
                      if (found && !estimatedArrivalHour) {
                        setEstimatedArrivalHour(found.time);
                      }
                    }}
                    className="px-2.5 py-1.5 text-xs border border-black/20 rounded-lg bg-white text-black font-medium"
                  >
                    {schedule.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.title} ({slot.time})
                      </option>
                    ))}
                    <option value="not-attending">Not Attending</option>
                  </select>
                  <input
                    type="text"
                    value={estimatedArrivalHour}
                    onChange={(e) => setEstimatedArrivalHour(e.target.value)}
                    placeholder="Arrival time"
                    className="px-2.5 py-1.5 text-xs border border-black/20 rounded-lg bg-white text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Declined: Reason for absence */}
          {rsvpStatus === 'declined' && (
            <div className="p-3 bg-white rounded-xl border-2 border-black/20 space-y-2">
              <label className="block text-xs font-semibold text-black">
                Absence Reason / Note
              </label>
              <input
                type="text"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                placeholder="Reason for absence"
                className="w-full px-3 py-2 text-xs border border-black/20 rounded-lg bg-white text-black focus:border-[#800000]"
              />
            </div>
          )}

          {/* Table / Seating assignment */}
          <div>
            <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#800000]" /> Table Assignment (Optional)
            </label>
            <input
              type="text"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="Table number or name"
              className="w-full px-3 py-2 text-sm border border-black/20 rounded-lg bg-white text-black focus:outline-none focus:border-[#800000]"
            />
          </div>

          {/* Private Host Notes */}
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Private Host Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes for host"
              className="w-full px-3 py-2 text-xs border border-black/20 rounded-lg bg-white text-black focus:outline-none focus:border-[#800000]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-black hover:bg-black/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#800000] hover:bg-[#660000] rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
