'use client';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Gauge, Wrench, TrendingUp, Clock3, Droplets, Save, RotateCcw, MessageCircle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import WeeklyChecklist from '@/components/WeeklyChecklist';
import RulesManager from '@/components/RulesManager';
import { maintenanceRecords as seedMaintenance, odometerHistory as seedHistory, rules, vehicles, weeklyChecklistRules, weeklyChecklistEntries as seedChecklistEntries, customRules as seedCustomRules } from '@/lib/demo-data';
import { projectMaintenance, getWaAlertUrl } from '@/lib/maintenance';
import { MaintenanceRecord, OdometerEntry, WeeklyChecklistEntry, CustomRule, DayOfWeek } from '@/lib/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

export default function VehicleDetailPage(){
  const params=useParams<{id:string}>(); const vehicle=vehicles.find(v=>v.id===params.id)??vehicles[0]; const rule=rules.find(r=>r.vehicleId===vehicle.id)!;
  const [maintenance,setMaintenance]=useState<MaintenanceRecord[]>(seedMaintenance.filter(m=>m.vehicleId===vehicle.id).sort((a,b)=>+new Date(b.date)-+new Date(a.date)));
  const [history,setHistory]=useState<OdometerEntry[]>(seedHistory.filter(o=>o.vehicleId===vehicle.id)); const [currentKm,setCurrentKm]=useState(vehicle.currentKm);
  const [inputKm,setInputKm]=useState(''); const [message,setMessage]=useState(''); const [oilLiters,setOilLiters]=useState(''); const [oilType,setOilType]=useState('15W-40 Diesel');
  const [checklistEntries, setChecklistEntries] = useState<WeeklyChecklistEntry[]>(seedChecklistEntries.filter(e=>e.vehicleId===vehicle.id));
  const [vehicleCustomRules, setVehicleCustomRules] = useState<CustomRule[]>(seedCustomRules.filter(r=>r.vehicleId===vehicle.id));
  const checklistRule = weeklyChecklistRules.find(r=>r.vehicleId===vehicle.id);
  const last=maintenance.find(m=>m.type==='GANTI_OLI')!; const p=useMemo(()=>projectMaintenance({currentKm,asOf:new Date().toISOString(),rule,lastMaintenance:last,odometerHistory:history}),[currentKm,history,rule,last]);
  const progress=Math.max(0,Math.min(100,((currentKm-last.km)/rule.intervalKm)*100));
  function submitKm(e:React.FormEvent){e.preventDefault();const km=Number(inputKm);if(!Number.isFinite(km)||km<currentKm){setMessage(`ERROR: KM baru tidak boleh lebih kecil dari ${currentKm.toLocaleString('id-ID')} KM.`);return}const entry:OdometerEntry={id:crypto.randomUUID(),vehicleId:vehicle.id,km,recordedAt:new Date().toISOString(),operator:'Operator Aktif'};setHistory(h=>[...h,entry]);setCurrentKm(km);setInputKm('');setMessage('OK: Odometer berhasil dicatat dan estimasi diperbarui.');}
  function recordOil(type:'GANTI_OLI'|'TAMBAH_OLI'){const liters=Number(oilLiters||0);const rec:MaintenanceRecord={id:crypto.randomUUID(),vehicleId:vehicle.id,ruleId:rule.id,type,km:currentKm,date:new Date().toISOString(),oilVolumeLiters:liters||undefined,oilType,operator:'Operator Aktif',notes:type==='GANTI_OLI'?'Maintenance dari halaman detail':'Penambahan oli'};setMaintenance(m=>[rec,...m]);setOilLiters('');setMessage(type==='GANTI_OLI'?'OK: Ganti oli dicatat. Target maintenance berikutnya dihitung dari KM aktual.':'OK: Penambahan oli dicatat.');}

  function handleChecklistComplete(day: DayOfWeek) {
    const entry: WeeklyChecklistEntry = {
      id: crypto.randomUUID(),
      ruleId: checklistRule?.id ?? '',
      vehicleId: vehicle.id,
      day,
      weekStart: getWeekStart(new Date()),
      completedAt: new Date().toISOString(),
      operator: 'Operator Aktif',
    };
    setChecklistEntries(prev => [...prev, entry]);
  }

  function handleAddRule(newRule: CustomRule) {
    setVehicleCustomRules(prev => [...prev, newRule]);
  }

  return <div className="page"><Link href="/vehicles" className="backLink"><ArrowLeft size={16}/>Kembali ke kendaraan</Link>
    <header className="detailHero">
      <div className="detailPhoto">{vehicle.brand}</div>
      <div className="grow">
        <p className="eyebrow">DETAIL KENDARAAN</p>
        <h1>{vehicle.name}</h1>
        <p>{vehicle.plate} • {vehicle.brand} {vehicle.model} • {vehicle.year}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        <StatusBadge status={p.status}/>
        {(p.status === 'WARNING' || p.status === 'OVERDUE') && (
          <a
            href={getWaAlertUrl(vehicle, p)}
            target="_blank"
            rel="noopener noreferrer"
            className={`waAlertBtn ${p.status === 'OVERDUE' ? 'overdue' : ''}`}
            title={`Kirim notifikasi WhatsApp maintenance untuk ${vehicle.name}`}
          >
            <MessageCircle size={15} />
            <span>WhatsApp Alert</span>
          </a>
        )}
      </div>
    </header>
    <section className="detailStats"><div><Gauge/><span>Odometer</span><strong>{currentKm.toLocaleString('id-ID')} KM</strong></div><div><Wrench/><span>Target KM</span><strong>{p.targetKm.toLocaleString('id-ID')} KM</strong></div><div><CalendarDays/><span>Target Tanggal</span><strong>{new Date(p.targetDate).toLocaleDateString('id-ID')}</strong></div><div><Clock3/><span>Driver Utama</span><strong>{p.trigger==='KM'?'Kilometer':p.trigger==='TIME'?'Waktu':'Belum cukup data'}</strong></div></section>

    {/* Weekly Checklist */}
    {checklistRule && (
      <section className="checklistSection">
        <WeeklyChecklist
          rule={checklistRule}
          entries={checklistEntries}
          onComplete={handleChecklistComplete}
        />
      </section>
    )}

    <section className="detailGrid">
      <div className="panel"><div className="panelHead"><div><p className="eyebrow">UPDATE DATA</p><h2>Input Odometer Baru</h2></div></div><form className="odometerForm" onSubmit={submitKm}><label>KM saat ini<input type="number" value={inputKm} onChange={e=>setInputKm(e.target.value)} placeholder={String(currentKm)}/></label><button className="primaryButton"><Save size={15}/>Simpan Odometer</button>{message&&<p className={`formMessage ${message.startsWith('ERROR')?'formError':''}`}>{message.replace(/^\w+:\s?/,'')}</p>}</form></div>
      <div className="panel"><div className="panelHead"><div><p className="eyebrow">PREDIKSI</p><h2>Maintenance Berikutnya</h2></div><TrendingUp size={18}/></div><div className="prediction"><div><span>Sisa KM</span><strong>{p.remainingKm<0?`Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`:`${p.remainingKm.toLocaleString('id-ID')} KM`}</strong></div><div><span>Sisa Waktu</span><strong>{p.remainingDays<0?`Lewat ${Math.abs(p.remainingDays)} hari`:`${p.remainingDays} hari`}</strong></div><div><span>Rata-rata</span><strong>{p.averageKmPerDay?`${p.averageKmPerDay.toFixed(1)} KM/hari`:'Belum cukup data'}</strong></div><div><span>Estimasi via KM</span><strong>{p.estimatedDaysByKm!==null?`${p.estimatedDaysByKm} hari`:'Belum tersedia'}</strong></div><div className="predictionNote">Batas yang diperkirakan tercapai lebih dulu: <b>{p.trigger==='KM'?'kilometer':p.trigger==='TIME'?'waktu':'belum diketahui'}</b>. Sistem selalu membandingkan kedua batas.</div></div></div>

      {/* Rules Manager */}
      <RulesManager
        vehicleId={vehicle.id}
        rules={vehicleCustomRules}
        onAddRule={handleAddRule}
      />

      <div className="panel"><div className="panelHead"><div><p className="eyebrow">AKSI PERAWATAN</p><h2>Catat Oli</h2></div><Droplets size={18}/></div><div className="odometerForm"><label>Volume oli (liter)<input value={oilLiters} onChange={e=>setOilLiters(e.target.value)} placeholder="Contoh: 7" inputMode="decimal"/></label><label>Jenis oli<input value={oilType} onChange={e=>setOilType(e.target.value)}/></label><div className="recordActions"><button type="button" className="primaryButton" onClick={()=>recordOil('GANTI_OLI')}><RotateCcw size={15}/>Ganti Oli</button><button type="button" className="secondaryButton" onClick={()=>recordOil('TAMBAH_OLI')}><Droplets size={15}/>Tambah Oli</button></div></div></div>
      <div className="panel"><div className="panelHead"><div><p className="eyebrow">RIWAYAT</p><h2>Odometer</h2></div></div><div className="historyList">{[...history].sort((a,b)=>+new Date(b.recordedAt)-+new Date(a.recordedAt)).slice(0,7).map(o=><div key={o.id}><div><strong>{o.km.toLocaleString('id-ID')} KM</strong><span>{o.operator}</span></div><time>{new Date(o.recordedAt).toLocaleDateString('id-ID')}</time></div>)}</div></div>
      <div className="panel spanFull"><div className="panelHead"><div><p className="eyebrow">PERAWATAN</p><h2>Riwayat Maintenance & Oli</h2></div></div><div className="historyList">{maintenance.map(m=><div key={m.id}><div><strong>{m.type.replace('_',' ')}</strong><span>{m.km.toLocaleString('id-ID')} KM • {m.oilVolumeLiters??'-'} L • {m.oilType??'-'} • {m.operator}</span></div><time>{new Date(m.date).toLocaleDateString('id-ID')}</time></div>)}</div></div>
    </section>
  </div>
}
