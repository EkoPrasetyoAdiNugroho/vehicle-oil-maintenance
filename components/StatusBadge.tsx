import { MaintenanceStatus } from '@/lib/types';

const labels: Record<MaintenanceStatus,string> = {NORMAL:'Aman',WARNING:'Peringatan',OVERDUE:'Terlambat'};
const cls: Record<MaintenanceStatus,string> = {NORMAL:'normal',WARNING:'warning',OVERDUE:'overdue'};
export default function StatusBadge({status}:{status:MaintenanceStatus}) { return <span className={`badge ${cls[status]}`}><i/>{labels[status]}</span>; }
