# Airport Mechanical — Vehicle Oil Maintenance

Prototype web app responsive untuk preventive maintenance kendaraan operasional.

## Fokus versi ini

- Dashboard operasional dengan prioritas maintenance yang jelas
- Status: Aman, Peringatan, Waktunya Servis, Terlambat
- Maintenance ganti oli berbasis **KM + waktu** (mana yang tercapai lebih dulu)
- Input odometer manual + validasi KM tidak boleh turun
- Rolling average pemakaian KM/hari dari histori odometer
- Estimasi sisa KM, sisa hari, dan prediksi tanggal maintenance
- Riwayat ganti oli / tambah oli
- Light mode & dark mode
- Responsive desktop/laptop dan Android/mobile
- Manifest web app untuk pengalaman "Add to Home Screen"
- Struktur siap dikembangkan ke Supabase + Vercel + WhatsApp API

## Design direction

Desain sengaja dibuat tidak terlalu futuristik: navy/sky-teal untuk kepercayaan dan operasional, off-white untuk readability, amber untuk perhatian, hijau untuk aman, merah terbatas untuk keterlambatan. Layout menggunakan pola dashboard kerja manusia: informasi penting terlihat dulu, detail teknis masuk ke halaman kendaraan.

## Jalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Production target

- Frontend: Vercel
- Database/Auth: Supabase
- Scheduled maintenance check: Supabase Cron / Edge Function
- Notification: WhatsApp Business Platform/API resmi

## Catatan verifikasi build

Source sudah dirapikan, tetapi dependency install pada environment ChatGPT ini mengalami timeout sehingga `next build` belum dapat dijalankan di environment ini. Jalankan `npm install && npm run build` setelah mengekstrak ZIP untuk verifikasi akhir di mesin lokal.
