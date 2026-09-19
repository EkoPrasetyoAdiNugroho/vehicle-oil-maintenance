import { MaintenanceProjection, MaintenanceRecord, MaintenanceRule, OdometerEntry } from './types';

const DAY = 86_400_000;

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / DAY);
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function rollingAverageKmPerDay(history: OdometerEntry[], maxIntervals = 5): number | null {
  const sorted = [...history].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  const valid: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const deltaKm = cur.km - prev.km;
    const deltaDays = daysBetween(prev.recordedAt, cur.recordedAt);
    if (deltaKm >= 0 && deltaDays > 0) valid.push(deltaKm / deltaDays);
  }
  const sample = valid.slice(-maxIntervals);
  if (!sample.length) return null;
  return sample.reduce((a, b) => a + b, 0) / sample.length;
}

export function projectMaintenance(args: {
  currentKm: number;
  asOf: string;
  rule: MaintenanceRule;
  lastMaintenance: MaintenanceRecord;
  odometerHistory: OdometerEntry[];
}): MaintenanceProjection {
  const { currentKm, asOf, rule, lastMaintenance, odometerHistory } = args;
  const targetKm = lastMaintenance.km + rule.intervalKm;
  const targetDate = addDays(lastMaintenance.date, rule.intervalDays);
  const remainingKm = targetKm - currentKm;
  const remainingDays = Math.ceil((new Date(targetDate).getTime() - new Date(asOf).getTime()) / DAY);
  const averageKmPerDay = rollingAverageKmPerDay(odometerHistory);
  const estimatedDaysByKm = averageKmPerDay && averageKmPerDay > 0 ? Math.max(0, Math.ceil(remainingKm / averageKmPerDay)) : null;
  const estimatedDateByKm = estimatedDaysByKm !== null ? addDays(asOf, estimatedDaysByKm) : null;

  let status: MaintenanceProjection['status'] = 'NORMAL';
  if (remainingKm <= 0 || remainingDays <= 0) status = 'OVERDUE';
  else if (remainingKm <= rule.warningKm || remainingDays <= rule.warningDays) status = 'WARNING';

  let trigger: MaintenanceProjection['trigger'] = 'UNKNOWN';
  if (estimatedDaysByKm !== null) trigger = estimatedDaysByKm <= remainingDays ? 'KM' : 'TIME';
  else if (remainingDays >= 0) trigger = 'TIME';

  return {
    targetKm,
    targetDate,
    remainingKm,
    remainingDays,
    averageKmPerDay,
    estimatedDaysByKm,
    estimatedDateByKm,
    trigger,
    status,
  };
}
