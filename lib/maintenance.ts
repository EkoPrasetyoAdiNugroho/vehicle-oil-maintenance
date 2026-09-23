import { MaintenanceProjection, MaintenanceRecord, MaintenanceRule, OdometerEntry } from './types';

const DAY = 86_400_000;

function daysBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / DAY;
}

function addDays(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function rollingAverageKmPerDay(
  history: OdometerEntry[],
  currentKm?: number,
  lastMaintenance?: MaintenanceRecord,
  asOf: string = new Date().toISOString(),
  maxIntervals = 5
): number {
  const sorted = [...history].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  const valid: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const deltaKm = cur.km - prev.km;
    const deltaDays = daysBetween(prev.recordedAt, cur.recordedAt);
    // If entries are recorded at least ~30 minutes apart
    if (deltaKm > 0 && deltaDays >= 0.02) {
      const rate = deltaKm / deltaDays;
      if (rate >= 5 && rate <= 600) {
        valid.push(rate);
      }
    }
  }

  const sample = valid.slice(-maxIntervals);
  if (sample.length > 0) {
    return sample.reduce((a, b) => a + b, 0) / sample.length;
  }

  // Fallback 1: Calculate actual usage since last maintenance
  if (currentKm !== undefined && lastMaintenance) {
    const msSinceMaint = new Date(asOf).getTime() - new Date(lastMaintenance.date).getTime();
    const daysSinceMaint = Math.max(1, msSinceMaint / DAY);
    const kmSinceMaint = Math.max(0, currentKm - lastMaintenance.km);
    if (kmSinceMaint > 0) {
      const computed = kmSinceMaint / daysSinceMaint;
      return Math.max(15, Math.min(350, Math.round(computed * 10) / 10));
    }
  }

  // Fallback 2: Sensible baseline for airport ground fleet (35 KM/day)
  return 35;
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

  // Realtime usage average (KM/day) with smart fallback
  const averageKmPerDay = rollingAverageKmPerDay(odometerHistory, currentKm, lastMaintenance, asOf);

  // Realtime estimated days by KM
  let estimatedDaysByKm: number | null = null;
  if (remainingKm <= 0) {
    estimatedDaysByKm = 0;
  } else if (averageKmPerDay > 0) {
    estimatedDaysByKm = Math.ceil(remainingKm / averageKmPerDay);
  }
  const estimatedDateByKm = estimatedDaysByKm !== null ? addDays(asOf, estimatedDaysByKm) : null;

  // Determine trigger: which limit is reached first?
  let trigger: MaintenanceProjection['trigger'] = 'UNKNOWN';
  if (estimatedDaysByKm !== null) {
    trigger = estimatedDaysByKm <= remainingDays ? 'KM' : 'TIME';
  } else if (remainingDays >= 0) {
    trigger = 'TIME';
  }

  // Warning thresholds:
  // - KM: at least 15% of interval (e.g. 750 KM for 5000 KM interval) or rule.warningKm
  // - Days: rule.warningDays (e.g. 14 days)
  const warningKmThreshold = Math.max(rule.warningKm, Math.round(rule.intervalKm * 0.15));
  const warningDaysThreshold = Math.max(rule.warningDays, 14);

  let status: MaintenanceProjection['status'] = 'NORMAL';
  if (remainingKm <= 0 || remainingDays <= 0) {
    status = 'OVERDUE';
  } else if (
    remainingKm <= warningKmThreshold ||
    remainingDays <= warningDaysThreshold ||
    (estimatedDaysByKm !== null && estimatedDaysByKm <= warningDaysThreshold)
  ) {
    status = 'WARNING';
  }

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

export function buildWaAlertMessage(v: { name: string; plate: string; brand: string; model: string; year: number; currentKm: number; hullNumber?: string; category?: string }, p: MaintenanceProjection): string {
  const isOverdue = p.status === 'OVERDUE';
  const icon = isOverdue ? '🚨 [TERLAMBAT / BREAKDOWN]' : '⚠️ [PERINGATAN JADWAL SERVIS]';
  const statusLabel = isOverdue ? 'TERLAMBAT' : 'PERINGATAN';
  const sisaKm = p.remainingKm < 0
    ? `Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`
    : `${p.remainingKm.toLocaleString('id-ID')} KM`;
  const sisaWaktu = p.remainingDays < 0
    ? `Lewat ${Math.abs(p.remainingDays)} hari`
    : `${p.remainingDays} hari lagi`;

  const lines = [
    `${icon} *${statusLabel} GANTI OLI ARMADA*`,
    ``,
    `Unit: *${v.name}*`,
    v.hullNumber ? `No Lambung: *${v.hullNumber}*` : null,
    `Plat/Kode: ${v.plate}`,
    `Kategori: ${v.category || 'Alat-Alat Besar (A2B)'}`,
    `Merek/Model: ${v.brand} ${v.model} (${v.year})`,
    ``,
    `📊 *Kondisi Odometer & Target:*`,
    `• Odometer Saat Ini: ${v.currentKm.toLocaleString('id-ID')} KM`,
    `• Target Servis: ${p.targetKm.toLocaleString('id-ID')} KM`,
    `• Sisa Jarak: ${sisaKm}`,
    `• Sisa Waktu Kalender: ${sisaWaktu}`,
    `• Rata-rata Pemakaian: ${p.averageKmPerDay ? Math.round(p.averageKmPerDay) + ' KM/hari' : '-'}`,
    p.estimatedDaysByKm !== null ? `• Estimasi Waktu Servis: ~${p.estimatedDaysByKm} hari lagi` : null,
    ``,
    `Segera jadwalkan pemeliharaan oli unit ini untuk kelancaran operasional bandara.`
  ].filter(Boolean);

  return encodeURIComponent(lines.join('\n'));
}

export function getWaAlertUrl(v: { name: string; plate: string; brand: string; model: string; year: number; currentKm: number; hullNumber?: string; category?: string }, p: MaintenanceProjection): string {
  return `https://wa.me/?text=${buildWaAlertMessage(v, p)}`;
}
