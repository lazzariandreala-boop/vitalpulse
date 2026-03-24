import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getBPCategory(sys, dia) {
  if (sys < 120 && dia < 80) return { label: 'Normale', color: 'text-green-600 bg-green-50' };
  if (sys < 130 && dia < 80) return { label: 'Elevata', color: 'text-amber-600 bg-amber-50' };
  if (sys < 140 || dia < 90) return { label: 'Stadio 1', color: 'text-orange-600 bg-orange-50' };
  return { label: 'Stadio 2', color: 'text-red-600 bg-red-50' };
}

export default function BPCard({ reading, onDelete }) {
  const cat = getBPCategory(reading.systolic, reading.diastolic);
  const armLabel = reading.arm === 'left' ? 'SX' : 'DX';
  const posLabel = { sitting: 'Seduto', standing: 'In piedi', lying: 'Sdraiato' }[reading.position] || '';

  return (
    <div className="bg-card rounded-xl border p-4 flex items-center gap-4 group hover:shadow-sm transition-shadow">
      <div className="text-center min-w-[70px]">
        <p className="text-xl font-bold text-foreground">{reading.systolic}/{reading.diastolic}</p>
        <p className="text-[10px] text-muted-foreground">mmHg</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", cat.color)}>
            {cat.label}
          </span>
          {reading.heart_rate && (
            <span className="text-xs text-muted-foreground">♥ {reading.heart_rate} bpm</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>{format(new Date(reading.created_date), 'dd MMM HH:mm', { locale: it })}</span>
          <span>•</span>
          <span>{posLabel} • Braccio {armLabel}</span>
        </div>
        {reading.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{reading.notes}</p>}
      </div>
      <button
        onClick={() => onDelete(reading.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}