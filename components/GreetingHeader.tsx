'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Calendar, Clock, Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';

interface GreetingHeaderProps {
  userName?: string;
  children?: ReactNode;
}

export default function GreetingHeader({ userName = 'Operator', children }: GreetingHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = (d: Date | null) => {
    if (!d) {
      return {
        text: 'Selamat Datang',
        sub: 'Pantau kesiapan dan jadwal servis berkala armada Anda hari ini.',
        icon: Sparkles,
        color: '#f59e0b',
      };
    }
    const h = d.getHours();
    const m = d.getMinutes();
    const totalMin = h * 60 + m;

    if (totalMin >= 240 && totalMin < 660) {
      // 04:00 - 10:59
      return {
        text: 'Selamat Pagi',
        sub: 'Awali hari dengan memeriksa status armada dan kesiapan operasional.',
        icon: Sunrise,
        color: '#f59e0b',
      };
    } else if (totalMin >= 660 && totalMin < 900) {
      // 11:00 - 14:59
      return {
        text: 'Selamat Siang',
        sub: 'Cek pembaharuan odometer dan pastikan tidak ada jadwal servis yang terlewat.',
        icon: Sun,
        color: '#eab308',
      };
    } else if (totalMin >= 900 && totalMin < 1110) {
      // 15:00 - 18:29
      return {
        text: 'Selamat Sore',
        sub: 'Tinjau penyelesaian checklist harian dan kebutuhan servis mendesak.',
        icon: Sunset,
        color: '#f97316',
      };
    } else {
      // 18:30 - 03:59
      return {
        text: 'Selamat Malam',
        sub: 'Monitoring berkala kesiapan armada untuk kelancaran tugas shift malam.',
        icon: Moon,
        color: '#818cf8',
      };
    }
  };

  const { text: greetingText, sub: greetingSub, icon: GreetingIcon, color: iconColor } = getGreeting(currentTime);

  const formattedDate = mounted && currentTime
    ? currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Memuat tanggal...';

  const formattedTime = mounted && currentTime
    ? currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB'
    : '--:--:-- WIB';

  return (
    <div className="greetingCard">
      <div className="greetingMain">
        <div className="greetingIconBox" style={{ color: iconColor }}>
          <GreetingIcon size={26} />
        </div>
        <div>
          <div className="greetingBadgeRow">
            <span className="eyebrow" style={{ margin: 0 }}>AIRPORT MECHANICAL</span>
            <span className="liveStatusPill">
              <span className="pulseDot" />
              <span>Shift Aktif</span>
            </span>
          </div>
          <h1 className="greetingTitle">
            {greetingText}, <span className="greetingName">{userName}</span> 👋
          </h1>
          <p className="greetingSub">{greetingSub}</p>
        </div>
      </div>

      <div className="greetingRight">
        <div className="greetingDateTime">
          <div className="datePill">
            <Calendar size={15} />
            <strong>{formattedDate}</strong>
          </div>
          <div className="timePill">
            <Clock size={14} />
            <span>{formattedTime}</span>
          </div>
        </div>
        {children && <div className="greetingCustomActions">{children}</div>}
      </div>
    </div>
  );
}
