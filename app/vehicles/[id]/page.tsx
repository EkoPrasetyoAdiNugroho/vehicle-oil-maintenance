'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  Wrench,
  TrendingUp,
  Clock3,
  Droplets,
  Save,
  RotateCcw,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import WeeklyChecklist from '@/components/WeeklyChecklist';
import RulesManager from '@/components/RulesManager';
import {
  getVehicleById,
  getStoredRules,
  getStoredMaintenance,
  getStoredOdometer,
  getStoredWeeklyChecklistRules,
  getStoredChecklistEntries,
  getStoredCustomRules,
  saveOdometerEntry,
  saveMaintenanceRecord,
  saveChecklistEntry,
  saveCustomRule,
} from '@/lib/storage';
import { projectMaintenance, getWaAlertUrl } from '@/lib/maintenance';
import {
  Vehicle,
  MaintenanceRule,
  MaintenanceRecord,
  OdometerEntry,
  WeeklyChecklistRule,
  WeeklyChecklistEntry,
  CustomRule,
  DayOfWeek,
} from '@/lib/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export default function VehicleDetailPage() {
  const params = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  const [rule, setRule] = useState<MaintenanceRule>({
    id: 'def',
    vehicleId: '',
    type: 'GANTI OLI',
    intervalKm: 5000,
    intervalDays: 180,
    warningKm: 500,
    warningDays: 14,
    active: true,
  });
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [history, setHistory] = useState<OdometerEntry[]>([]);
  const [currentKm, setCurrentKm] = useState(0);
  const [inputKm, setInputKm] = useState('');
  const [odoMessage, setOdoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [oilFeedback, setOilFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [oilLiters, setOilLiters] = useState('');
  const [oilType, setOilType] = useState('15W-40 Diesel');
  const [checklistRule, setChecklistRule] = useState<WeeklyChecklistRule | null>(null);
  const [checklistEntries, setChecklistEntries] = useState<WeeklyChecklistEntry[]>([]);
  const [vehicleCustomRules, setVehicleCustomRules] = useState<CustomRule[]>([]);

  useEffect(() => {
    if (!params?.id) return;
    const v = getVehicleById(params.id);
    if (v) {
      setVehicle(v);
      setCurrentKm(v.currentKm);

      // Rules
      const rules = getStoredRules(v.id);
      const r = rules[0] || {
        id: `rule-${v.id}`,
        vehicleId: v.id,
        type: 'GANTI OLI',
        intervalKm: 5000,
        intervalDays: 180,
        warningKm: 500,
        warningDays: 14,
        active: true,
      };
      setRule(r);

      // Maintenance
      const m = getStoredMaintenance(v.id);
      setMaintenance(m);

      // Odometer
      const h = getStoredOdometer(v.id);
      setHistory(h);

      // Checklist rule
      const chkRules = getStoredWeeklyChecklistRules(v.id);
      setChecklistRule(chkRules[0] || null);

      // Checklist entries
      const chkEntries = getStoredChecklistEntries(v.id);
      setChecklistEntries(chkEntries);

      // Custom rules
      const cRules = getStoredCustomRules(v.id);
      setVehicleCustomRules(cRules);
    }
    setLoading(false);
  }, [params?.id]);

  // Latest full oil change for KM wear baseline
  const lastFullChange = useMemo(() => {
    return maintenance.find(m => m.type === 'GANTI_OLI');
  }, [maintenance]);

  // Latest oil activity (GANTI_OLI or TAMBAH_OLI) for realtime calendar time baseline
  const lastAnyOil = useMemo(() => {
    return maintenance[0]; // maintenance is sorted newest first
  }, [maintenance]);

  // Maintenance projection baseline:
  // - KM baseline uses last full oil change (to accurately track engine distance wear)
  // - Date baseline uses latest oil activity (updates in realtime on any oil fill/topup)
  const last = useMemo((): MaintenanceRecord => {
    const baseKm = lastFullChange ? lastFullChange.km : Math.max(0, currentKm - 4000);
    const baseDate = lastAnyOil ? lastAnyOil.date : '2026-06-01T08:00:00+08:00';
    return {
      id: lastAnyOil?.id || `def-m-${vehicle?.id || 'new'}`,
      vehicleId: vehicle?.id || '',
      ruleId: rule.id,
      type: 'GANTI_OLI',
      km: baseKm,
      date: baseDate,
      operator: lastAnyOil?.operator || 'Sistem',
      oilType: lastAnyOil?.oilType,
      oilVolumeLiters: lastAnyOil?.oilVolumeLiters,
    };
  }, [lastFullChange, lastAnyOil, vehicle?.id, rule.id, currentKm]);

  // Maintenance projection (recalculates in realtime whenever currentKm, history, or oil changes)
  const p = useMemo(() => {
    return projectMaintenance({
      currentKm,
      asOf: new Date().toISOString(),
      rule,
      lastMaintenance: last,
      odometerHistory: history,
    });
  }, [currentKm, rule, last, history]);

  function submitKm(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicle) return;
    const km = Number(inputKm);
    if (!Number.isFinite(km) || km < currentKm) {
      setOdoMessage({
        type: 'error',
        text: `KM baru tidak boleh lebih kecil dari ${currentKm.toLocaleString('id-ID')} KM.`,
      });
      return;
    }
    const entry: OdometerEntry = {
      id: `odo-${Date.now()}`,
      vehicleId: vehicle.id,
      km,
      recordedAt: new Date().toISOString(),
      operator: 'Operator Lapangan',
    };

    saveOdometerEntry(entry);
    setHistory(h => [...h, entry]);
    setCurrentKm(km);
    setInputKm('');
    setOdoMessage({
      type: 'success',
      text: `Odometer berhasil disimpan (${km.toLocaleString('id-ID')} KM). Sisa KM & estimasi diperbarui realtime.`,
    });
    setTimeout(() => setOdoMessage(null), 4000);
  }

  function recordOil(type: 'GANTI_OLI' | 'TAMBAH_OLI') {
    if (!vehicle) return;
    const liters = Number(oilLiters || 0);
    const nowIso = new Date().toISOString();
    const rec: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      vehicleId: vehicle.id,
      ruleId: rule.id,
      type,
      km: currentKm,
      date: nowIso,
      oilVolumeLiters: liters || undefined,
      oilType,
      operator: 'Operator Lapangan',
      notes:
        type === 'GANTI_OLI'
          ? `Ganti oli berkala (${liters ? `${liters}L ` : ''}${oilType})`
          : `Penambahan / top-up oli (${liters ? `${liters}L ` : ''}${oilType})`,
    };

    saveMaintenanceRecord(rec);
    setMaintenance(prev => [rec, ...prev]);
    setOilLiters('');
    setOilFeedback({
      type: 'success',
      text:
        type === 'GANTI_OLI'
          ? `Ganti oli penuh berhasil dicatat! Sisa KM (5.000 KM) dan sisa waktu (180 hari) diperbarui secara realtime.`
          : `Penambahan oli (${liters || 0} L) berhasil dicatat! Sisa waktu kalender diperbarui secara realtime dari hari ini.`,
    });
    setTimeout(() => setOilFeedback(null), 5000);
  }

  function handleChecklistComplete(day: DayOfWeek) {
    if (!vehicle) return;
    const entry: WeeklyChecklistEntry = {
      id: `we-${Date.now()}`,
      ruleId: checklistRule?.id ?? '',
      vehicleId: vehicle.id,
      day,
      weekStart: getWeekStart(new Date()),
      completedAt: new Date().toISOString(),
      operator: 'Operator Lapangan',
    };

    saveChecklistEntry(entry);
    setChecklistEntries(prev => [...prev, entry]);
  }

  function handleAddRule(newRule: CustomRule) {
    saveCustomRule(newRule);
    setVehicleCustomRules(prev => [...prev, newRule]);
  }

  if (loading) {
    return (
      <div className="page" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Memuat data unit armada...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={48} style={{ color: 'var(--orange)', margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Unit Kendaraan Tidak Ditemukan</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Kendaraan atau unit A2B dengan ID &quot;{params.id}&quot; tidak ditemukan dalam sistem.
        </p>
        <Link href="/vehicles" className="primaryButton" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Kembali ke Daftar Armada
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link href="/vehicles" className="backLink">
        <ArrowLeft size={16} /> Kembali ke daftar armada
      </Link>

      <header className="detailHero">
        <div className="detailPhoto">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          ) : (
            <span>{vehicle.brand}</span>
          )}
        </div>
        <div className="grow">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
            {vehicle.hullNumber && <span className="denseHullBadge">{vehicle.hullNumber}</span>}
            <span className="denseCatBadge">{vehicle.category || 'Alat-Alat Besar'}</span>
          </div>
          <h1>{vehicle.name}</h1>
          <p>
            {vehicle.plate} • {vehicle.brand} {vehicle.model} • Tahun {vehicle.year}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <StatusBadge status={p.status} />
          {(p.status === 'WARNING' || p.status === 'OVERDUE') && (
            <a
              href={getWaAlertUrl(vehicle, p)}
              target="_blank"
              rel="noopener noreferrer"
              className={`waAlertBtn ${p.status === 'OVERDUE' ? 'overdue' : ''}`}
              title={`Kirim notifikasi WhatsApp maintenance untuk ${vehicle.name}`}
            >
              <MessageCircle size={15} />
              <span>WhatsApp Alert</span>
            </a>
          )}
        </div>
      </header>

      <section className="detailStats">
        <div>
          <Gauge />
          <span>Odometer Saat Ini</span>
          <strong>{currentKm.toLocaleString('id-ID')} KM</strong>
        </div>
        <div>
          <Wrench />
          <span>Target Servis KM</span>
          <strong>{p.targetKm.toLocaleString('id-ID')} KM</strong>
        </div>
        <div>
          <CalendarDays />
          <span>Target Tanggal</span>
          <strong>
            {new Date(p.targetDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </strong>
        </div>
        <div>
          <Clock3 />
          <span>Driver Batas Utama</span>
          <strong>
            {p.trigger === 'KM' ? 'Kilometer' : p.trigger === 'TIME' ? 'Waktu (Hari)' : 'Belum cukup data'}
          </strong>
        </div>
      </section>

      {/* Weekly Checklist */}
      {checklistRule && (
        <section className="checklistSection">
          <WeeklyChecklist
            rule={checklistRule}
            entries={checklistEntries}
            onComplete={handleChecklistComplete}
          />
        </section>
      )}

      <section className="detailGrid">
        {/* Input Odometer */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">UPDATE DATA</p>
              <h2>Input Odometer Baru</h2>
            </div>
          </div>
          <form className="odometerForm" onSubmit={submitKm}>
            <label>
              KM Saat Ini
              <input
                type="number"
                value={inputKm}
                onChange={e => setInputKm(e.target.value)}
                placeholder={String(currentKm)}
                required
              />
            </label>
            <button className="primaryButton" type="submit">
              <Save size={15} /> Simpan Odometer
            </button>
            {odoMessage && (
              <p className={`formMessage ${odoMessage.type === 'error' ? 'formError' : ''}`}>
                {odoMessage.text}
              </p>
            )}
          </form>
        </div>

        {/* Prediksi Maintenance (Realtime KM & Sisa Waktu) */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">PREDIKSI</p>
              <h2>Maintenance Berikutnya</h2>
            </div>
            <TrendingUp size={18} />
          </div>
          <div className="prediction">
            <div>
              <span>Sisa Jarak (KM)</span>
              <strong style={{ color: p.remainingKm < 0 ? 'var(--red)' : p.status === 'WARNING' ? 'var(--orange)' : 'var(--text)' }}>
                {p.remainingKm < 0
                  ? `Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`
                  : `${p.remainingKm.toLocaleString('id-ID')} KM`}
              </strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                Target: {p.targetKm.toLocaleString('id-ID')} KM
              </small>
            </div>
            <div>
              <span>Sisa Waktu (Kalender)</span>
              <strong style={{ color: p.remainingDays < 0 ? 'var(--red)' : p.remainingDays <= rule.warningDays ? 'var(--orange)' : 'var(--text)' }}>
                {p.remainingDays < 0
                  ? `Lewat ${Math.abs(p.remainingDays)} hari`
                  : `${p.remainingDays} hari`}
              </strong>
              <small style={{ fontSize: '11px', color: 'var(--teal)', display: 'block', marginTop: '2px' }}>
                Realtime dari pengisian oli
              </small>
            </div>
            <div>
              <span>Rata-rata Harian</span>
              <strong>
                {p.averageKmPerDay ? `${p.averageKmPerDay.toFixed(1)} KM/hari` : 'Belum cukup data'}
              </strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                Dari rekaman odometer
              </small>
            </div>
            <div>
              <span>Estimasi Jatuh Tempo</span>
              <strong style={{ color: p.status === 'OVERDUE' ? 'var(--red)' : p.status === 'WARNING' ? 'var(--orange)' : 'var(--text)' }}>
                {p.status === 'OVERDUE'
                  ? 'Sudah Lewat Jadwal'
                  : p.estimatedDaysByKm !== null && p.trigger === 'KM'
                  ? `~${p.estimatedDaysByKm} hari lagi`
                  : `${Math.max(0, p.remainingDays)} hari lagi`}
              </strong>
              <small style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                {p.trigger === 'KM' ? '⚡ Batas KM tercapai lebih dulu' : '📅 Batas kalender tercapai lebih dulu'}
              </small>
            </div>
            <div className="predictionNote">
              Batas yang diperkirakan tercapai lebih dulu:{' '}
              <b>
                {p.trigger === 'KM' ? 'kilometer pemakaian' : p.trigger === 'TIME' ? 'waktu kalender oli' : 'belum diketahui'}
              </b>
              {p.trigger === 'KM' && p.estimatedDaysByKm !== null
                ? ` (~${p.estimatedDaysByKm} hari lagi karena unit aktif beroperasi).`
                : ` (${p.remainingDays} hari batas usia pelumasan).`}
            </div>
          </div>
        </div>

        {/* Rules Manager */}
        <RulesManager
          vehicleId={vehicle.id}
          rules={vehicleCustomRules}
          onAddRule={handleAddRule}
        />

        {/* Catat Pemeliharaan Oli */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">AKSI PERAWATAN</p>
              <h2>Catat Pemeliharaan Oli</h2>
            </div>
            <Droplets size={18} />
          </div>
          <div className="odometerForm">
            {lastAnyOil && (
              <div
                style={{
                  background: 'var(--card-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '9px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Pengisian Terakhir:</span>
                <strong>
                  {new Date(lastAnyOil.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  ({lastAnyOil.type === 'GANTI_OLI' ? 'Ganti Oli' : 'Tambah Oli'}
                  {lastAnyOil.oilVolumeLiters ? ` • ${lastAnyOil.oilVolumeLiters}L` : ''})
                </strong>
              </div>
            )}

            <label>
              Volume Oli (Liter)
              <input
                value={oilLiters}
                onChange={e => setOilLiters(e.target.value)}
                placeholder="Contoh: 14"
                inputMode="decimal"
              />
            </label>
            <label>
              Jenis / Merek Oli
              <input value={oilType} onChange={e => setOilType(e.target.value)} />
            </label>
            <div className="recordActions">
              <button type="button" className="primaryButton" onClick={() => recordOil('GANTI_OLI')}>
                <RotateCcw size={15} /> Ganti Oli Berkala
              </button>
              <button type="button" className="secondaryButton" onClick={() => recordOil('TAMBAH_OLI')}>
                <Droplets size={15} /> Tambah Oli (Top-Up)
              </button>
            </div>
            {oilFeedback && (
              <p
                className={`formMessage ${oilFeedback.type === 'error' ? 'formError' : ''}`}
                style={{ marginTop: '4px' }}
              >
                {oilFeedback.text}
              </p>
            )}
          </div>
        </div>

        {/* Riwayat Odometer */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">RIWAYAT</p>
              <h2>Catatan Odometer Terakhir</h2>
            </div>
          </div>
          <div className="historyList">
            {history.length === 0 ? (
              <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
                Belum ada rekaman odometer tambahan.
              </p>
            ) : (
              [...history]
                .sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt))
                .slice(0, 7)
                .map(o => (
                  <div key={o.id}>
                    <div>
                      <strong>{o.km.toLocaleString('id-ID')} KM</strong>
                      <span>{o.operator}</span>
                    </div>
                    <time>
                      {new Date(o.recordedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Riwayat Maintenance & Oli */}
        <div className="panel spanFull">
          <div className="panelHead">
            <div>
              <p className="eyebrow">PERAWATAN</p>
              <h2>Riwayat Maintenance & Oli Unit</h2>
            </div>
          </div>
          <div className="historyList">
            {maintenance.length === 0 ? (
              <p style={{ padding: '16px', color: 'var(--muted)', fontSize: '13px', textAlign: 'center' }}>
                Belum ada riwayat maintenance oli untuk unit ini.
              </p>
            ) : (
              maintenance.map(m => (
                <div key={m.id}>
                  <div>
                    <strong>{m.type.replace('_', ' ')}</strong>
                    <span>
                      {m.km.toLocaleString('id-ID')} KM • {m.oilVolumeLiters ?? '-'} L • {m.oilType ?? '-'} • {m.operator}
                      {m.notes ? ` • ${m.notes}` : ''}
                    </span>
                  </div>
                  <time>
                    {new Date(m.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
