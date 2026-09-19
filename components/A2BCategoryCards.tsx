'use client';

import Link from 'next/link';
import {
  Truck,
  Flame,
  Luggage,
  Compass,
  Zap,
  Accessibility,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Vehicle, MaintenanceProjection } from '@/lib/types';

interface CategoryCardsProps {
  vehicles: Vehicle[];
  projections: Map<string, MaintenanceProjection>;
}

export default function A2BCategoryCards({ vehicles, projections }: CategoryCardsProps) {
  // Aggregate by category
  const categoriesDef = [
    {
      name: 'Pushback Tug',
      desc: 'Penarik & pendorong pesawat di apron',
      icon: Truck,
      color: '#0284c7',
      bgLight: '#e0f2fe',
    },
    {
      name: 'Fire Truck PKP-PK',
      desc: 'Kendaraan pemadam & darurat ARFF',
      icon: Flame,
      color: '#dc2626',
      bgLight: '#fee2e2',
    },
    {
      name: 'Baggage Towing',
      desc: 'Traktor pengangkut bagasi & kargo',
      icon: Luggage,
      color: '#d97706',
      bgLight: '#fef3c7',
    },
    {
      name: 'Airside Ops',
      desc: 'Patroli runway & follow-me car',
      icon: Compass,
      color: '#059669',
      bgLight: '#d1fae5',
    },
    {
      name: 'GPU / Genset',
      desc: 'Ground power unit suplai listrik',
      icon: Zap,
      color: '#7c3aed',
      bgLight: '#ede9fe',
    },
    {
      name: 'Garbarata / Ambulift',
      desc: 'Tangga penumpang & boarding medis',
      icon: Accessibility,
      color: '#0891b2',
      bgLight: '#cffafe',
    },
  ];

  const categoryStats = categoriesDef.map(cat => {
    const matchingVehicles = vehicles.filter(
      v => v.category?.toLowerCase() === cat.name.toLowerCase()
    );
    const total = matchingVehicles.length;
    const ready = matchingVehicles.filter(v => {
      const p = projections.get(v.id);
      return p ? p.status === 'NORMAL' : true;
    }).length;
    const hasIssue = matchingVehicles.some(v => {
      const p = projections.get(v.id);
      return p ? p.status === 'WARNING' || p.status === 'OVERDUE' : false;
    });

    return {
      ...cat,
      total,
      ready,
      hasIssue,
      matchingVehicles,
    };
  });

  return (
    <div className="bentoCategoryGrid">
      {categoryStats.map(cat => {
        const IconComponent = cat.icon;
        const targetUrl = `/vehicles?category=${encodeURIComponent(cat.name)}`;

        return (
          <Link
            key={cat.name}
            href={targetUrl}
            className="categoryBentoCard"
            title={`Lihat seluruh armada ${cat.name}`}
          >
            <div className="categoryCardHeader">
              <div
                className="categoryIconWrapper"
                style={{ color: cat.color, backgroundColor: cat.bgLight }}
              >
                <IconComponent size={20} />
              </div>
              <span className="categoryArrow">
                <ArrowUpRight size={15} />
              </span>
            </div>

            <div className="categoryCardBody">
              <h3 className="categoryName">{cat.name}</h3>
              <p className="categoryDesc">{cat.desc}</p>
            </div>

            <div className="categoryCardFooter">
              <div className="categoryCountBlock">
                <strong className="categoryCountNumber">{cat.total}</strong>
                <span className="categoryCountLabel">Unit</span>
              </div>

              {cat.total > 0 ? (
                <div
                  className={`categoryReadinessPill ${cat.hasIssue ? 'pillNotice' : 'pillSafe'}`}
                >
                  {cat.hasIssue ? <AlertTriangle size={12} /> : <ShieldCheck size={12} />}
                  <span>{cat.ready}/{cat.total} Siaga</span>
                </div>
              ) : (
                <span className="categoryEmptyLabel">Belum ada unit</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
