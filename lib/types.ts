export type MaintenanceStatus = 'NORMAL' | 'WARNING' | 'OVERDUE';

export interface OdometerEntry {
  id: string;
  vehicleId: string;
  km: number;
  recordedAt: string;
  operator: string;
}

export interface MaintenanceRule {
  id: string;
  vehicleId: string;
  type: string;
  intervalKm: number;
  intervalDays: number;
  warningKm: number;
  warningDays: number;
  active: boolean;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  ruleId: string;
  type: 'GANTI_OLI' | 'TAMBAH_OLI';
  km: number;
  date: string;
  oilVolumeLiters?: number;
  oilType?: string;
  notes?: string;
  operator: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  currentKm: number;
  image?: string;
  category?: string;
  hullNumber?: string;
  a2bStatus?: 'READY' | 'MAINTENANCE' | 'BREAKDOWN';
}

export interface MaintenanceProjection {
  targetKm: number;
  targetDate: string;
  remainingKm: number;
  remainingDays: number;
  averageKmPerDay: number | null;
  estimatedDaysByKm: number | null;
  estimatedDateByKm: string | null;
  trigger: 'KM' | 'TIME' | 'UNKNOWN';
  status: MaintenanceStatus;
}

export type DayOfWeek = 'Sen' | 'Sel' | 'Rab' | 'Kam' | 'Jum' | 'Sab' | 'Min';

export interface WeeklyChecklistRule {
  id: string;
  vehicleId: string;
  name: string;
  days: DayOfWeek[];
  active: boolean;
}

export interface WeeklyChecklistEntry {
  id: string;
  ruleId: string;
  vehicleId: string;
  day: DayOfWeek;
  weekStart: string; // ISO date of the Monday of the week
  completedAt: string;
  operator: string;
}

export type RuleMode = 'BERKALA' | 'MINGGUAN';

export interface CustomRule {
  id: string;
  vehicleId: string;
  mode: RuleMode;
  name: string;
  intervalKm?: number;
  intervalDays?: number;
  days?: DayOfWeek[];
  active: boolean;
}

export type HistoryActivityType = 'GANTI_OLI' | 'TAMBAH_OLI' | 'ODOMETER' | 'CHECKLIST';
export type HistoryTimeRange = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

export interface HistoryActivity {
  id: string;
  type: HistoryActivityType;
  title: string;
  timestamp: string;
  vehicleId: string;
  vehicleName: string;
  plate: string;
  operator: string;
  km?: number;
  deltaKm?: number;
  oilType?: string;
  oilVolumeLiters?: number;
  notes?: string;
  checklistDay?: string;
}
