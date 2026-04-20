import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Trash2, Heart, Pencil } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

function getBPCategory(sys, dia) {
  if (!sys || !dia) return { label: 'Solo FC', bg: 'bg-blue-500/15', text: 'text-blue-400', bar: 'bg-blue-500' };
  if (sys < 120 && dia < 80)  return { label: 'Normale',  bg: 'bg-green-500/15',  text: 'text-green-400',  bar: 'bg-green-500' };
  if (sys < 130 && dia < 80)  return { label: 'Elevata',  bg: 'bg-amber-500/15',  text: 'text-amber-400',  bar: 'bg-amber-500' };
  if (sys < 140 || dia < 90)  return { label: 'Stadio 1', bg: 'bg-orange-500/15', text: 'text-orange-400', bar: 'bg-orange-500' };
  return                               { label: 'Stadio 2', bg: 'bg-red-500/15',    text: 'text-red-400',    bar: 'bg-red-500' };
}

export default function BPCard({ reading, onDelete, onEdit }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasBP = reading.systolic && reading.diastolic;
  const cat = getBPCategory(reading.systolic, reading.diastolic);
  const armLabel = reading.arm === 'left' ? 'Sin.' : 'Des.';
  const posLabel = { sitting: 'Seduto', standing: 'In piedi', lying: 'Sdraiato' }[reading.position] || '';

  return (
    <>
    <ConfirmDialog
      open={confirmOpen}
      onConfirm={() => { setConfirmOpen(false); onDelete(reading.id); }}
      onCancel={() => setConfirmOpen(false)}
      title="Eliminare questa misurazione?"
      description="La misurazione della pressione verrà eliminata definitivamente."
    />
    <div className="group relative bg-card rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200">
      {/* left accent bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', cat.bar)} />

      <div className="pl-5 pr-4 py-4 flex items-center gap-4">
        {/* BP value or heart rate only */}
        <div className="text-center min-w-[80px]">
          {hasBP ? (
            <>
              <p className="text-2xl font-bold tracking-tight leading-none">
                {reading.systolic}/{reading.diastolic}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">mmHg</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight leading-none flex items-center justify-center gap-1">
                <Heart className="w-5 h-5 text-red-400" />
                {reading.heart_rate}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">bpm</p>
            </>
          )}
        </div>

        {/* divider */}
        <div className="w-px self-stretch bg-border" />

        {/* details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-lg', cat.bg, cat.text)}>
              {cat.label}
            </span>
            {hasBP && reading.heart_rate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="w-3 h-3 text-red-400" />
                {reading.heart_rate} bpm
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <span>{format(new Date(reading.measured_at || reading.created_date), 'dd MMM yyyy, HH:mm', { locale: it })}</span>
            {hasBP && posLabel && <><span>·</span><span>{posLabel}</span></>}
            {hasBP && <><span>·</span><span>Braccio {armLabel}</span></>}
          </div>
          {reading.notes && (
            <p className="text-xs text-muted-foreground/70 italic truncate">"{reading.notes}"</p>
          )}
        </div>

        {/* edit + delete */}
        <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
          <button onClick={() => onEdit?.(reading)}
            className="p-2 rounded-xl text-muted-foreground/40 hover:text-primary hover:bg-primary/10">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setConfirmOpen(true)}
            className="p-2 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
