'use client';

import { useState } from 'react';
import { CalendarDays, Clock3, CheckCircle2, Wrench } from 'lucide-react';
import { DayOfWeek, WeeklyChecklistEntry, WeeklyChecklistRule } from '@/lib/types';

const ALL_DAYS: DayOfWeek[] = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_TO_INDEX: Record<DayOfWeek, number> = { Min: 0, Sen: 1, Sel: 2, Rab: 3, Kam: 4, Jum: 5, Sab: 6 };

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

function getTodayDayName(): DayOfWeek {
  const names: DayOfWeek[] = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return names[new Date().getDay()];
}

function getNextScheduledDay(days: DayOfWeek[], completedDays: DayOfWeek[]): { day: DayOfWeek; daysUntil: number } | null {
  const todayIdx = new Date().getDay();
  const remaining = days.filter(d => !completedDays.includes(d));
  if (!remaining.length) return null;

  let best: { day: DayOfWeek; daysUntil: number } | null = null;
  for (const d of remaining) {
    const targetIdx = DAY_TO_INDEX[d];
    let diff = targetIdx - todayIdx;
    if (diff < 0) diff += 7;
    if (diff === 0) diff = 0;
    if (!best || diff < best.daysUntil) best = { day: d, daysUntil: diff };
  }
  return best;
}

interface Props {
  rule: WeeklyChecklistRule;
  entries: WeeklyChecklistEntry[];
  onComplete: (day: DayOfWeek) => void;
}

export default function WeeklyChecklist({ rule, entries, onComplete }: Props) {
  const currentWeek = getWeekStart(new Date());
  const thisWeekEntries = entries.filter(e => e.weekStart === currentWeek);
  const completedDays = thisWeekEntries.map(e => e.day);
  const today = getTodayDayName();
  const next = getNextScheduledDay(rule.days, completedDays);
  const isTodayScheduled = rule.days.includes(today) && !completedDays.includes(today);

  return (
    <div className="checklistCard">
      <div className="checklistHeader">
        <div className="checklistIcon">
          <Wrench size={20} />
        </div>
        <div className="checklistTitleWrap">
          <h3>{rule.name}</h3>
          <div className="checklistMeta">
            <CalendarDays size={13} />
            <span className="checklistLabel">CHEKLIST</span>
            <span className="checklistBadgeWeekly"><Clock3 size={11} /> MINGGUAN</span>
          </div>
        </div>
        {next && (
          <span className="checklistCountdown">
            {next.daysUntil === 0 ? 'Hari ini' : `${next.daysUntil} hari lagi`}
          </span>
        )}
        {!next && <span className="checklistCountdownDone">Selesai ✓</span>}
      </div>

      <div className="dayPillsRow">
        {ALL_DAYS.map(d => {
          const isScheduled = rule.days.includes(d);
          const isDone = completedDays.includes(d);
          const isToday = d === today;
          let cls = 'dayPill';
          if (isDone) cls += ' done';
          else if (isToday && isScheduled) cls += ' today';
          else if (isScheduled) cls += ' scheduled';
          return (
            <div key={d} className={cls}>
              {isDone && <CheckCircle2 size={11} className="dayCheck" />}
              <span>{d}</span>
            </div>
          );
        })}
      </div>

      {next && (
        <div className="checklistNextInfo">
          <CalendarDays size={14} />
          <span>Jadwal berikutnya: <strong>{next.day}</strong></span>
        </div>
      )}

      {isTodayScheduled && (
        <button className="checklistCompleteBtn" onClick={() => onComplete(today)}>
          <CheckCircle2 size={17} />
          Catat Selesai
        </button>
      )}
      {!isTodayScheduled && next && next.daysUntil > 0 && (
        <div className="checklistWaiting">
          Jadwal berikutnya pada hari <strong>{next.day}</strong>
        </div>
      )}
      {!next && (
        <div className="checklistAllDone">
          Semua checklist minggu ini telah selesai 🎉
        </div>
      )}
    </div>
  );
}
