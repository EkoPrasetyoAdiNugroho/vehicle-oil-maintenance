import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import TopBarDate from '@/components/TopBarDate';
import { Bell, Wifi } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Airport Mechanical Maintenance',
  description: 'Preventive maintenance kendaraan berbasis KM dan waktu',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Maintenance', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#0b2942',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <div className="appShell">
          <Sidebar/>
          <main className="mainContent">
            <div className="topBar">
              <div className="topBarLeft">
                <div className="connection"><Wifi size={15}/><span>System Online</span></div>
                <TopBarDate/>
              </div>
              <div className="topActions">
                <button className="iconButton" aria-label="Notifikasi"><Bell size={18}/><b className="notifDot"/></button>
                <ThemeToggle/>
                <div className="userChip"><div>OP</div><span><strong>Operator</strong></span></div>
              </div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
