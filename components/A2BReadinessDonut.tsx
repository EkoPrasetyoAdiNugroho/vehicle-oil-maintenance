'use client';

import Link from 'next/link';
import { ShieldCheck, AlertTriangle, AlertOctagon, ArrowRight, Wrench } from 'lucide-react';

interface ReadinessDonutProps {
  readyCount: number;
  maintenanceCount: number;
  breakdownCount: number;
  totalCount: number;
  urgentUnits?: Array<{
    id: string;
    name: string;
    hullNumber?: string;
    plate: string;
    status: 'WARNING' | 'OVERDUE';
    reason: string;
  }>;
}

export default function A2BReadinessDonut({
  readyCount,
  maintenanceCount,
  breakdownCount,
  totalCount,
  urgentUnits = [],
}: ReadinessDonutProps) {
  const readyPct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
  const maintPct = totalCount > 0 ? Math.round((maintenanceCount / totalCount) * 100) : 0;
  const breakdownPct = totalCount > 0 ? Math.round((breakdownCount / totalCount) * 100) : 0;

  // SVG Donut metrics
  const radius = 68;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  // Slices
  const readyStroke = (readyCount / (totalCount || 1)) * circumference;
  const maintStroke = (maintenanceCount / (totalCount || 1)) * circumference;
  const breakdownStroke = (breakdownCount / (totalCount || 1)) * circumference;

  const readyOffset = 0;
  const maintOffset = -readyStroke;
  const breakdownOffset = -(readyStroke + maintStroke);

  return (
    <div className="a2bDonutCard">
      <div className="donutHeader">
        <div>
          <span className="eyebrow" style={{ color: 'var(--teal)' }}>KESIAPAN ALAT-ALAT BESAR (A2B)</span>
          <h2 className="donutTitle">Status Kesiapan Armada Apron</h2>
        </div>
        <div className="readinessBadge">
          <ShieldCheck size={16} />
          <span>{readyPct}% Siaga</span>
        </div>
      </div>

      <div className="donutBody">
        {/* SVG Donut Chart */}
        <div className="donutChartWrap">
          <svg className="donutSvg" width="180" height="180" viewBox="0 0 180 180">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
            />
            {/* Ready Slice (Green) */}
            {readyStroke > 0 && (
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                strokeDasharray={`${readyStroke} ${circumference}`}
                strokeDashoffset={readyOffset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            )}
            {/* Maintenance Slice (Amber) */}
            {maintStroke > 0 && (
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${maintStroke} ${circumference}`}
                strokeDashoffset={maintOffset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            )}
            {/* Breakdown Slice (Red) */}
            {breakdownStroke > 0 && (
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeDasharray={`${breakdownStroke} ${circumference}`}
                strokeDashoffset={breakdownOffset}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
            )}
          </svg>

          <div className="donutCenterContent">
            <span className="donutPctNumber">{readyPct}%</span>
            <span className="donutPctLabel">READY</span>
            <span className="donutUnitRatio">{readyCount} / {totalCount} Unit</span>
          </div>
        </div>

        {/* Legend & Breakdown stats */}
        <div className="donutLegend">
          <div className="legendItem ready">
            <div className="legendLeft">
              <span className="legendDot readyDot" />
              <div>
                <strong>Ready / Siaga</strong>
                <p>Layak operasi penuh di apron</p>
              </div>
            </div>
            <div className="legendCount">
              <strong>{readyCount}</strong>
              <small>{readyPct}%</small>
            </div>
          </div>

          <div className="legendItem maintenance">
            <div className="legendLeft">
              <span className="legendDot maintDot" />
              <div>
                <strong>Maintenance</strong>
                <p>Peringatan / jadwal ganti oli</p>
              </div>
            </div>
            <div className="legendCount">
              <strong>{maintenanceCount}</strong>
              <small>{maintPct}%</small>
            </div>
          </div>

          <div className="legendItem breakdown">
            <div className="legendLeft">
              <span className="legendDot breakDot" />
              <div>
                <strong>Breakdown</strong>
                <p>Terlambat servis / perlu perbaikan</p>
              </div>
            </div>
            <div className="legendCount">
              <strong>{breakdownCount}</strong>
              <small>{breakdownPct}%</small>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Units Alert List */}
      {urgentUnits.length > 0 && (
        <div className="urgentNoticeBox">
          <div className="urgentNoticeHead">
            <span className="urgentNoticeTitle">
              <AlertTriangle size={15} /> Unit Perlu Tindakan ({urgentUnits.length})
            </span>
            <Link href="/vehicles" className="urgentNoticeLink">
              Kelola Armada <ArrowRight size={12} />
            </Link>
          </div>
          <div className="urgentUnitsList">
            {urgentUnits.map(unit => (
              <Link
                key={unit.id}
                href={`/vehicles/${unit.id}`}
                className={`urgentUnitChip ${unit.status === 'OVERDUE' ? 'chipBreakdown' : 'chipWarning'}`}
                title="Klik untuk detail kendaraan"
              >
                <div className="chipIcon">
                  {unit.status === 'OVERDUE' ? <AlertOctagon size={13} /> : <Wrench size={13} />}
                </div>
                <div className="chipInfo">
                  <span className="chipName">
                    {unit.hullNumber ? `[${unit.hullNumber}] ` : ''}{unit.name}
                  </span>
                  <span className="chipReason">{unit.reason}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
