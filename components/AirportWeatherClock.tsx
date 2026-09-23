'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  Wind,
  Thermometer,
  Eye,
  Plane,
  CloudSun,
  Radio,
  Compass,
} from 'lucide-react';

export default function AirportWeatherClock() {
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

  // Format local WIT (Maluku timezone UTC+9)
  const witTime = mounted && time
    ? time.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jayapura',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  // Format UTC / Zulu
  const utcHours = mounted && time ? String(time.getUTCHours()).padStart(2, '0') : '--';
  const utcMinutes = mounted && time ? String(time.getUTCMinutes()).padStart(2, '0') : '--';
  const utcSeconds = mounted && time ? String(time.getUTCSeconds()).padStart(2, '0') : '--';
  const zuluTime = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;

  return (
    <div className="airportWeatherCard">
      {/* Airport Dual Clock Section */}
      <div className="airportClockHeader">
        <div className="stationMeta">
          <span className="stationCode">
            <Radio size={13} className="radarPulse" /> WAPG / NRE
          </span>
          <span className="stationName">Bandar Udara Namniwel</span>
        </div>
        <div className="flightConditionBadge">
          <Plane size={13} />
          <span>VFR • Normal Ops</span>
        </div>
      </div>

      <div className="dualClockRow">
        <div className="clockBlock witBlock">
          <span className="clockTag">WAKTU LOKAL (WIT)</span>
          <div className="clockTimeDisplay">
            <Clock size={16} />
            <strong>{witTime}</strong>
          </div>
        </div>
        <div className="clockBlock zuluBlock">
          <span className="clockTag">ZULU / AVIATION (UTC)</span>
          <div className="clockTimeDisplay">
            <Compass size={16} />
            <strong>{zuluTime}</strong>
          </div>
        </div>
      </div>

      <hr className="weatherCardDivider" />

      {/* Weather & Apron Conditions Section */}
      <div className="weatherContent">
        <div className="weatherMain">
          <div className="weatherIconBox">
            <CloudSun size={28} />
          </div>
          <div>
            <div className="tempRow">
              <span className="currentTemp">30°C</span>
              <span className="weatherCond">Cerah Berawan</span>
            </div>
            <span className="surfaceStatus">Apron & Runway: <strong>DRY / KERING</strong></span>
          </div>
        </div>

        <div className="weatherMetricsGrid">
          <div className="weatherMetricItem">
            <Wind size={15} />
            <div>
              <span className="metricLabel">Kecepatan Angin</span>
              <strong className="metricValue">08 kts (060° ENE)</strong>
            </div>
          </div>

          <div className="weatherMetricItem">
            <Eye size={15} />
            <div>
              <span className="metricLabel">Jarak Pandang</span>
              <strong className="metricValue">&gt; 10 KM (Clear)</strong>
            </div>
          </div>

          <div className="weatherMetricItem">
            <Thermometer size={15} />
            <div>
              <span className="metricLabel">Tekanan / QNH</span>
              <strong className="metricValue">1011 hPa</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
