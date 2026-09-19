'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Gauge,
  Calendar,
  ArrowRight,
  Pencil,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import VehicleForm from '@/components/VehicleForm';
import { maintenanceRecords, odometerHistory, rules, vehicles as seedVehicles } from '@/lib/demo-data';
import { projectMaintenance } from '@/lib/maintenance';
import { Vehicle } from '@/lib/types';

function VehiclesContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(seedVehicles);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const asOf = '2026-09-19T14:00:00+08:00';

  // Apply category param from URL if present
  useEffect(() => {
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
  }, [categoryParam]);

  // Responsive auto-detect default view
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setViewMode('card');
    }
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vehicleList.forEach(v => {
      if (v.category) set.add(v.category);
    });
    return Array.from(set);
  }, [vehicleList]);

  const data = useMemo(
    () =>
      vehicleList
        .map(v => {
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
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] || {
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
        })
        .filter(x => {
          const searchTargets = [
            x.v.name,
            x.v.plate,
            x.v.brand,
            x.v.model,
            x.v.hullNumber || '',
            x.v.category || '',
          ]
            .join(' ')
            .toLowerCase();

          const hitSearch = searchTargets.includes(q.toLowerCase());
          const hitStatus = filter === 'ALL' || x.p.status === filter;
          const hitCategory =
            categoryFilter === 'ALL' ||
            (x.v.category && x.v.category.toLowerCase() === categoryFilter.toLowerCase());

          return hitSearch && hitStatus && hitCategory;
        }),
    [q, filter, categoryFilter, vehicleList]
  );

  function handleSaveVehicle(vehicle: Vehicle) {
    if (editingVehicle) {
      setVehicleList(prev => prev.map(v => (v.id === vehicle.id ? vehicle : v)));
    } else {
      setVehicleList(prev => [...prev, vehicle]);
    }
    setShowForm(false);
    setEditingVehicle(null);
  }

  function handleDeleteVehicle(id: string) {
    setVehicleList(prev => prev.filter(v => v.id !== id));
    setDeleteConfirm(null);
  }

  function openEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingVehicle(null);
  }

  const resetFilters = () => {
    setQ('');
    setFilter('ALL');
    setCategoryFilter('ALL');
  };

  const getStatusClass = (status: string) => {
    if (status === 'OVERDUE') return 'statusBreakdown';
    if (status === 'WARNING') return 'statusWarning';
    return 'statusReady';
  };

  return (
    <div className="page vehiclesPage">
      {/* Page Header with Light Skeuomorphic Action */}
      <header className="pageHeader">
        <div>
          <p className="eyebrow">ARMADA OPERASIONAL AIRPORT</p>
          <h1>Alat-Alat Besar (A2B) & Kendaraan</h1>
          <p>
            Daftar lengkap armada operasional bandara. Pantau kesiapan unit, jadwal ganti oli berkala,
            dan rekam jejak teknis.
          </p>
        </div>
        <div className="headerActions">
          <button className="primaryButton" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Tambah Unit A2B
          </button>
        </div>
      </header>

      {/* Toolbar with Filters & View Mode Toggle */}
      <section className="toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        {/* Search */}
        <div className="searchWrap" style={{ minWidth: '240px' }}>
          <Search size={17} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Cari nama unit, no lambung (PBT-01), plat, kategori..."
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter Kategori"
          style={{ width: '180px' }}
        >
          <option value="ALL">Semua Kategori A2B</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          aria-label="Filter Status"
          style={{ width: '160px' }}
        >
          <option value="ALL">Semua Status</option>
          <option value="NORMAL">🟢 Ready / Aman</option>
          <option value="WARNING">🟡 Jadwal Servis</option>
          <option value="OVERDUE">🔴 Breakdown / Rusak</option>
        </select>

        {/* Reset button if active */}
        {(q || filter !== 'ALL' || categoryFilter !== 'ALL') && (
          <button
            className="secondaryButton"
            onClick={resetFilters}
            style={{ padding: '10px 14px' }}
            title="Reset Filter"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}

        {/* View Mode Toggle (Tabel Padat vs Kartu Vertikal) */}
        <div className="viewToggleGroup" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className={`viewToggleBtn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Model Tabel Padat Data (Admin)"
          >
            <TableIcon size={15} />
            <span className="hideOnMobile">Tabel Padat</span>
          </button>
          <button
            type="button"
            className={`viewToggleBtn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            title="Model Kartu Vertikal (Teknisi Lapangan)"
          >
            <LayoutGrid size={15} />
            <span className="hideOnMobile">Kartu Teknisi</span>
          </button>
        </div>
      </section>

      {/* Mobile Add Button */}
      <button className="mobileAddBtn mobileOnly" onClick={() => setShowForm(true)}>
        <Plus size={18} /> Tambah Unit A2B
      </button>

      {/* Result Count Banner */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--muted)' }}>
        <span>
          Menampilkan <strong>{data.length}</strong> dari <strong>{vehicleList.length}</strong> unit
          {categoryFilter !== 'ALL' ? ` (Kategori: ${categoryFilter})` : ''}
        </span>
        <span style={{ fontSize: '12px' }}>
          Mode Tampilan: <strong>{viewMode === 'table' ? 'Tabel Padat (Data-Dense)' : 'Kartu Vertikal (Teknisi)'}</strong>
        </span>
      </div>

      {data.length === 0 ? (
        <div className="emptyHistory" style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <AlertTriangle size={36} style={{ color: 'var(--muted)' }} />
          <h3>Tidak Ada Unit Ditemukan</h3>
          <p>Tidak ditemukan kendaraan yang sesuai dengan kata kunci atau filter status yang dipilih.</p>
          <button className="primaryButton" onClick={resetFilters}>
            Tampilkan Semua Armada
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* ===== MODEL 1: DATA-DENSE TABLE (DESKTOP ADMIN) ===== */
        <div className="dataDenseTableWrapper">
          <table className="dataDenseTable">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>No Lambung & Plat</th>
                <th>Nama Unit & Kategori A2B</th>
                <th style={{ width: '130px' }}>Status Kesiapan</th>
                <th style={{ width: '130px' }}>Odometer Saat Ini</th>
                <th style={{ width: '170px' }}>Target Servis Berikut</th>
                <th style={{ width: '150px' }}>Sisa KM / Hari</th>
                <th style={{ width: '120px' }}>Pemakaian/Hari</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ v, p }) => {
                const targetDateFormatted = new Date(p.targetDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {v.hullNumber && <span className="denseHullBadge">{v.hullNumber}</span>}
                        <span className="densePlate">{v.plate}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text)' }}>
                          {v.name}
                        </strong>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                          <span className="denseCatBadge">{v.category || 'Alat Berat'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {v.brand} {v.model} ({v.year})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <strong>{v.currentKm.toLocaleString('id-ID')}</strong>{' '}
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>KM</span>
                    </td>
                    <td>
                      <div className="denseTargetKm">{p.targetKm.toLocaleString('id-ID')} KM</div>
                      <div className="denseTargetDate">{targetDateFormatted}</div>
                    </td>
                    <td>
                      {p.status === 'OVERDUE' ? (
                        <div className="denseRemainingOverdue">
                          Lewat {Math.abs(p.remainingKm).toLocaleString('id-ID')} KM
                          <small style={{ display: 'block', fontSize: '10.5px' }}>
                            ({Math.abs(p.remainingDays)} hari lalu)
                          </small>
                        </div>
                      ) : p.status === 'WARNING' ? (
                        <div className="denseRemainingWarning">
                          Sisa {p.remainingKm.toLocaleString('id-ID')} KM
                          <small style={{ display: 'block', fontSize: '10.5px' }}>
                            (~{p.remainingDays} hari lagi)
                          </small>
                        </div>
                      ) : (
                        <div className="denseRemainingSafe">
                          Sisa {p.remainingKm.toLocaleString('id-ID')} KM
                          <small style={{ display: 'block', fontSize: '10.5px', color: 'var(--muted)' }}>
                            (~{p.remainingDays} hari)
                          </small>
                        </div>
                      )}
                    </td>
                    <td>
                      {p.averageKmPerDay ? (
                        <span>
                          <strong>{Math.round(p.averageKmPerDay)}</strong>{' '}
                          <small style={{ color: 'var(--muted)' }}>KM/hr</small>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="denseActions">
                        <Link
                          href={`/vehicles/${v.id}`}
                          className="primaryButton denseActionBtn"
                          title="Buka detail kendaraan & log"
                        >
                          Detail
                        </Link>
                        <button
                          className="secondaryButton denseActionBtn"
                          onClick={() => openEdit(v)}
                          title="Edit Unit"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="secondaryButton denseActionBtn"
                          onClick={() => setDeleteConfirm(v.id)}
                          title="Hapus Unit"
                          style={{ color: 'var(--red)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ===== MODEL 2: VERTICAL CARD LIST VIEW (MOBILE / TABLET TEKNISI) ===== */
        <div className="technicianCardList">
          {data.map(({ v, p }) => {
            const statusClass = getStatusClass(p.status);
            const targetDateFormatted = new Date(p.targetDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <article key={v.id} className={`technicianCard ${statusClass}`}>
                {/* Header with Hull Number & Plate */}
                <div className="techCardHeader">
                  <div>
                    <div className="techHullAndPlate">
                      {v.hullNumber && <span className="techHullPill">{v.hullNumber}</span>}
                      <span className="techPlatePill">{v.plate}</span>
                    </div>
                    <h3 className="techCardName">{v.name}</h3>
                    <span className="techCategoryTag">{v.category || 'Alat-Alat Besar'}</span>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Body with High-Contrast Large Metrics for Outdoor Glare */}
                <div className="techCardBody">
                  <div className="techBigMetricGrid">
                    <div className="techMetricItem">
                      <span>ODOMETER SAAT INI</span>
                      <strong>{v.currentKm.toLocaleString('id-ID')} KM</strong>
                    </div>
                    <div className="techMetricItem">
                      <span>SISA JARAK SERVIS</span>
                      <strong
                        style={{
                          color:
                            p.status === 'OVERDUE'
                              ? 'var(--red)'
                              : p.status === 'WARNING'
                              ? 'var(--orange)'
                              : 'var(--green)',
                        }}
                      >
                        {p.remainingKm < 0
                          ? `Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`
                          : `${p.remainingKm.toLocaleString('id-ID')} KM`}
                      </strong>
                    </div>
                  </div>

                  <div className="techTimelineRow">
                    <span>
                      Target Servis: <strong>{p.targetKm.toLocaleString('id-ID')} KM</strong>
                    </span>
                    <span>
                      Jatuh Tempo: <strong>{targetDateFormatted}</strong>
                    </span>
                  </div>
                </div>

                {/* Tactile Skeuomorphic Button Footer */}
                <div className="techCardFooter">
                  <Link href={`/vehicles/${v.id}`} className="primaryButton">
                    <Wrench size={14} /> Detail & Servis
                  </Link>
                  <button
                    className="secondaryButton"
                    onClick={() => openEdit(v)}
                    style={{ flex: 'none', padding: '10px 14px' }}
                    title="Edit Unit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="secondaryButton"
                    onClick={() => setDeleteConfirm(v.id)}
                    style={{ flex: 'none', padding: '10px 14px', color: 'var(--red)' }}
                    title="Hapus Unit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <VehicleForm
          vehicle={editingVehicle ?? undefined}
          onSave={handleSaveVehicle}
          onCancel={closeForm}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="vehicleFormOverlay" onClick={() => setDeleteConfirm(null)}>
          <div className="deleteConfirmModal" onClick={e => e.stopPropagation()}>
            <h3>Hapus Unit A2B?</h3>
            <p>
              Unit <strong>{vehicleList.find(v => v.id === deleteConfirm)?.name}</strong> akan
              dihapus dari daftar armada aktif. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="deleteConfirmActions">
              <button className="secondaryButton" onClick={() => setDeleteConfirm(null)}>
                Batal
              </button>
              <button
                className="skeuoDangerBtn"
                onClick={() => handleDeleteVehicle(deleteConfirm)}
              >
                Hapus Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '34px' }}>Memuat daftar armada...</div>}>
      <VehiclesContent />
    </Suspense>
  );
}
