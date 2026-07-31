import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Calendar, Clock, Coffee, Loader2 } from "lucide-react";

// Consultation windows: Mon–Fri, 9 AM – 6 PM, with a 1–3 PM break.
// Each slot is a 1-hour consultation starting at the given hour (24h, local time).
const MORNING_SLOTS = [
  { hour: 9, label: "9:00 AM" },
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
];
const AFTERNOON_SLOTS = [
  { hour: 15, label: "3:00 PM" },
  { hour: 16, label: "4:00 PM" },
  { hour: 17, label: "5:00 PM" },
];
const ALL_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Monday of the week at `offset` weeks from the current week.
function getWeekStart(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  monday.setDate(monday.getDate() + offset * 7);
  return monday;
}

function getBusinessDays(weekStart) {
  return DAY_LABELS.map((label, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return { label, date };
  });
}

function slotToTime(date, hour) {
  const dt = new Date(date);
  dt.setHours(hour, 0, 0, 0);
  return dt;
}

export default function SchedulePicker({ value, onChange }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookedTimes, setBookedTimes] = useState(new Set());
  const [loadingSlots, setLoadingSlots] = useState(true);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const days = useMemo(() => getBusinessDays(weekStart), [weekStart]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzShort = new Date().toLocaleTimeString(undefined, { timeZoneName: "short" }).split(" ").pop();

  // Fetch existing consultations to mark booked slots.
  useEffect(() => {
    setLoadingSlots(true);
    base44.entities.SovereignConsultation
      .list("-created_date", 100)
      .then((all) => {
        const booked = new Set();
        (all || [])
          .filter((c) => c.status === "scheduled" || c.status === "requested")
          .forEach((c) => {
            if (c.start) booked.add(new Date(c.start).getTime());
          });
        setBookedTimes(booked);
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [weekOffset]);

  const isDayPast = (date) => date < today;
  const isToday = (date) => date.getTime() === today.getTime();

  const isSlotBooked = (date, hour) => {
    const ts = slotToTime(date, hour).getTime();
    return bookedTimes.has(ts);
  };

  const isSlotPast = (date, hour) => {
    return slotToTime(date, hour) <= now;
  };

  const handleSelectSlot = (date, hour) => {
    const dt = slotToTime(date, hour);
    onChange(dt.toISOString());
  };

  const selectedDateObj = value ? new Date(value) : null;
  const isDaySelected = (date) =>
    selectedDateObj && selectedDateObj.toDateString() === date.toDateString();
  const isSlotSelected = (date, hour) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.toDateString() === date.toDateString() &&
      selectedDateObj.getHours() === hour
    );
  };

  const availableDays = days.filter((d) => !isDayPast(d.date));
  // Auto-select first available day when the week changes
  useEffect(() => {
    if (availableDays.length > 0 && (!selectedDay || isDayPast(selectedDay))) {
      setSelectedDay(availableDays[0].date);
    }
  }, [weekOffset]);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4);
  const rangeLabel = `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#C8A95B] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-[#c9d1d9] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#C8A95B]" /> {rangeLabel}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-1.5 rounded-lg border border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-[#C8A95B] transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day selector — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map(({ label, date }) => {
          const past = isDayPast(date);
          const selected = isDaySelected(date);
          const todayFlag = isToday(date);
          return (
            <button
              key={label + date.toISOString()}
              type="button"
              disabled={past}
              onClick={() => setSelectedDay(new Date(date))}
              className={`flex-shrink-0 w-16 sm:w-[4.5rem] rounded-xl border p-2 text-center transition-all ${
                selected
                  ? "border-[#C8A95B]/60 bg-[#C8A95B]/15 text-[#C8A95B]"
                  : past
                  ? "border-[#30363d]/50 bg-transparent text-[#484f58] cursor-not-allowed opacity-40"
                  : "border-[#30363d] bg-[#010409] text-[#8b949e] hover:border-[#C8A95B]/30 hover:text-[#c9d1d9]"
              }`}
            >
              <div className="text-[10px] font-mono uppercase">{label}</div>
              <div className="text-lg font-bold leading-tight">{date.getDate()}</div>
              <div className="text-[9px] font-mono opacity-60">{date.toLocaleDateString(undefined, { month: "short" })}</div>
              {todayFlag && <div className="text-[8px] font-mono text-cyan-400 mt-0.5">TODAY</div>}
            </button>
          );
        })}
      </div>

      {/* Time slots for selected day */}
      {selectedDay ? (
        loadingSlots ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 text-[#C8A95B] animate-spin" />
            <span className="ml-2 text-xs text-[#8b949e] font-mono">Loading availability…</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Morning */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#484f58] mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Morning
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MORNING_SLOTS.map((slot) => {
                  const booked = isSlotBooked(selectedDay, slot.hour);
                  const past = isSlotPast(selectedDay, slot.hour);
                  const selected = isSlotSelected(selectedDay, slot.hour);
                  const disabled = booked || past;
                  return (
                    <button
                      key={slot.hour}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectSlot(selectedDay, slot.hour)}
                      className={`rounded-lg border py-2.5 text-xs font-mono transition-all ${
                        selected
                          ? "border-[#C8A95B] bg-[#C8A95B] text-[#0A0A0C] font-bold shadow-md shadow-[#C8A95B]/20"
                          : disabled
                          ? "border-[#30363d]/40 bg-transparent text-[#484f58] cursor-not-allowed line-through opacity-50"
                          : "border-[#30363d] bg-[#010409] text-[#c9d1d9] hover:border-[#C8A95B]/50 hover:text-[#C8A95B]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Break indicator */}
            <div className="flex items-center gap-2 py-1">
              <div className="flex-1 h-px bg-[#30363d]" />
              <span className="text-[9px] font-mono text-[#484f58] flex items-center gap-1">
                <Coffee className="w-3 h-3" /> 1–3 PM Break
              </span>
              <div className="flex-1 h-px bg-[#30363d]" />
            </div>

            {/* Afternoon */}
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#484f58] mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Afternoon
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AFTERNOON_SLOTS.map((slot) => {
                  const booked = isSlotBooked(selectedDay, slot.hour);
                  const past = isSlotPast(selectedDay, slot.hour);
                  const selected = isSlotSelected(selectedDay, slot.hour);
                  const disabled = booked || past;
                  return (
                    <button
                      key={slot.hour}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectSlot(selectedDay, slot.hour)}
                      className={`rounded-lg border py-2.5 text-xs font-mono transition-all ${
                        selected
                          ? "border-[#C8A95B] bg-[#C8A95B] text-[#0A0A0C] font-bold shadow-md shadow-[#C8A95B]/20"
                          : disabled
                          ? "border-[#30363d]/40 bg-transparent text-[#484f58] cursor-not-allowed line-through opacity-50"
                          : "border-[#30363d] bg-[#010409] text-[#c9d1d9] hover:border-[#C8A95B]/50 hover:text-[#C8A95B]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <p className="text-center text-xs text-[#484f58] font-mono py-4">Select a day to view available times.</p>
      )}

      {/* Selection summary */}
      {value && (
        <div className="rounded-lg border border-[#C8A95B]/30 bg-[#C8A95B]/5 p-3 text-center">
          <p className="text-xs font-mono text-[#C8A95B] flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(value).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            {" at "}
            {new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            {" "}
            <span className="text-[#484f58]">({tzShort})</span>
          </p>
        </div>
      )}

      {/* Hours note */}
      <p className="text-center text-[10px] font-mono text-[#484f58]">
        Consultation hours: Mon–Fri, 9 AM – 6 PM · Break 1–3 PM · All times in {tzShort}
      </p>
    </div>
  );
}