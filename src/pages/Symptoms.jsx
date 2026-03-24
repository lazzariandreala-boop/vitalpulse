import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { ClipboardList, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import SymptomForm from '../components/symptoms/SymptomsForm';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const catLabels = {
  pain: '🔴 Dolore', digestive: '🟡 Digestivo', respiratory: '🔵 Respiratorio',
  neurological: '🟣 Neurologico', skin: '🟠 Pelle', fatigue: '⚪ Affaticamento',
  mental: '🟢 Mentale', other: '⚫ Altro',
};

function SeverityBar({ value }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className={cn(
          "w-2 h-4 rounded-sm transition-colors",
          i < value
            ? value <= 3 ? 'bg-green-400' : value <= 6 ? 'bg-amber-400' : 'bg-red-400'
            : 'bg-muted'
        )} />
      ))}
    </div>
  );
}

export default function Symptoms() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showForm, setShowForm] = useState(urlParams.get('add') === 'true');
  const [editingItem, setEditingItem] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const qc = useQueryClient();

  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ['symptoms'],
    queryFn: () => base44.entities.SymptomLog.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SymptomLog.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <ConfirmDialog
        open={confirmId !== null}
        onConfirm={() => { deleteMutation.mutate(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
        title="Eliminare questo sintomo?"
        description="La registrazione del sintomo verrà eliminata definitivamente."
      />
      <PageHeader title="Diario Sintomi" subtitle="Registra e monitora i tuoi sintomi"
        onAdd={() => setShowForm(true)} addLabel="Registra Sintomo" />

      {(showForm || editingItem) && (
        <SymptomForm
          key={editingItem?.id ?? 'new'}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          initialData={editingItem}
        />
      )}

      {symptoms.length === 0 && !showForm ? (
        <EmptyState icon={ClipboardList} title="Nessun sintomo registrato"
          description="Tieni traccia dei tuoi sintomi per aiutare il tuo medico"
          onAction={() => setShowForm(true)} actionLabel="Registra Sintomo" />
      ) : (
        <div className="space-y-2">
          {symptoms.map(s => (
            <div key={s.id} className="bg-card rounded-xl border p-4 group hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{s.symptom}</p>
                    <span className="text-[10px] text-muted-foreground">{catLabels[s.category] || s.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <SeverityBar value={s.severity} />
                    <span className="text-xs text-muted-foreground">{s.severity}/10</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span>{format(new Date(s.created_date), 'dd MMM yyyy, HH:mm', { locale: it })}</span>
                    {s.body_area && <><span>•</span><span>{s.body_area}</span></>}
                    {s.duration && <><span>•</span><span>{s.duration}</span></>}
                  </div>
                  {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                </div>
                <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0">
                  <button onClick={() => { setEditingItem(s); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-2 text-muted-foreground/40 hover:text-primary">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmId(s.id)}
                    className="p-2 text-muted-foreground/40 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}