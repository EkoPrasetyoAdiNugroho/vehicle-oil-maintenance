import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { Vehicle, MaintenanceProjection } from '@/lib/types';
import { Gauge, CalendarDays, ArrowUpRight, Activity, Pencil, Trash2 } from 'lucide-react';

const gradients: Record<string,string> = {
  Toyota:'linear-gradient(135deg,#d7e7ee,#9fc4ce)', Isuzu:'linear-gradient(135deg,#dce8f2,#a8bfd5)', Mitsubishi:'linear-gradient(135deg,#e8e8e8,#bec4c8)', Daihatsu:'linear-gradient(135deg,#e6edf0,#b8cbd1)'
};

const statusLabels: Record<string,string> = { WARNING:'Peringatan', OVERDUE:'Terlambat' };

function buildWaMessage(v: Vehicle, p: MaintenanceProjection) {
  const icon = p.status === 'OVERDUE' ? '[TERLAMBAT]' : '[PERINGATAN]';
  const label = statusLabels[p.status] ?? '';
  const sisaKm = p.remainingKm < 0
    ? `Lewat ${Math.abs(p.remainingKm).toLocaleString('id-ID')} KM`
    : `${p.remainingKm.toLocaleString('id-ID')} KM`;
  const msg = `${icon} *${label.toUpperCase()} MAINTENANCE*

Kendaraan: *${v.name}*
Plat: ${v.plate}
Merek: ${v.brand} ${v.model} (${v.year})
Odometer: ${v.currentKm.toLocaleString('id-ID')} KM
Target Servis: ${p.targetKm.toLocaleString('id-ID')} KM
Sisa: ${sisaKm}
Sisa Waktu: ${p.remainingDays < 0 ? 'Lewat ' + Math.abs(p.remainingDays) + ' hari' : p.remainingDays + ' hari'}

Segera jadwalkan perawatan.`;
  return encodeURIComponent(msg);
}

export default function VehicleCard({vehicle, projection, onEdit, onDelete}:{vehicle:Vehicle; projection:MaintenanceProjection; onEdit?:()=>void; onDelete?:()=>void}) {
  const bg = vehicle.image
    ? undefined
    : gradients[vehicle.brand] || 'linear-gradient(135deg,#dde6ec,#b0c4cc)';

  const showWa = projection.status === 'WARNING' || projection.status === 'OVERDUE';

  return <article className="vehicleCard">
    <div className="vehiclePhoto" style={vehicle.image ? {} : {background: bg}}>
      {vehicle.image ? (
        <img src={vehicle.image} alt={vehicle.name} className="vehiclePhotoImg" />
      ) : (
        <div className="vehicleSilhouette"><Activity size={34}/><span>{vehicle.brand}</span></div>
      )}
      <StatusBadge status={projection.status}/>
      {(onEdit || onDelete) && (
        <div className="vehicleCardActions">
          {onEdit && <button className="vehicleActionBtn editBtn" onClick={e=>{e.preventDefault();onEdit()}} title="Edit"><Pencil size={13}/></button>}
          {onDelete && <button className="vehicleActionBtn deleteBtn" onClick={e=>{e.preventDefault();onDelete()}} title="Hapus"><Trash2 size={13}/></button>}
        </div>
      )}
    </div>
    <div className="vehicleBody">
      <div className="vehicleTitle"><div><h3>{vehicle.name}</h3><p>{vehicle.plate}</p></div><span className="yearPill">{vehicle.year}</span></div>
      <div className="vehicleMeta"><span>{vehicle.brand}</span><span>{vehicle.model}</span></div>
      <div className="vehicleMetrics">
        <div><Gauge size={17}/><span>Odometer</span><strong>{vehicle.currentKm.toLocaleString('id-ID')} KM</strong></div>
        <div><CalendarDays size={17}/><span>Target berikutnya</span><strong>{projection.targetKm.toLocaleString('id-ID')} KM</strong></div>
      </div>
      <div className="remaining"><span>Sisa menuju servis</span><strong>{projection.remainingKm < 0 ? `Lewat ${Math.abs(projection.remainingKm).toLocaleString('id-ID')} KM` : `${projection.remainingKm.toLocaleString('id-ID')} KM`}</strong></div>

      {showWa && (
        <a
          className={`waButton ${projection.status === 'OVERDUE' ? 'waOverdue' : 'waWarning'}`}
          href={`https://wa.me/?text=${buildWaMessage(vehicle, projection)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Kirim ke WhatsApp
        </a>
      )}

      <Link className="detailLink" href={`/vehicles/${vehicle.id}`}>Lihat detail <ArrowUpRight size={16}/></Link>
    </div>
  </article>
}
