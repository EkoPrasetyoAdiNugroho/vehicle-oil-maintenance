'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function TopBarDate() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !time) {
    return (
      <div className="topBarDate skeleton">
        <Calendar size={14} />
        <span>Memuat tanggal...</span>
      </div>
    );
  }

  const dateStr = time.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="topBarDate" title="Tanggal & Waktu Operasional">
      <span className="topBarDateBadge">
        <Calendar size={13} />
        <span>{dateStr}</span>
      </span>
      <span className="topBarTimeBadge">
        <Clock size={13} />
        <span>{timeStr} WIB</span>
      </span>
    </div>
  );
}
