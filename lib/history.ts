import {
  HistoryActivity,
  HistoryActivityType,
  HistoryTimeRange,
  MaintenanceRecord,
  OdometerEntry,
  Vehicle,
  WeeklyChecklistEntry,
} from './types';

/**
 * Builds a unified, chronological list of operational activities
 * from maintenance records, odometer logs, and checklist entries.
 */
export function buildHistoryActivities(
  vehicles: Vehicle[],
  maintenanceRecords: MaintenanceRecord[],
  odometerHistory: OdometerEntry[],
  weeklyChecklistEntries: WeeklyChecklistEntry[]
): HistoryActivity[] {
  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach(v => vehicleMap.set(v.id, v));

  const activities: HistoryActivity[] = [];

  // 1. Maintenance Records (Ganti Oli & Tambah Oli)
  maintenanceRecords.forEach(m => {
    const v = vehicleMap.get(m.vehicleId);
    activities.push({
      id: `m-${m.id}`,
      type: m.type,
      title: m.type === 'GANTI_OLI' ? 'Ganti Oli Berkala' : 'Penambahan Oli Mesin (Top-Up)',
      timestamp: m.date,
      vehicleId: m.vehicleId,
      vehicleName: v ? v.name : 'Kendaraan Tidak Dikenal',
      plate: v ? v.plate : '-',
      operator: m.operator,
      km: m.km,
      oilType: m.oilType,
      oilVolumeLiters: m.oilVolumeLiters,
      notes: m.notes,
    });
  });

  // 2. Odometer History
  // Sort odometer entries by vehicle and date to compute delta KM
  const sortedOdo = [...odometerHistory].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  const lastKmByVehicle = new Map<string, number>();

  sortedOdo.forEach(o => {
    const v = vehicleMap.get(o.vehicleId);
    const prevKm = lastKmByVehicle.get(o.vehicleId);
    const deltaKm = prevKm !== undefined ? o.km - prevKm : undefined;
    lastKmByVehicle.set(o.vehicleId, o.km);

    activities.push({
      id: `o-${o.id}`,
      type: 'ODOMETER',
      title: 'Update Odometer Kendaraan',
      timestamp: o.recordedAt,
      vehicleId: o.vehicleId,
      vehicleName: v ? v.name : 'Kendaraan Tidak Dikenal',
      plate: v ? v.plate : '-',
      operator: o.operator,
      km: o.km,
      deltaKm: deltaKm !== undefined ? Math.max(0, deltaKm) : undefined,
      notes: deltaKm !== undefined ? `Pemakaian bertambah +${deltaKm.toLocaleString('id-ID')} KM` : 'Pencatatan awal odometer',
    });
  });

  // 3. Weekly Checklist Entries
  weeklyChecklistEntries.forEach(w => {
    const v = vehicleMap.get(w.vehicleId);
    activities.push({
      id: `w-${w.id}`,
      type: 'CHECKLIST',
      title: `Inspeksi Fisik Mingguan (${w.day})`,
      timestamp: w.completedAt,
      vehicleId: w.vehicleId,
      vehicleName: v ? v.name : 'Kendaraan Tidak Dikenal',
      plate: v ? v.plate : '-',
      operator: w.operator,
      checklistDay: w.day,
      notes: `Checklist kelayakan operasional hari ${w.day} berhasil diselesaikan.`,
    });
  });

  // Sort descending by timestamp (newest first)
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export interface FilterOptions {
  timeRange: HistoryTimeRange;
  vehicleId?: string;
  activityType?: string;
  searchQuery?: string;
  referenceDate?: Date;
}

/**
 * Filter activities by time range (Today, Week, Month, All), vehicle, type, and keyword.
 */
export function filterActivities(
  activities: HistoryActivity[],
  options: FilterOptions
): HistoryActivity[] {
  const {
    timeRange,
    vehicleId = 'ALL',
    activityType = 'ALL',
    searchQuery = '',
    referenceDate = new Date(),
  } = options;

  const refTime = referenceDate.getTime();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;

  return activities.filter(item => {
    const itemDate = new Date(item.timestamp);
    const itemTime = itemDate.getTime();
    const diff = refTime - itemTime;

    // Time filter
    if (timeRange === 'TODAY') {
      // Same calendar day or within 24h
      const sameDay =
        itemDate.getFullYear() === referenceDate.getFullYear() &&
        itemDate.getMonth() === referenceDate.getMonth() &&
        itemDate.getDate() === referenceDate.getDate();
      if (!sameDay && (diff < 0 || diff > ONE_DAY)) {
        return false;
      }
    } else if (timeRange === 'WEEK') {
      // Within last 7 days
      if (diff < -ONE_DAY || diff > ONE_WEEK) {
        return false;
      }
    } else if (timeRange === 'MONTH') {
      // Within last 30 days
      if (diff < -ONE_DAY || diff > ONE_MONTH) {
        return false;
      }
    }
    // 'ALL' has no time filter

    // Vehicle filter
    if (vehicleId !== 'ALL' && item.vehicleId !== vehicleId) {
      return false;
    }

    // Activity Type filter
    if (activityType !== 'ALL' && item.type !== activityType) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const searchable = [
        item.title,
        item.vehicleName,
        item.plate,
        item.operator,
        item.oilType || '',
        item.notes || '',
        item.km ? `${item.km}` : '',
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    return true;
  });
}
