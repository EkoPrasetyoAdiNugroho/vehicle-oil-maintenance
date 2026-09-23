'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Truck, Wrench, PlaneTakeoff, ShieldCheck, History } from 'lucide-react';

export default function Sidebar() {
  const path = usePathname();
  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Kendaraan', icon: Truck },
    { href: '/history', label: 'Riwayat', icon: History },
  ];
  return <>
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark"><PlaneTakeoff size={21}/></div>
        <div><strong>Airport Mechanical</strong><span>Vehicle Maintenance</span></div>
      </div>
      <div className="sidebarSectionLabel">OPERASIONAL</div>
      <nav>{items.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={path.startsWith(href) ? 'navItem active' : 'navItem'}><Icon size={18}/><span>{label}</span></Link>)}</nav>
      <div className="sideFeature">
        <ShieldCheck size={18}/><div><strong>Preventive Care</strong><span>KM + waktu dipantau bersamaan</span></div>
      </div>
      <div className="sidebarFoot"><small>MSBU GROUP</small><strong>Bandar Udara Namniwel</strong><span>Prototype • Supabase Ready</span></div>
    </aside>
    <nav className="mobileNav">
      {items.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={path.startsWith(href) ? 'mobileNavItem active' : 'mobileNavItem'}><Icon size={20}/><span>{label}</span></Link>)}
    </nav>
  </>;
}
