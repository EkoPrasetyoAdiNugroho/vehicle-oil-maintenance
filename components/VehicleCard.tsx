import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { Vehicle, MaintenanceProjection } from '@/lib/types';
import { Gauge, CalendarDays, ArrowUpRight, Activity, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { getWaAlertUrl } from '@/lib/maintenance';

const gradients: Record<string,string> = {
  Toyota:'linear-gradient(135deg,#d7e7ee,#9fc4ce)', Isuzu:'linear-gradient(135deg,#dce8f2,#a8bfd5)', Mitsubishi:'linear-gradient(135deg,#e8e8e8,#bec4c8)', Daihatsu:'linear-gradient(135deg,#e6edf0,#b8cbd1)'
};

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
          className={`waAlertBtn waAlertBtnFull ${projection.status === 'OVERDUE' ? 'overdue' : ''}`}
          href={getWaAlertUrl(vehicle, projection)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
        >
          <MessageCircle size={16} />
          <span>WhatsApp Alert</span>
        </a>
      )}

      <Link className="detailLink" href={`/vehicles/${vehicle.id}`}>Lihat detail <ArrowUpRight size={16}/></Link>
    </div>
  </article>
}
