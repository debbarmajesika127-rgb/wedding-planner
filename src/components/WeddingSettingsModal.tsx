import React, { useState, useEffect } from 'react';
import { WeddingDetails, ArrivalScheduleSlot, DEFAULT_ARRIVAL_SCHEDULE } from '../types/wedding';
import {
  X,
  Settings,
  Save,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Utensils,
  Percent,
} from 'lucide-react';

interface WeddingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wedding: WeddingDetails;
  onSave: (updatedWedding: WeddingDetails) => void;
  initialTab?: 'details' | 'schedule' | 'catering';
}

export const WeddingSettingsModal: React.FC<WeddingSettingsModalProps> = ({
  isOpen,
  onClose,
  wedding,
  onSave,
  initialTab = 'details',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'catering'>(initialTab);

  // Couple & venue state
  const [brideName, setBrideName] = useState(wedding.brideName || '');
  const [groomName, setGroomName] = useState(wedding.groomName || '');
  const [date, setDate] = useState(wedding.date || '');
  const [time, setTime] = useState(wedding.time || '');
  const [venueName, setVenueName] = useState(wedding.venueName || '');
  const [venueAddress, setVenueAddress] = useState(wedding.venueAddress || '');
  const [rsvpDeadline, setRsvpDeadline] = useState(wedding.rsvpDeadline || '');
  const [coupleContactPhone, setCoupleContactPhone] = useState(wedding.coupleContactPhone || '');
  const [storySnippet, setStorySnippet] = useState(wedding.storySnippet || '');

  // Arrival Schedule state
  const [schedule, setSchedule] = useState<ArrivalScheduleSlot[]>(() => {
    return wedding.arrivalSchedule && wedding.arrivalSchedule.length > 0
      ? wedding.arrivalSchedule
      : DEFAULT_ARRIVAL_SCHEDULE;
  });

  // Catering state
  const [catererName, setCatererName] = useState(wedding.cateringDetails?.catererName || '');
  const [catererPhone, setCatererPhone] = useState(wedding.cateringDetails?.catererPhone || '');
  const [headcountDueDate, setHeadcountDueDate] = useState(wedding.cateringDetails?.headcountDueDate || '');
  const [vegBufferPercent, setVegBufferPercent] = useState<number>(wedding.cateringDetails?.vegBufferPercent ?? 10);
  const [nonVegBufferPercent, setNonVegBufferPercent] = useState<number>(wedding.cateringDetails?.nonVegBufferPercent ?? 8);
  const [menuHighlights, setMenuHighlights] = useState(wedding.cateringDetails?.menuHighlights || '');
  const [kitchenNotes, setKitchenNotes] = useState(wedding.cateringDetails?.kitchenNotes || '');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (wedding.arrivalSchedule && wedding.arrivalSchedule.length > 0) {
      setSchedule(wedding.arrivalSchedule);
    }
  }, [wedding.arrivalSchedule]);

  const handleUpdateSlot = (index: number, field: keyof ArrivalScheduleSlot, value: string) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSlot = () => {
    const newSlot: ArrivalScheduleSlot = {
      id: `slot-${Date.now()}`,
      title: '',
      time: '',
      description: '',
    };
    setSchedule((prev) => [...prev, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetSchedule = () => {
    setSchedule(DEFAULT_ARRIVAL_SCHEDULE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validSchedule = schedule.filter(
      (s) => s.title.trim().length > 0 || s.time.trim().length > 0
    );

    onSave({
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      date: date.trim(),
      time: time.trim(),
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      rsvpDeadline: rsvpDeadline.trim(),
      coupleContactPhone: coupleContactPhone.trim(),
      storySnippet: storySnippet.trim(),
      arrivalSchedule: validSchedule.length > 0 ? validSchedule : DEFAULT_ARRIVAL_SCHEDULE,
      cateringDetails: {
        catererName: catererName.trim(),
        catererPhone: catererPhone.trim(),
        headcountDueDate: headcountDueDate.trim(),
        vegBufferPercent: Math.max(0, Math.min(50, Number(vegBufferPercent) || 0)),
        nonVegBufferPercent: Math.max(0, Math.min(50, Number(nonVegBufferPercent) || 0)),
        menuHighlights: menuHighlights.trim(),
        kitchenNotes: kitchenNotes.trim(),
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white rounded-2xl shadow-xl border-2 border-black/20 overflow-hidden text-black">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-[#800000] border-2 border-[#800000] flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#800000]" />
            </div>
            <div>
              <h2 className="text-lg font-serif-wedding font-bold text-black">
                Wedding, Schedule & Catering Settings
              </h2>
              <p className="text-xs text-black/60">
                Configure couple info, arrival schedule, and catering logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-black/40 hover:text-black rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-black/10 px-6 pt-2 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-[#800000] text-[#800000]'
                : 'border-transparent text-black/60 hover:text-black'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Couple & Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-[#800000] text-[#800000]'
                : 'border-transparent text-black/60 hover:text-black'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Arrival Schedule
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#800000] text-white font-bold">
              {schedule.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catering')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catering'
                ? 'border-[#800000] text-[#800000]'
                : 'border-transparent text-black/60 hover:text-black'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> Catering & Kitchen
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto bg-white">
          {activeTab === 'details' && (
            <>
              {/* Couple Names */}
              <div className="p-3.5 bg-white rounded-xl border border-black/20 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#800000]">
                  <Heart className="w-3.5 h-3.5 fill-[#800000]" /> Bride & Groom Names
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      Bride's Name
                    </label>
                    <input
                      type="text"
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      placeholder="Bride's name"
                      className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      Groom's Name
                    </label>
                    <input
                      type="text"
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      placeholder="Groom's name"
                      className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Main Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#800000]" /> Wedding Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Wedding date"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#800000]" /> General Start Time
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Ceremony or start time"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>

              {/* Venue & Address */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#800000]" /> Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Venue name"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Venue Address & City
                  </label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="Venue address and city"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>

              {/* RSVP Deadline & Couple WhatsApp Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    RSVP Deadline Date
                  </label>
                  <input
                    type="text"
                    value={rsvpDeadline}
                    onChange={(e) => setRsvpDeadline(e.target.value)}
                    placeholder="RSVP deadline"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#800000]" /> Couple WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={coupleContactPhone}
                    onChange={(e) => setCoupleContactPhone(e.target.value)}
                    placeholder="WhatsApp number"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>

              {/* Welcome Story / Invitation Note */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-[#800000]" /> Welcome / Invitation Message
                </label>
                <textarea
                  rows={2}
                  value={storySnippet}
                  onChange={(e) => setStorySnippet(e.target.value)}
                  placeholder="A short note to your guests..."
                  className="w-full px-3 py-2 text-xs text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                />
              </div>
            </>
          )}

          {activeTab === 'schedule' && (
            /* Arrival Schedule Tab */
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-xl border border-black/20 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#800000] shrink-0 mt-0.5" />
                <div className="text-xs text-black">
                  <p className="font-semibold text-black">Arrival Schedule Timeline</p>
                  <p className="text-[11px] text-black/70 mt-0.5">
                    Set the schedule milestones of your wedding day. Guests will see this timeline on their invitation and select when they plan to arrive.
                  </p>
                </div>
              </div>

              {/* Schedule Items List */}
              <div className="space-y-3">
                {schedule.map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className="p-3.5 bg-white rounded-xl border border-black/20 shadow-2xs space-y-2 relative group hover:border-[#800000] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#800000]" />
                        Milestone {idx + 1}
                      </span>
                      {schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(idx)}
                          className="p-1 text-black/40 hover:text-[#800000] rounded-md transition-colors"
                          title="Remove milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-black/70 mb-0.5">
                          Time *
                        </label>
                        <input
                          type="text"
                          required
                          value={slot.time}
                          onChange={(e) => handleUpdateSlot(idx, 'time', e.target.value)}
                          placeholder="Time"
                          className="w-full px-2.5 py-1.5 text-xs font-semibold text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                        />
                      </div>

                      <div className="sm:col-span-8">
                        <label className="block text-[10px] font-semibold text-black/70 mb-0.5">
                          Event / Milestone Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={slot.title}
                          onChange={(e) => handleUpdateSlot(idx, 'title', e.target.value)}
                          placeholder="Milestone name"
                          className="w-full px-2.5 py-1.5 text-xs font-semibold text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-black/70 mb-0.5">
                        Details / Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={slot.description || ''}
                        onChange={(e) => handleUpdateSlot(idx, 'description', e.target.value)}
                        placeholder="Optional description or location"
                        className="w-full px-2.5 py-1 text-xs text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="px-3 py-1.5 bg-white border border-[#800000] text-[#800000] hover:bg-[#800000] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>

                <button
                  type="button"
                  onClick={handleResetSchedule}
                  className="px-3 py-1.5 text-xs text-black/60 hover:text-black border border-black/20 hover:border-black rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Standard Schedule
                </button>
              </div>
            </div>
          )}

          {activeTab === 'catering' && (
            /* Catering & Kitchen Settings Tab */
            <div className="space-y-4">
              <div className="p-3 bg-white rounded-xl border border-black/20 flex items-start gap-2.5">
                <Utensils className="w-4 h-4 text-[#800000] shrink-0 mt-0.5" />
                <div className="text-xs text-black">
                  <p className="font-semibold text-black">Catering & Kitchen Logistics</p>
                  <p className="text-[11px] text-black/70 mt-0.5">
                    Configure your caterer contacts, buffer safety margins for extra guests, course details, and instructions for banquet staff.
                  </p>
                </div>
              </div>

              {/* Caterer Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Catering Company / Chef Name
                  </label>
                  <input
                    type="text"
                    value={catererName}
                    onChange={(e) => setCatererName(e.target.value)}
                    placeholder="Caterer or kitchen contact"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#800000]" /> Caterer Phone Number
                  </label>
                  <input
                    type="tel"
                    value={catererPhone}
                    onChange={(e) => setCatererPhone(e.target.value)}
                    placeholder="Caterer direct phone"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
              </div>

              {/* Headcount Cutoff & Buffers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white rounded-xl border border-black/20">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">
                    Final Headcount Due Date
                  </label>
                  <input
                    type="text"
                    value={headcountDueDate}
                    onChange={(e) => setHeadcountDueDate(e.target.value)}
                    placeholder="Headcount cutoff date"
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#800000]" /> Veg Buffer %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={vegBufferPercent}
                    onChange={(e) => setVegBufferPercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                  <span className="text-[10px] text-black/60">Standard: +10%</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-[#800000]" /> Non-Veg Buffer %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={nonVegBufferPercent}
                    onChange={(e) => setNonVegBufferPercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                  />
                  <span className="text-[10px] text-black/60">Standard: +8%</span>
                </div>
              </div>

              {/* Menu Highlights */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Menu Highlights & Meal Service Details
                </label>
                <textarea
                  rows={2}
                  value={menuHighlights}
                  onChange={(e) => setMenuHighlights(e.target.value)}
                  placeholder="Appetizers, main course selections, dessert service"
                  className="w-full px-3 py-2 text-xs text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                />
              </div>

              {/* Special Instructions for Kitchen Staff */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  Special Kitchen & Banquet Handover Instructions
                </label>
                <textarea
                  rows={2}
                  value={kitchenNotes}
                  onChange={(e) => setKitchenNotes(e.target.value)}
                  placeholder="Special instructions for banquet staff (dietary handling, service timing)"
                  className="w-full px-3 py-2 text-xs text-black bg-white border border-black/20 rounded-lg focus:outline-none focus:border-[#800000]"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
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
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
