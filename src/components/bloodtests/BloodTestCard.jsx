import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronDown, ChevronUp, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const statusColors = {
  normal: 'text-green-600 bg-green-50',
  low: 'text-blue-600 bg-blue-50',
  high: 'text-red-600 bg-red-50',
};

const statusLabels = {
  normal: 'Normale',
  low: 'Basso',
  high: 'Alto',
};

export default function BloodTestCard({ test, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const abnormalCount = test.results?.filter(r => r.status !== 'normal').length || 0;

  return (
    <div className="bg-card rounded-xl border overflow-hidden group hover:shadow-sm transition-shadow">
      <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">
              {format(new Date(test.test_date), 'dd MMMM yyyy', { locale: it })}
            </p>
            {abnormalCount > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                {abnormalCount} fuori range
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {test.lab_name || 'Laboratorio'} • {test.results?.length || 0} parametri
          </p>
        </div>
        <div className="flex items-center gap-1">
          {test.file_url && (
            <a href={test.file_url} target="_blank" rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary" onClick={e => e.stopPropagation()}>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(test.id); }}
            className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && test.results && (
        <div className="border-t px-4 py-3 space-y-2">
          {test.results.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
              <span className="text-foreground font-medium">{r.parameter}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{r.value} {r.unit}</span>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", statusColors[r.status] || statusColors.normal)}>
                  {statusLabels[r.status] || 'Normale'}
                </span>
                {r.reference_min != null && (
                  <span className="text-[10px] text-muted-foreground">
                    ({r.reference_min}-{r.reference_max})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}