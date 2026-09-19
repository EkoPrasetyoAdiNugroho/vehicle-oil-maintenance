import { MaintenanceRecord, MaintenanceRule, OdometerEntry, Vehicle, WeeklyChecklistRule, WeeklyChecklistEntry, CustomRule } from './types';

export const vehicles: Vehicle[] = [
  { id: 'v1', name: 'Airside Patrol Hilux 4x4', plate: 'BB 8124 NB', brand: 'Toyota', model: 'Hilux 2.4 Ops', year: 2022, currentKm: 124020, category: 'Airside Ops', hullNumber: 'AP-01' },
  { id: 'v2', name: 'Pushback Tug TBL-180', plate: 'BB 9032 NA', brand: 'Goldhofer', model: 'TBL-180 Towbarless', year: 2021, currentKm: 79650, category: 'Pushback Tug', hullNumber: 'PBT-01' },
  { id: 'v3', name: 'Baggage Towing Tractor TD25', plate: 'BB 7418 NC', brand: 'Toyota', model: 'TD25 Towing', year: 2020, currentKm: 60800, category: 'Baggage Towing', hullNumber: 'BTT-01' },
  { id: 'v4', name: 'Fire Truck Oshkosh Striker', plate: 'BB 6241 ND', brand: 'Oshkosh', model: 'Striker 6x6 PKP-PK', year: 2019, currentKm: 93660, category: 'Fire Truck PKP-PK', hullNumber: 'FT-01' },
  { id: 'v5', name: 'Pushback Tug Schopf F396', plate: 'BB 5112 NE', brand: 'Schopf', model: 'F396 Heavy Tug', year: 2021, currentKm: 34200, category: 'Pushback Tug', hullNumber: 'PBT-02' },
  { id: 'v6', name: 'Fire Truck Rosenbauer Panther', plate: 'BB 4108 NF', brand: 'Rosenbauer', model: 'Panther 4x4 ARFF', year: 2022, currentKm: 18500, category: 'Fire Truck PKP-PK', hullNumber: 'FT-02' },
  { id: 'v7', name: 'Baggage Towing Clark CT50', plate: 'BB 3920 NG', brand: 'Clark', model: 'CT50 Apron Tractor', year: 2020, currentKm: 47800, category: 'Baggage Towing', hullNumber: 'BTT-02' },
  { id: 'v8', name: 'Ground Power Unit 90kVA', plate: 'BB 2801 NH', brand: 'Houchin', model: 'GPU-4900 Diesel', year: 2019, currentKm: 21400, category: 'GPU / Genset', hullNumber: 'GPU-01' },
  { id: 'v9', name: 'Ambulift Passenger Boarding', plate: 'BB 1920 NJ', brand: 'Mallaghan', model: 'CTX 6000 Medilift', year: 2021, currentKm: 15300, category: 'Garbarata / Ambulift', hullNumber: 'AMB-01' },
];

export const odometerHistory: OdometerEntry[] = [
  // v1 - Airside Patrol
  { id: 'o1', vehicleId: 'v1', km: 121709, recordedAt: '2026-08-20T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o2', vehicleId: 'v1', km: 122480, recordedAt: '2026-08-27T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o3', vehicleId: 'v1', km: 123220, recordedAt: '2026-09-03T08:00:00+08:00', operator: 'Fadli' },
  { id: 'o4', vehicleId: 'v1', km: 123680, recordedAt: '2026-09-10T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o5', vehicleId: 'v1', km: 124020, recordedAt: '2026-09-19T08:00:00+08:00', operator: 'Fadli' },

  // v2 - Pushback Tug TBL-180
  { id: 'o6', vehicleId: 'v2', km: 76500, recordedAt: '2026-08-23T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o7', vehicleId: 'v2', km: 78020, recordedAt: '2026-09-06T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o8', vehicleId: 'v2', km: 79650, recordedAt: '2026-09-19T08:00:00+08:00', operator: 'Fadli' },

  // v3 - Baggage Towing TD25
  { id: 'o9', vehicleId: 'v3', km: 56500, recordedAt: '2026-08-01T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o10', vehicleId: 'v3', km: 59000, recordedAt: '2026-08-26T08:00:00+08:00', operator: 'Fadli' },
  { id: 'o11', vehicleId: 'v3', km: 60800, recordedAt: '2026-09-19T08:00:00+08:00', operator: 'Fadli' },

  // v4 - Fire Truck Striker
  { id: 'o12', vehicleId: 'v4', km: 88000, recordedAt: '2026-07-18T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o13', vehicleId: 'v4', km: 91200, recordedAt: '2026-08-23T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o14', vehicleId: 'v4', km: 93660, recordedAt: '2026-09-19T08:00:00+08:00', operator: 'Fadli' },

  // v5 - Pushback Tug Schopf
  { id: 'o15', vehicleId: 'v5', km: 31200, recordedAt: '2026-08-15T08:00:00+08:00', operator: 'Fadli' },
  { id: 'o16', vehicleId: 'v5', km: 34200, recordedAt: '2026-09-18T08:00:00+08:00', operator: 'Rizki' },

  // v6 - Fire Truck Panther
  { id: 'o17', vehicleId: 'v6', km: 16800, recordedAt: '2026-08-10T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o18', vehicleId: 'v6', km: 18500, recordedAt: '2026-09-17T08:00:00+08:00', operator: 'Fadli' },

  // v7 - Baggage Towing Clark
  { id: 'o19', vehicleId: 'v7', km: 44000, recordedAt: '2026-08-12T08:00:00+08:00', operator: 'Fadli' },
  { id: 'o20', vehicleId: 'v7', km: 47800, recordedAt: '2026-09-18T08:00:00+08:00', operator: 'Rizki' },

  // v8 - GPU 90kVA
  { id: 'o21', vehicleId: 'v8', km: 19800, recordedAt: '2026-08-05T08:00:00+08:00', operator: 'Rizki' },
  { id: 'o22', vehicleId: 'v8', km: 21400, recordedAt: '2026-09-15T08:00:00+08:00', operator: 'Fadli' },

  // v9 - Ambulift
  { id: 'o23', vehicleId: 'v9', km: 14200, recordedAt: '2026-08-18T08:00:00+08:00', operator: 'Fadli' },
  { id: 'o24', vehicleId: 'v9', km: 15300, recordedAt: '2026-09-16T08:00:00+08:00', operator: 'Rizki' },
];

export const rules: MaintenanceRule[] = [
  { id: 'r1', vehicleId: 'v1', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r2', vehicleId: 'v2', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r3', vehicleId: 'v3', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r4', vehicleId: 'v4', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r5', vehicleId: 'v5', type: 'GANTI OLI', intervalKm: 6000, intervalDays: 180, warningKm: 600, warningDays: 14, active: true },
  { id: 'r6', vehicleId: 'v6', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r7', vehicleId: 'v7', type: 'GANTI OLI', intervalKm: 4000, intervalDays: 180, warningKm: 400, warningDays: 14, active: true },
  { id: 'r8', vehicleId: 'v8', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
  { id: 'r9', vehicleId: 'v9', type: 'GANTI OLI', intervalKm: 5000, intervalDays: 180, warningKm: 500, warningDays: 14, active: true },
];

export const maintenanceRecords: MaintenanceRecord[] = [
  { id: 'm1', vehicleId: 'v1', ruleId: 'r1', type: 'GANTI_OLI', km: 121709, date: '2026-04-21T08:00:00+08:00', oilVolumeLiters: 7, oilType: 'Shell Rimula R4 15W-40', operator: 'Rizki', notes: 'Ganti oli berkala' },
  { id: 'm1b', vehicleId: 'v1', ruleId: 'r1', type: 'TAMBAH_OLI', km: 123100, date: '2026-09-01T08:00:00+08:00', oilVolumeLiters: 0.5, oilType: 'Shell Rimula R4 15W-40', operator: 'Fadli', notes: 'Top up level oli' },
  { id: 'm2', vehicleId: 'v2', ruleId: 'r2', type: 'GANTI_OLI', km: 75000, date: '2026-04-08T08:00:00+08:00', oilVolumeLiters: 14, oilType: 'Mobil Delvac Modern 15W-40', operator: 'Rizki', notes: 'Servis berat Tug TBL-180' },
  { id: 'm3', vehicleId: 'v3', ruleId: 'r3', type: 'GANTI_OLI', km: 56500, date: '2026-08-01T08:00:00+08:00', oilVolumeLiters: 6, oilType: 'Pertamina Meditran SX 15W-40', operator: 'Fadli' },
  { id: 'm4', vehicleId: 'v4', ruleId: 'r4', type: 'GANTI_OLI', km: 88000, date: '2026-02-15T08:00:00+08:00', oilVolumeLiters: 24, oilType: 'Shell Rimula R4 15W-40', operator: 'Rizki', notes: 'Servis tahunan Fire Engine' },
  { id: 'm5', vehicleId: 'v5', ruleId: 'r5', type: 'GANTI_OLI', km: 30000, date: '2026-07-20T08:00:00+08:00', oilVolumeLiters: 16, oilType: 'Mobil Delvac MX 15W-40', operator: 'Fadli', notes: 'Ganti oli mesin Schopf' },
  { id: 'm6', vehicleId: 'v6', ruleId: 'r6', type: 'GANTI_OLI', km: 15000, date: '2026-06-10T08:00:00+08:00', oilVolumeLiters: 20, oilType: 'Shell Rimula R4 15W-40', operator: 'Rizki', notes: 'Servis rutin ARFF' },
  { id: 'm7', vehicleId: 'v7', ruleId: 'r7', type: 'GANTI_OLI', km: 44000, date: '2026-05-15T08:00:00+08:00', oilVolumeLiters: 6, oilType: 'Pertamina Meditran SX 15W-40', operator: 'Fadli', notes: 'Ganti oli traktor bagasi' },
  { id: 'm8', vehicleId: 'v8', ruleId: 'r8', type: 'GANTI_OLI', km: 18000, date: '2026-07-05T08:00:00+08:00', oilVolumeLiters: 12, oilType: 'Shell Rimula R4 15W-40', operator: 'Rizki', notes: 'Ganti oli genset GPU' },
  { id: 'm9', vehicleId: 'v9', ruleId: 'r9', type: 'GANTI_OLI', km: 12000, date: '2026-06-25T08:00:00+08:00', oilVolumeLiters: 8, oilType: 'Pertamina Meditran SX 15W-40', operator: 'Fadli', notes: 'Servis hidrolik & mesin ambulift' },
];

export const weeklyChecklistRules: WeeklyChecklistRule[] = [
  { id: 'wc1', vehicleId: 'v1', name: 'Perawatan Kendaraan', days: ['Sen', 'Sab'], active: true },
  { id: 'wc2', vehicleId: 'v2', name: 'Perawatan Kendaraan', days: ['Sen', 'Kam'], active: true },
  { id: 'wc3', vehicleId: 'v3', name: 'Perawatan Kendaraan', days: ['Sel', 'Jum'], active: true },
  { id: 'wc4', vehicleId: 'v4', name: 'Perawatan Kendaraan', days: ['Sen', 'Rab', 'Sab'], active: true },
  { id: 'wc5', vehicleId: 'v5', name: 'Perawatan Kendaraan', days: ['Sen', 'Kam'], active: true },
  { id: 'wc6', vehicleId: 'v6', name: 'Perawatan Kendaraan', days: ['Sel', 'Jum'], active: true },
  { id: 'wc7', vehicleId: 'v7', name: 'Perawatan Kendaraan', days: ['Sen', 'Rab'], active: true },
  { id: 'wc8', vehicleId: 'v8', name: 'Perawatan Kendaraan', days: ['Sen', 'Sab'], active: true },
  { id: 'wc9', vehicleId: 'v9', name: 'Perawatan Kendaraan', days: ['Sel', 'Kam'], active: true },
];

export const weeklyChecklistEntries: WeeklyChecklistEntry[] = [
  { id: 'we1', ruleId: 'wc1', vehicleId: 'v1', day: 'Sen', weekStart: '2026-09-15', completedAt: '2026-09-15T08:30:00+08:00', operator: 'Rizki' },
  { id: 'we2', ruleId: 'wc2', vehicleId: 'v2', day: 'Sen', weekStart: '2026-09-15', completedAt: '2026-09-15T09:00:00+08:00', operator: 'Fadli' },
  { id: 'we3', ruleId: 'wc3', vehicleId: 'v3', day: 'Sel', weekStart: '2026-09-15', completedAt: '2026-09-16T07:45:00+08:00', operator: 'Rizki' },
  { id: 'we4', ruleId: 'wc4', vehicleId: 'v4', day: 'Sen', weekStart: '2026-09-15', completedAt: '2026-09-15T08:15:00+08:00', operator: 'Fadli' },
  { id: 'we5', ruleId: 'wc4', vehicleId: 'v4', day: 'Rab', weekStart: '2026-09-15', completedAt: '2026-09-17T08:00:00+08:00', operator: 'Rizki' },
  { id: 'we6', ruleId: 'wc5', vehicleId: 'v5', day: 'Sen', weekStart: '2026-09-15', completedAt: '2026-09-15T09:30:00+08:00', operator: 'Fadli' },
  { id: 'we7', ruleId: 'wc6', vehicleId: 'v6', day: 'Sel', weekStart: '2026-09-15', completedAt: '2026-09-16T08:00:00+08:00', operator: 'Rizki' },
];

export const customRules: CustomRule[] = [
  { id: 'cr1', vehicleId: 'v1', mode: 'MINGGUAN', name: 'Checklist', days: ['Sen', 'Sab'], active: true },
  { id: 'cr2', vehicleId: 'v1', mode: 'BERKALA', name: 'Ganti Oli', intervalKm: 5000, intervalDays: 180, active: true },
  { id: 'cr3', vehicleId: 'v2', mode: 'MINGGUAN', name: 'Checklist', days: ['Sen', 'Kam'], active: true },
  { id: 'cr4', vehicleId: 'v2', mode: 'BERKALA', name: 'Ganti Oli', intervalKm: 5000, intervalDays: 180, active: true },
  { id: 'cr5', vehicleId: 'v3', mode: 'MINGGUAN', name: 'Checklist', days: ['Sel', 'Jum'], active: true },
  { id: 'cr6', vehicleId: 'v3', mode: 'BERKALA', name: 'Ganti Oli', intervalKm: 5000, intervalDays: 180, active: true },
  { id: 'cr7', vehicleId: 'v4', mode: 'MINGGUAN', name: 'Checklist', days: ['Sen', 'Rab', 'Sab'], active: true },
  { id: 'cr8', vehicleId: 'v4', mode: 'BERKALA', name: 'Ganti Oli', intervalKm: 5000, intervalDays: 180, active: true },
];
