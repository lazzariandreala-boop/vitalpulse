import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { Pill, Trash2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import MedicationForm from '../components/medications/MedicationForm';

const freqLabels = {
  once_daily: '1x/giorno',
  twice_daily: '2x/giorno',
  three_times_daily: '3x/giorno',
  weekly: 'Settimanale',
  as_needed: 'Al bisogno',
};

const timeLabels = {
  morning: '🌅 Mattina',
  afternoon: '☀️ Pomeriggio',
  evening: '🌆 Sera',
  night: '🌙 Notte',
};

export default function Medications() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showForm, setShowForm] = useState(urlParams.get('add') === 'true');
  const qc = useQueryClient();

  const { data: meds = [], isLoading } = useQuery({
    queryKey: ['meds'],
    queryFn: () => base44.entities.Medication.list('-created_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Medication.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meds'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Medication.update(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meds'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  const activeMeds = meds.filter(m => m.active);
  const inactiveMeds = meds.filter(m => !m.active);

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <PageHeader title="Farmaci" subtitle="Gestisci i tuoi farmaci e terapie"
        onAdd={() => setShowForm(true)} addLabel="Nuovo Farmaco" />

      {showForm && <MedicationForm onClose={() => setShowForm(false)} />}

      {meds.length === 0 && !showForm ? (
        <EmptyState icon={Pill} title="Nessun farmaco" description="Aggiungi i farmaci che stai assumendo"
          onAction={() => setShowForm(true)} actionLabel="Aggiungi Farmaco" />
      ) : (
        <>
          {activeMeds.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Attivi ({activeMeds.length})</h3>
              <div className="space-y-2">
                {activeMeds.map(m => (
                  <MedCard key={m.id} med={m} onDelete={deleteMutation.mutate}
                    onToggle={(active) => toggleMutation.mutate({ id: m.id, active })} />
                ))}
              </div>
            </div>
          )}
          {inactiveMeds.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sospesi ({inactiveMeds.length})</h3>
              <div className="space-y-2 opacity-60">
                {inactiveMeds.map(m => (
                  <MedCard key={m.id} med={m} onDelete={deleteMutation.mutate}
                    onToggle={(active) => toggleMutation.mutate({ id: m.id, active })} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MedCard({ med, onDelete, onToggle }) {
  return (
    <div className="bg-card rounded-xl border p-4 flex items-center gap-4 group hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
        <Pill className="w-5 h-5 text-purple-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{med.name}</p>
          <Badge variant="secondary" className="text-[10px]">{med.dosage}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {freqLabels[med.frequency] || med.frequency}
          </span>
          {med.time_of_day?.map(t => (
            <span key={t} className="text-[10px] text-muted-foreground">{timeLabels[t] || t}</span>
          ))}
        </div>
        {med.purpose && <p className="text-xs text-muted-foreground mt-0.5">{med.purpose}</p>}
      </div>
      <Switch checked={med.active} onCheckedChange={(checked) => onToggle(checked)} />
      <button onClick={() => onDelete(med.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}