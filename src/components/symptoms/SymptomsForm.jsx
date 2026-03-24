import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

const categories = [
  { value: 'pain', label: 'Dolore' },
  { value: 'digestive', label: 'Digestivo' },
  { value: 'respiratory', label: 'Respiratorio' },
  { value: 'neurological', label: 'Neurologico' },
  { value: 'skin', label: 'Pelle' },
  { value: 'fatigue', label: 'Affaticamento' },
  { value: 'mental', label: 'Mentale' },
  { value: 'other', label: 'Altro' },
];

const EMPTY = { symptom: '', severity: 5, category: 'pain', body_area: '', duration: '', notes: '' };

export default function SymptomForm({ onClose, initialData }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(() => isEdit ? {
    symptom:   initialData.symptom   ?? '',
    severity:  initialData.severity  ?? 5,
    category:  initialData.category  ?? 'pain',
    body_area: initialData.body_area ?? '',
    duration:  initialData.duration  ?? '',
    notes:     initialData.notes     ?? '',
  } : EMPTY);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? base44.entities.SymptomLog.update(initialData.id, data)
      : base44.entities.SymptomLog.create({ ...data, logged_at: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['symptoms'] }); onClose(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{isEdit ? 'Modifica Sintomo' : 'Registra Sintomo'}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs">Sintomo *</Label>
          <Input placeholder="Descrivi il sintomo..." value={form.symptom}
            onChange={e => setForm({ ...form, symptom: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Zona del corpo</Label>
            <Input placeholder="Es. Testa, schiena..." value={form.body_area}
              onChange={e => setForm({ ...form, body_area: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Gravità: {form.severity}/10</Label>
          <div className="pt-2 px-1">
            <Slider value={[form.severity]} min={1} max={10} step={1}
              onValueChange={([v]) => setForm({ ...form, severity: v })} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
            <span>Lieve</span><span>Moderato</span><span>Grave</span>
          </div>
        </div>
        <div>
          <Label className="text-xs">Durata</Label>
          <Input placeholder="Es. 2 ore, tutto il giorno..." value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Note</Label>
          <Textarea placeholder="Dettagli aggiuntivi..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvataggio...' : isEdit ? 'Aggiorna Sintomo' : 'Salva Sintomo'}
        </Button>
      </form>
    </div>
  );
}
