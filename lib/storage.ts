import {
  Vehicle,
  MaintenanceRule,
  MaintenanceRecord,
  OdometerEntry,
  WeeklyChecklistRule,
  WeeklyChecklistEntry,
  CustomRule,
} from './types';
import {
  vehicles as seedVehicles,
  rules as seedRules,
  maintenanceRecords as seedMaintenance,
  odometerHistory as seedOdometer,
  weeklyChecklistRules as seedWeeklyChecklistRules,
  weeklyChecklistEntries as seedWeeklyChecklistEntries,
  customRules as seedCustomRules,
} from './demo-data';

const STORAGE_KEYS = {
  VEHICLES: 'a2b_vehicles',
  CATEGORIES: 'a2b_categories',
  RULES: 'a2b_rules',
  MAINTENANCE: 'a2b_maintenance',
  ODOMETER: 'a2b_odometer',
  CHECKLIST_RULES: 'a2b_checklist_rules',
  CHECKLIST_ENTRIES: 'a2b_checklists',
  CUSTOM_RULES: 'a2b_custom_rules',
} as const;

export const DEFAULT_CATEGORIES: string[] = [
  'Airside Ops',
  'Pushback Tug',
  'Baggage Towing',
  'Fire Truck PKP-PK',
  'GPU / Genset',
  'Garbarata / Ambulift',
];

const isBrowser = typeof window !== 'undefined';

function dispatchStorageEvent() {
  if (isBrowser) {
    window.dispatchEvent(new Event('a2b_storage_update'));
  }
}

// ==================== VEHICLES ====================

export function getStoredVehicles(): Vehicle[] {
  if (!isBrowser) return seedVehicles;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(seedVehicles));
      return seedVehicles;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedVehicles;
  } catch (e) {
    console.error('Error reading stored vehicles:', e);
    return seedVehicles;
  }
}

export function getVehicleById(id: string): Vehicle | undefined {
  const list = getStoredVehicles();
  return list.find(v => v.id === id);
}

export function saveVehicle(vehicle: Vehicle): Vehicle[] {
  if (!isBrowser) return [vehicle];
  try {
    const currentList = getStoredVehicles();
    const existingIndex = currentList.findIndex(v => v.id === vehicle.id);
    let updatedList: Vehicle[];

    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...vehicle };
    } else {
      // New vehicle: ensure rules, initial maintenance, and odometer exist
      updatedList = [vehicle, ...currentList];

      // Auto-create default rule if not existing
      const existingRules = getStoredRules();
      if (!existingRules.some(r => r.vehicleId === vehicle.id)) {
        const newRule: MaintenanceRule = {
          id: `rule-${vehicle.id}`,
          vehicleId: vehicle.id,
          type: 'GANTI OLI',
          intervalKm: 5000,
          intervalDays: 180,
          warningKm: 500,
          warningDays: 14,
          active: true,
        };
        saveRule(newRule);
      }

      // Auto-create initial baseline maintenance record if not existing
      const existingMaintenance = getStoredMaintenance();
      if (!existingMaintenance.some(m => m.vehicleId === vehicle.id && m.type === 'GANTI_OLI')) {
        const initMaint: MaintenanceRecord = {
          id: `init-m-${vehicle.id}`,
          vehicleId: vehicle.id,
          ruleId: `rule-${vehicle.id}`,
          type: 'GANTI_OLI',
          km: Math.max(0, vehicle.currentKm - 4000),
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          oilVolumeLiters: 7,
          oilType: 'Shell Rimula R4 15W-40',
          operator: 'Operator Lapangan',
          notes: 'Pencatatan awal sistem armada baru',
        };
        saveMaintenanceRecord(initMaint);
      }

      // Auto-create initial odometer entry
      const existingOdo = getStoredOdometer();
      if (!existingOdo.some(o => o.vehicleId === vehicle.id)) {
        const initOdo: OdometerEntry = {
          id: `init-odo-${vehicle.id}`,
          vehicleId: vehicle.id,
          km: vehicle.currentKm,
          recordedAt: new Date().toISOString(),
          operator: 'Operator Lapangan',
        };
        saveOdometerEntry(initOdo);
      }

      // Auto-create weekly checklist rule
      const existingChecklistRules = getStoredWeeklyChecklistRules();
      if (!existingChecklistRules.some(c => c.vehicleId === vehicle.id)) {
        const initChecklistRule: WeeklyChecklistRule = {
          id: `wc-${vehicle.id}`,
          vehicleId: vehicle.id,
          name: 'Perawatan Kendaraan',
          days: ['Sen', 'Kam'],
          active: true,
        };
        saveWeeklyChecklistRule(initChecklistRule);
      }
    }

    // Ensure category is in categories list
    if (vehicle.category) {
      addCategory(vehicle.category);
    }

    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedList));
    dispatchStorageEvent();
    return updatedList;
  } catch (e) {
    console.error('Error saving vehicle:', e);
    return getStoredVehicles();
  }
}

export function deleteVehicle(id: string): Vehicle[] {
  if (!isBrowser) return [];
  try {
    const currentList = getStoredVehicles();
    const updatedList = currentList.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updatedList));
    dispatchStorageEvent();
    return updatedList;
  } catch (e) {
    console.error('Error deleting vehicle:', e);
    return getStoredVehicles();
  }
}

// ==================== CATEGORIES ====================

export function getStoredCategories(): string[] {
  if (!isBrowser) return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Error reading stored categories:', e);
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(categoryName: string): string[] {
  const trimmed = categoryName.trim();
  if (!trimmed) return getStoredCategories();

  const current = getStoredCategories();
  const exists = current.some(c => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) return current;

  const updated = [...current, trimmed];
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    dispatchStorageEvent();
  }
  return updated;
}

export function deleteCategory(categoryName: string): string[] {
  const current = getStoredCategories();
  const updated = current.filter(c => c.toLowerCase() !== categoryName.toLowerCase());
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    dispatchStorageEvent();
  }
  return updated;
}

// ==================== RULES ====================

export function getStoredRules(vehicleId?: string): MaintenanceRule[] {
  if (!isBrowser) {
    return vehicleId ? seedRules.filter(r => r.vehicleId === vehicleId) : seedRules;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    let allRules: MaintenanceRule[] = seedRules;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) allRules = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(seedRules));
    }
    return vehicleId ? allRules.filter(r => r.vehicleId === vehicleId) : allRules;
  } catch (e) {
    console.error('Error reading rules:', e);
    return vehicleId ? seedRules.filter(r => r.vehicleId === vehicleId) : seedRules;
  }
}

export function saveRule(rule: MaintenanceRule): void {
  if (!isBrowser) return;
  try {
    const current = getStoredRules();
    const idx = current.findIndex(r => r.id === rule.id || r.vehicleId === rule.vehicleId);
    let updated: MaintenanceRule[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...updated[idx], ...rule };
    } else {
      updated = [...current, rule];
    }
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(updated));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving rule:', e);
  }
}

// ==================== MAINTENANCE RECORDS ====================

export function getStoredMaintenance(vehicleId?: string): MaintenanceRecord[] {
  if (!isBrowser) {
    const list = vehicleId ? seedMaintenance.filter(m => m.vehicleId === vehicleId) : seedMaintenance;
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    let all: MaintenanceRecord[] = seedMaintenance;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(seedMaintenance));
    }
    const filtered = vehicleId ? all.filter(m => m.vehicleId === vehicleId) : all;
    return [...filtered].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  } catch (e) {
    console.error('Error reading maintenance:', e);
    return vehicleId ? seedMaintenance.filter(m => m.vehicleId === vehicleId) : seedMaintenance;
  }
}

export function saveMaintenanceRecord(record: MaintenanceRecord): void {
  if (!isBrowser) return;
  try {
    const current = getStoredMaintenance();
    const updated = [record, ...current.filter(m => m.id !== record.id)];
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(updated));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving maintenance record:', e);
  }
}

// ==================== ODOMETER HISTORY ====================

export function getStoredOdometer(vehicleId?: string): OdometerEntry[] {
  if (!isBrowser) {
    return vehicleId ? seedOdometer.filter(o => o.vehicleId === vehicleId) : seedOdometer;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ODOMETER);
    let all: OdometerEntry[] = seedOdometer;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.ODOMETER, JSON.stringify(seedOdometer));
    }
    return vehicleId ? all.filter(o => o.vehicleId === vehicleId) : all;
  } catch (e) {
    console.error('Error reading odometer:', e);
    return vehicleId ? seedOdometer.filter(o => o.vehicleId === vehicleId) : seedOdometer;
  }
}

export function saveOdometerEntry(entry: OdometerEntry): void {
  if (!isBrowser) return;
  try {
    const current = getStoredOdometer();
    const updated = [...current.filter(o => o.id !== entry.id), entry];
    localStorage.setItem(STORAGE_KEYS.ODOMETER, JSON.stringify(updated));

    // Also update currentKm in vehicle if entry.km is higher
    const vehicles = getStoredVehicles();
    const targetVehicle = vehicles.find(v => v.id === entry.vehicleId);
    if (targetVehicle && entry.km > targetVehicle.currentKm) {
      targetVehicle.currentKm = entry.km;
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    }

    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving odometer entry:', e);
  }
}

// ==================== WEEKLY CHECKLIST ====================

export function getStoredWeeklyChecklistRules(vehicleId?: string): WeeklyChecklistRule[] {
  if (!isBrowser) {
    return vehicleId ? seedWeeklyChecklistRules.filter(r => r.vehicleId === vehicleId) : seedWeeklyChecklistRules;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_RULES);
    let all: WeeklyChecklistRule[] = seedWeeklyChecklistRules;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST_RULES, JSON.stringify(seedWeeklyChecklistRules));
    }
    return vehicleId ? all.filter(r => r.vehicleId === vehicleId) : all;
  } catch (e) {
    return vehicleId ? seedWeeklyChecklistRules.filter(r => r.vehicleId === vehicleId) : seedWeeklyChecklistRules;
  }
}

export function saveWeeklyChecklistRule(rule: WeeklyChecklistRule): void {
  if (!isBrowser) return;
  try {
    const current = getStoredWeeklyChecklistRules();
    const updated = [...current.filter(r => r.id !== rule.id), rule];
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_RULES, JSON.stringify(updated));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving checklist rule:', e);
  }
}

export function getStoredChecklistEntries(vehicleId?: string): WeeklyChecklistEntry[] {
  if (!isBrowser) {
    return vehicleId ? seedWeeklyChecklistEntries.filter(e => e.vehicleId === vehicleId) : seedWeeklyChecklistEntries;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST_ENTRIES);
    let all: WeeklyChecklistEntry[] = seedWeeklyChecklistEntries;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST_ENTRIES, JSON.stringify(seedWeeklyChecklistEntries));
    }
    return vehicleId ? all.filter(e => e.vehicleId === vehicleId) : all;
  } catch (e) {
    return vehicleId ? seedWeeklyChecklistEntries.filter(e => e.vehicleId === vehicleId) : seedWeeklyChecklistEntries;
  }
}

export function saveChecklistEntry(entry: WeeklyChecklistEntry): void {
  if (!isBrowser) return;
  try {
    const current = getStoredChecklistEntries();
    const updated = [...current, entry];
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_ENTRIES, JSON.stringify(updated));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving checklist entry:', e);
  }
}

// ==================== CUSTOM RULES ====================

export function getStoredCustomRules(vehicleId?: string): CustomRule[] {
  if (!isBrowser) {
    return vehicleId ? seedCustomRules.filter(r => r.vehicleId === vehicleId) : seedCustomRules;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_RULES);
    let all: CustomRule[] = seedCustomRules;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) all = parsed;
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_RULES, JSON.stringify(seedCustomRules));
    }
    return vehicleId ? all.filter(r => r.vehicleId === vehicleId) : all;
  } catch (e) {
    return vehicleId ? seedCustomRules.filter(r => r.vehicleId === vehicleId) : seedCustomRules;
  }
}

export function saveCustomRule(rule: CustomRule): void {
  if (!isBrowser) return;
  try {
    const current = getStoredCustomRules();
    const updated = [...current, rule];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RULES, JSON.stringify(updated));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error saving custom rule:', e);
  }
}

// ==================== RESET ====================

export function resetAllToDemoData(): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(seedVehicles));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(seedRules));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(seedMaintenance));
    localStorage.setItem(STORAGE_KEYS.ODOMETER, JSON.stringify(seedOdometer));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_RULES, JSON.stringify(seedWeeklyChecklistRules));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST_ENTRIES, JSON.stringify(seedWeeklyChecklistEntries));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_RULES, JSON.stringify(seedCustomRules));
    dispatchStorageEvent();
  } catch (e) {
    console.error('Error resetting to demo data:', e);
  }
}
