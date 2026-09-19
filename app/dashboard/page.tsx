'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Wrench,
  MessageCircle,
  ArrowRight,
  Plus,
  AlertOctagon,
  X,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import GreetingHeader from '@/components/GreetingHeader';
import A2BReadinessDonut from '@/components/A2BReadinessDonut';
import AirportWeatherClock from '@/components/AirportWeatherClock';
import A2BCategoryCards from '@/components/A2BCategoryCards';
import { maintenanceRecords, odometerHistory, rules, vehicles } from '@/lib/demo-data';
import { projectMaintenance } from '@/lib/maintenance';
import { MaintenanceProjection } from '@/lib/types';

export default function DashboardPage() {
  const asOf = '2026-09-19T14:00:00+08:00';

  // Modal Laporkan Kerusakan state
  const [damageModalOpen, setDamageModalOpen] = useState(false);
  const [selectedDamageVehicle, setSelectedDamageVehicle] = useState(vehicles[0]?.id || '');
  const [damageSeverity, setDamageSeverity] = useState('BREAKDOWN');
  const [damageDescription, setDamageDescription] = useState('');
  const [damageSuccessMsg, setDamageSuccessMsg] = useState(false);

  // Projections
  const rows = useMemo(() => {
    return vehicles.map(v => {
      const rule = rules.find(r => r.vehicleId === v.id) || {
        id: `def-${v.id}`,
        vehicleId: v.id,
        type: 'GANTI OLI',
        intervalKm: 5000,
        intervalDays: 180,
        warningKm: 500,
        warningDays: 14,
        active: true,
      };
      const last = maintenanceRecords
        .filter(m => m.vehicleId === v.id && m.type === 'GANTI_OLI')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || {
        id: `def-m-${v.id}`,
        vehicleId: v.id,
        ruleId: rule.id,
        type: 'GANTI_OLI' as const,
        km: v.currentKm - 4000,
        date: '2026-06-01T08:00:00+08:00',
        operator: 'Sistem',
      };
      const hist = odometerHistory.filter(o => o.vehicleId === v.id);
      return {
        v,
        p: projectMaintenance({
          currentKm: v.currentKm,
          asOf,
          rule,
          lastMaintenance: last,
          odometerHistory: hist,
        }),
      };
    });
  }, [asOf]);

  const projectionsMap = useMemo(() => {
    const map = new Map<string, MaintenanceProjection>();
    rows.forEach(r => map.set(r.v.id, r.p));
    return map;
  }, [rows]);

  const counts = useMemo(() => {
    const c = { NORMAL: 0, WARNING: 0, OVERDUE: 0 };
    rows.forEach(r => c[r.p.status]++);
    return c;
  }, [rows]);

  const urgent = useMemo(() => {
    return [...rows]
      .filter(r => r.p.status === 'OVERDUE' || r.p.status === 'WARNING')
      .sort((a, b) => {
        const aVal = Math.min(a.p.remainingDays, a.p.estimatedDaysByKm ?? 9999);
        const bVal = Math.min(b.p.remainingDays, b.p.estimatedDaysByKm ?? 9999);
        return aVal - bVal;
      });
  }, [rows]);

  const urgentListForDonut = useMemo(() => {
    return urgent.slice(0, 3).map(({ v, p }) => ({
      id: v.id,
      name: v.name,
      hullNumber: v.hullNumber,
      plate: v.plate,
      status: p.status as 'WARNING' | 'OVERDUE',
      reason:
        p.status === 'OVERDUE'
          ? `Terlambat ganti oli (Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM)`
          : `Mendekati servis (Sisa ${p.remainingKm.toLocaleString('id-ID')} KM / ${p.remainingDays} hari)`,
    }));
  }, [urgent]);

  const handleDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDamageSuccessMsg(true);
    setTimeout(() => {
      setDamageSuccessMsg(false);
      setDamageModalOpen(false);
      setDamageDescription('');
    }, 1800);
  };

  return (
    <div className="page dashboardPage">
      {/* Top Greeting Header with Light Skeuomorphic Action Buttons */}
      <header className="pageHeader" style={{ marginBottom: '20px' }}>
        <GreetingHeader userName="Teknisi">
          <div className="headerActions">
            <Link className="primaryButton" href="/vehicles">
              <Plus size={16} /> Tambah Unit
            </Link>
            <button
              className="skeuoDangerBtn"
              onClick={() => setDamageModalOpen(true)}
              title="Laporkan kerusakan unit A2B untuk penanganan darurat"
            >
              <AlertOctagon size={16} /> Laporkan Kerusakan
            </button>
            <a
              className="secondaryButton"
              href="https://api.whatsapp.com/send?text=Hallo%20Airport%20Mechanical%20Status"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <MessageCircle size={16} /> WhatsApp Alert
            </a>
          </div>
        </GreetingHeader>
      </header>

      {/* ===== 1. FUNCTIONAL BENTO GRID ===== */}
      <section className="bentoDashboard">
        {/* Bento Top Row: Left (Large Donut) + Right (Medium Weather & Airport Clock) */}
        <div className="bentoTopRow">
          {/* Grid Kiri (Besar): Status Kesiapan Unit A2B */}
          <A2BReadinessDonut
            readyCount={counts.NORMAL}
            maintenanceCount={counts.WARNING}
            breakdownCount={counts.OVERDUE}
            totalCount={rows.length}
            urgentUnits={urgentListForDonut}
          />

          {/* Grid Kanan Atas (Sedang): Weather Widget & Jam Bandara */}
          <AirportWeatherClock />
        </div>

        {/* Grid Rapi di Bawahnya: Kartu-Kartu Kategori A2B */}
        <div className="bentoBottomSection">
          <div className="bentoBottomHead">
            <div>
              <span className="eyebrow" style={{ color: 'var(--teal)' }}>
                DISTRIBUSI KATEGORI ALAT-ALAT BESAR (A2B)
              </span>
              <h2>Armada Apron & Ground Support Equipment</h2>
              <p>Klik kartu kategori untuk langsung melihat dan memfilter unit terkait di halaman armada.</p>
            </div>
            <Link href="/vehicles" className="secondaryButton" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
              <SlidersHorizontal size={14} /> Lihat Semua ({rows.length} Unit)
            </Link>
          </div>

          <A2BCategoryCards vehicles={vehicles} projections={projectionsMap} />
        </div>
      </section>

      {/* ===== Prioritas Servis & Maintenance Timeline ===== */}
      <section className="dashboardGrid">
        {/* Priority Panel */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">TINDAKAN CEPAT</p>
              <h2>Priority Maintenance ({urgent.length} Unit)</h2>
            </div>
            <Link href="/vehicles" style={{ fontSize: '13px', fontWeight: '750', color: 'var(--teal)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Semua unit <ArrowRight size={13} />
            </Link>
          </div>

          <div className="priorityList">
            {urgent.length === 0 ? (
              <p style={{ padding: '20px 0', color: 'var(--muted)', textAlign: 'center' }}>
                Semua unit A2B saat ini dalam kondisi siap beroperasi (Ready).
              </p>
            ) : (
              urgent.map(({ v, p }) => (
                <Link className="priorityRow" href={`/vehicles/${v.id}`} key={v.id}>
                  <div className="priorityIcon">
                    <Wrench size={17} />
                  </div>
                  <div className="grow">
                    <strong>
                      {v.hullNumber ? `[${v.hullNumber}] ` : ''}{v.name}
                    </strong>
                    <span>
                      {v.plate} • {v.currentKm.toLocaleString('id-ID')} KM • {v.category || 'A2B'}
                    </span>
                  </div>
                  <div className="alignRight">
                    <StatusBadge status={p.status} />
                    <small>
                      {p.remainingKm < 0
                        ? `Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`
                        : `Sisa ${p.remainingKm.toLocaleString('id-ID')} KM (${p.remainingDays} hari)`}
                    </small>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Maintenance Timeline Panel */}
        <div className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">ESTIMASI WAKTU</p>
              <h2>Maintenance Timeline</h2>
            </div>
          </div>
          <div className="timeline">
            {urgent.slice(0, 4).map(({ v, p }) => (
              <div className="timelineItem" key={v.id}>
                <div className="timelineLine">
                  <div className="dot" />
                </div>
                <div>
                  <strong>
                    {v.hullNumber ? `[${v.hullNumber}] ` : ''}{v.name}
                  </strong>
                  <p>{p.trigger === 'KM' ? 'Batas KM tercapai lebih dulu' : 'Batas waktu tercapai lebih dulu'}</p>
                </div>
                <time>
                  {p.estimatedDaysByKm !== null
                    ? `${p.estimatedDaysByKm} hari`
                    : `${Math.max(0, p.remainingDays)} hari`}
                </time>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Damage Report Modal ===== */}
      {damageModalOpen && (
        <div className="damageModalOverlay" onClick={() => setDamageModalOpen(false)}>
          <div className="damageModal" onClick={e => e.stopPropagation()}>
            <div className="damageModalHeader">
              <h3>
                <AlertOctagon size={20} /> Laporkan Kerusakan Unit A2B
              </h3>
              <button
                className="iconButton"
                onClick={() => setDamageModalOpen(false)}
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>

            {damageSuccessMsg ? (
              <div style={{ padding: '36px 22px', textAlign: 'center' }}>
                <CheckCircle2 size={44} style={{ color: 'var(--green)', margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '17px' }}>Laporan Kerusakan Diterima!</h4>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13.5px' }}>
                  Status unit telah dialihkan ke breakdown dan notifikasi dikirimkan ke supervisor mekanik.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDamageSubmit}>
                <div className="damageModalBody">
                  <div className="damageField">
                    <label>Pilih Unit Kendaraan / A2B</label>
                    <select
                      value={selectedDamageVehicle}
                      onChange={e => setSelectedDamageVehicle(e.target.value)}
                      required
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.hullNumber ? `[${v.hullNumber}] ` : ''}{v.name} ({v.plate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="damageField">
                    <label>Tingkat Keparahan Kerusakan</label>
                    <select
                      value={damageSeverity}
                      onChange={e => setDamageSeverity(e.target.value)}
                    >
                      <option value="BREAKDOWN">🚨 Kerusakan Berat / Breakdown (Unit Mogok / Tidak Bisa Gerak)</option>
                      <option value="MAINTENANCE">⚠️ Kendala Teknis / Perlu Masuk Bengkel</option>
                      <option value="MINOR">ℹ️ Kendala Ringan (Lampu, Klakson, Wiper)</option>
                    </select>
                  </div>

                  <div className="damageField">
                    <label>Deskripsi Kerusakan & Gejala</label>
                    <textarea
                      value={damageDescription}
                      onChange={e => setDamageDescription(e.target.value)}
                      placeholder="Contoh: Kebocoran hidrolik pada sistem steering, rem tidak pakem, atau overheat..."
                      required
                    />
                  </div>
                </div>

                <div className="damageModalFooter">
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => setDamageModalOpen(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="skeuoDangerBtn">
                    <Send size={14} /> Kirim Laporan Darurat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
