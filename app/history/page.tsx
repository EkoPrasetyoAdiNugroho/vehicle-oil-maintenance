'use client';

import { useMemo, useState } from 'react';
import {
  History,
  Printer,
  Calendar,
  Search,
  Filter,
  Truck,
  Wrench,
  Gauge,
  CheckCircle2,
  Droplets,
  RotateCcw,
  FileDown,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  getStoredVehicles,
  getStoredMaintenance,
  getStoredOdometer,
  getStoredChecklistEntries,
} from '@/lib/storage';
import { buildHistoryActivities, filterActivities } from '@/lib/history';
import { HistoryActivity, HistoryActivityType, HistoryTimeRange, Vehicle } from '@/lib/types';
import { useEffect } from 'react';

export default function HistoryPage() {
  const [timeRange, setTimeRange] = useState<HistoryTimeRange>('WEEK');
  const [vehicleId, setVehicleId] = useState<string>('ALL');
  const [activityType, setActivityType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [allActivities, setAllActivities] = useState<HistoryActivity[]>([]);

  // Use current date for reference
  const referenceDate = useMemo(() => new Date(), []);

  // Build activities from storage
  useEffect(() => {
    const refreshData = () => {
      const v = getStoredVehicles();
      const m = getStoredMaintenance();
      const o = getStoredOdometer();
      const c = getStoredChecklistEntries();
      setVehiclesList(v);
      setAllActivities(buildHistoryActivities(v, m, o, c));
    };
    refreshData();
    window.addEventListener('a2b_storage_update', refreshData);
    return () => window.removeEventListener('a2b_storage_update', refreshData);
  }, []);

  // Filter activities
  const filteredActivities = useMemo(
    () =>
      filterActivities(allActivities, {
        timeRange,
        vehicleId,
        activityType,
        searchQuery,
        referenceDate,
      }),
    [allActivities, timeRange, vehicleId, activityType, searchQuery, referenceDate]
  );

  // Stats calculation
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const oilChanges = filteredActivities.filter(
      a => a.type === 'GANTI_OLI' || a.type === 'TAMBAH_OLI'
    ).length;
    const odoUpdates = filteredActivities.filter(a => a.type === 'ODOMETER').length;
    const checklists = filteredActivities.filter(a => a.type === 'CHECKLIST').length;
    return { total, oilChanges, odoUpdates, checklists };
  }, [filteredActivities]);

  // Handle Print / Export PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Reset filters
  const handleResetFilters = () => {
    setTimeRange('ALL');
    setVehicleId('ALL');
    setActivityType('ALL');
    setSearchQuery('');
  };

  const getTimeRangeLabel = (range: HistoryTimeRange) => {
    switch (range) {
      case 'TODAY':
        return 'Hari Ini';
      case 'WEEK':
        return 'Minggu Ini (7 Hari Terakhir)';
      case 'MONTH':
        return 'Bulan Ini (30 Hari Terakhir)';
      case 'ALL':
        return 'Semua Periode Riwayat';
    }
  };

  const getActivityBadge = (type: HistoryActivityType) => {
    switch (type) {
      case 'GANTI_OLI':
        return {
          label: 'Ganti Oli Berkala',
          className: 'historyBadge oilChange',
          icon: Wrench,
        };
      case 'TAMBAH_OLI':
        return {
          label: 'Tambah Oli (Top-Up)',
          className: 'historyBadge oilTopup',
          icon: Droplets,
        };
      case 'ODOMETER':
        return {
          label: 'Input Odometer',
          className: 'historyBadge odometer',
          icon: Gauge,
        };
      case 'CHECKLIST':
        return {
          label: 'Inspeksi Fisik',
          className: 'historyBadge checklist',
          icon: CheckCircle2,
        };
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  const nowFormatted = referenceDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page historyPage">
      {/* Printable Report Header (Visible only when printing/exporting to PDF) */}
      <div className="printOnly printHeader">
        <div className="printHeaderGov">
          <h3>KEMENTERIAN PERHUBUNGAN</h3>
          <h4>DIREKTORAT JENDERAL PERHUBUNGAN UDARA</h4>
          <h5>KANTOR UPBU KELAS III BANDAR UDARA NAMNIWEL</h5>
          <p className="printSubDept">UNIT TEKNIK & PEMELIHARAAN ALAT-ALAT BESAR (A2B)</p>
        </div>
        <hr className="printDivider" />
        <div className="printDocTitleBlock">
          <h2>LAPORAN RIWAYAT PEMELIHARAAN & OPERASIONAL KENDARAAN</h2>
          <div className="printDocMetaGrid">
            <span><strong>Bandara:</strong> Namniwel (WAPG / NRE)</span>
            <span><strong>Periode:</strong> {getTimeRangeLabel(timeRange)}</span>
            <span><strong>Tanggal Cetak:</strong> {nowFormatted}</span>
            <span><strong>Total Data:</strong> {filteredActivities.length} Baris</span>
          </div>
        </div>
      </div>

      {/* Screen Header (Hidden on Print) */}
      <header className="pageHeader noPrint">
        <div>
          <p className="eyebrow">LOG AKTIVITAS & AUDIT TRAIL</p>
          <h1 className="pageTitleWithIcon">
            <History size={28} className="titleIcon" />
            Riwayat Operasional
          </h1>
          <p>
            Catatan komprehensif seluruh aktivitas ganti oli, penambahan oli, update pembacaan
            odometer, dan inspeksi checklist armada.
          </p>
        </div>
        <div className="headerActions">
          <button
            className="primaryButton"
            onClick={handleExportPDF}
            title="Ekspor laporan riwayat ke dokumen PDF"
          >
            <Printer size={16} />
            <span>Export PDF / Cetak</span>
          </button>
        </div>
      </header>

      {/* Time Range Selector Tabs (Hidden on Print) */}
      <section className="timeRangeSelectorSection noPrint">
        <div className="timeRangeLabel">
          <Calendar size={16} />
          <span>Pilih Rentang Periode:</span>
        </div>
        <div className="timeRangeTabs">
          <button
            type="button"
            className={`timeTab ${timeRange === 'TODAY' ? 'active' : ''}`}
            onClick={() => setTimeRange('TODAY')}
          >
            Hari Ini
          </button>
          <button
            type="button"
            className={`timeTab ${timeRange === 'WEEK' ? 'active' : ''}`}
            onClick={() => setTimeRange('WEEK')}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            className={`timeTab ${timeRange === 'MONTH' ? 'active' : ''}`}
            onClick={() => setTimeRange('MONTH')}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            className={`timeTab ${timeRange === 'ALL' ? 'active' : ''}`}
            onClick={() => setTimeRange('ALL')}
          >
            Semua Riwayat
          </button>
        </div>
        <span className="currentRangeIndicator">
          Menampilkan: <strong>{getTimeRangeLabel(timeRange)}</strong>
        </span>
      </section>

      {/* Stats Cards (Screen Only - Hidden on Print) */}
      <section className="statsGrid historyStatsGrid noPrint">
        <div className="statCard">
          <div>
            <History size={20} />
          </div>
          <div>
            <span>Total Catatan</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className="statCard success">
          <div>
            <Wrench size={20} />
          </div>
          <div>
            <span>Servis / Oli</span>
            <strong>{stats.oilChanges}</strong>
          </div>
        </div>
        <div className="statCard">
          <div>
            <Gauge size={20} />
          </div>
          <div>
            <span>Update Odometer</span>
            <strong>{stats.odoUpdates}</strong>
          </div>
        </div>
        <div className="statCard warning">
          <div>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Inspeksi Checklist</span>
            <strong>{stats.checklists}</strong>
          </div>
        </div>
      </section>

      {/* Filter Toolbar (Hidden on Print) */}
      <section className="toolbar historyToolbar noPrint">
        <div className="searchWrap">
          <Search size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari armada, plat nomor, operator, tipe oli, atau catatan..."
          />
        </div>

        <select
          value={vehicleId}
          onChange={e => setVehicleId(e.target.value)}
          aria-label="Filter Kendaraan"
        >
          <option value="ALL">Semua Kendaraan</option>
          {vehiclesList.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.plate})
            </option>
          ))}
        </select>

        <select
          value={activityType}
          onChange={e => setActivityType(e.target.value)}
          aria-label="Filter Jenis Aktivitas"
        >
          <option value="ALL">Semua Aktivitas</option>
          <option value="GANTI_OLI">Ganti Oli Berkala</option>
          <option value="TAMBAH_OLI">Tambah Oli (Top-Up)</option>
          <option value="ODOMETER">Update Odometer</option>
          <option value="CHECKLIST">Inspeksi Mingguan</option>
        </select>

        {(timeRange !== 'ALL' || vehicleId !== 'ALL' || activityType !== 'ALL' || searchQuery) && (
          <button
            type="button"
            className="secondaryButton resetBtn"
            onClick={handleResetFilters}
            title="Reset semua filter"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </section>

      {/* Main Table Panel */}
      <section className="panel historyTablePanel">
        <div className="panelHead noPrint">
          <div>
            <p className="eyebrow">DAFTAR AKTIVITAS</p>
            <h2>Log Riwayat Terperinci ({filteredActivities.length} data)</h2>
          </div>
          <span className="panelSubText">
            Data tersinkronisasi otomatis dari catatan servis dan operator
          </span>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="emptyHistory">
            <Info size={40} className="emptyIcon" />
            <h3>Tidak Ada Riwayat Pada Periode Ini</h3>
            <p>
              Tidak ditemukan aktivitas yang sesuai dengan filter rentang waktu atau kata kunci yang
              dipilih.
            </p>
            <button className="primaryButton" onClick={handleResetFilters}>
              Tampilkan Semua Riwayat
            </button>
          </div>
        ) : (
          <div className="historyTableWrapper">
            <table className="historyTable">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No</th>
                  <th style={{ width: '150px' }}>Waktu & Tanggal</th>
                  <th style={{ width: '220px' }}>Kendaraan & Plat</th>
                  <th style={{ width: '180px' }}>Jenis Kegiatan</th>
                  <th>Rincian Teknis & Catatan</th>
                  <th style={{ width: '130px' }}>KM Tercatat</th>
                  <th style={{ width: '130px' }}>Petugas/Operator</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act, idx) => {
                  const { dateStr, timeStr } = formatDateTime(act.timestamp);
                  const badge = getActivityBadge(act.type);
                  const BadgeIcon = badge.icon;

                  return (
                    <tr key={act.id}>
                      <td className="centerCol textMuted">{idx + 1}</td>
                      <td>
                        <div className="dateTimeCol">
                          <strong className="tableDate">{dateStr}</strong>
                          <span className="tableTime">
                            <Clock size={11} /> {timeStr} WIT
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="vehicleCol">
                          <strong>{act.vehicleName}</strong>
                          <span className="plateBadge">{act.plate}</span>
                        </div>
                      </td>
                      <td>
                        <span className={badge.className}>
                          <BadgeIcon size={12} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td>
                        <div className="detailsCol">
                          <span className="actTitle">{act.title}</span>
                          {act.oilType && (
                            <span className="techDetail">
                              <strong>Oli:</strong> {act.oilType}
                              {act.oilVolumeLiters ? ` (${act.oilVolumeLiters} L)` : ''}
                            </span>
                          )}
                          {act.deltaKm !== undefined && (
                            <span className="techDetail deltaKm">
                              <strong>Kenaikan:</strong> +{act.deltaKm.toLocaleString('id-ID')} KM
                            </span>
                          )}
                          {act.notes && <span className="actNotes">{act.notes}</span>}
                        </div>
                      </td>
                      <td>
                        {act.km !== undefined ? (
                          <div className="kmCol">
                            <strong>{act.km.toLocaleString('id-ID')}</strong>
                            <span>KM</span>
                          </div>
                        ) : (
                          <span className="textMuted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="operatorCol">
                          <div className="operatorAvatar">
                            {act.operator.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{act.operator}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Printable Report Footer & Signature (Visible only when printing/exporting to PDF) */}
      <div className="printOnly printFooter">
        <div className="signatureGrid">
          <div className="signatureBox">
            <p>Dicatat & Dilaporkan Oleh:</p>
            <div className="signatureSpace" />
            <strong>Petugas Operator Lapangan</strong>
            <span>Bandar Udara Namniwel</span>
          </div>
          <div className="signatureBox">
            <p>Diperiksa & Disetujui Oleh:</p>
            <div className="signatureSpace" />
            <strong>Supervisor Airport Mechanical</strong>
            <span>NIP / ID: .......................................</span>
          </div>
        </div>
        <p className="printDisclaimer">
          Dokumen resmi Laporan Pemeliharaan Kendaraan Operasional — UPBU Kelas III Bandar Udara Namniwel.
        </p>
      </div>
    </div>
  );
}
