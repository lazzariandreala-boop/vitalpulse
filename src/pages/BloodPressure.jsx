import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Heart, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import BPForm from '../components/bloodpressure/BPForm';
import BPCard from '../components/bloodpressure/BPCard';
import BPChart from '../components/dashboard/BPChart';
import { exportBPPdf } from '@/utils/exportBPPdf';

export default function BloodPressure() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showForm, setShowForm] = useState(urlParams.get('add') === 'true');
  const [editingItem, setEditingItem] = useState(null);
  const qc = useQueryClient();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['bp'],
    queryFn: () => base44.entities.BloodPressure.list('-measured_at', 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BloodPressure.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bp'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <PageHeader
            title="Pressione Arteriosa"
            subtitle="Monitora la tua pressione nel tempo"
            onAdd={() => setShowForm(true)}
            addLabel="Nuova Misurazione"
          />
        </div>
        {readings.length > 0 && (
          <Button
            variant="outline"
            className="rounded-xl shrink-0 gap-2 mt-0.5"
            onClick={() => exportBPPdf(readings)}
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Esporta PDF</span>
          </Button>
        )}
      </div>

      {(showForm || editingItem) && (
        <BPForm
          key={editingItem?.id ?? 'new'}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          initialData={editingItem}
        />
      )}

      {readings.length > 0 && <BPChart data={readings} />}

      {readings.length === 0 && !showForm ? (
        <EmptyState
          icon={Heart}
          title="Nessuna misurazione"
          description="Registra la tua prima misurazione della pressione arteriosa"
          onAction={() => setShowForm(true)}
          actionLabel="Registra Pressione"
        />
      ) : (
        <div className="space-y-1">
          {(() => {
            const items = [];
            let lastDay = null;
            readings.forEach(r => {
              const ts = r.measured_at || r.created_date;
              const day = ts ? ts.slice(0, 10) : null;
              if (day !== lastDay) {
                const label = day
                  ? format(new Date(day + 'T12:00:00'), 'EEEE d MMMM yyyy', { locale: it })
                  : 'Data sconosciuta';
                items.push(
                  <div key={`sep-${day}`} className="flex items-center gap-3 pt-3 pb-1 first:pt-0">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                );
                lastDay = day;
              }
              items.push(
                <BPCard key={r.id} reading={r}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onEdit={(item) => { setEditingItem(item); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              );
            });
            return items;
          })()}
        </div>
      )}
    </div>
  );
}