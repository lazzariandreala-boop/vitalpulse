import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

function nowLocal() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

const EMPTY = { measured_at: nowLocal(), systolic: '', diastolic: '', heart_rate: '', arm: 'left', position: 'sitting', notes: '' };

export default function BPForm({ onClose, initialData }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(() => isEdit ? {
    measured_at: initialData.measured_at
      ? new Date(initialData.measured_at).toISOString().slice(0, 16)
      : nowLocal(),
    systolic:   String(initialData.systolic   ?? ''),
    diastolic:  String(initialData.diastolic  ?? ''),
    heart_rate: String(initialData.heart_rate ?? ''),
    arm:        initialData.arm      ?? 'left',
    position:   initialData.position ?? 'sitting',
    notes:      initialData.notes    ?? '',
  } : EMPTY);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? base44.entities.BloodPressure.update(initialData.id, data)
      : base44.entities.BloodPressure.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bp'] }); onClose(); },
  });

  const hasBP = form.systolic || form.diastolic;
  const hasHR = !!form.heart_rate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasBP && !hasHR) return;
    if (hasBP && (!form.systolic || !form.diastolic)) return;
    const data = { ...form };
    if (form.systolic)   data.systolic   = Number(form.systolic);
    else                 delete data.systolic;
    if (form.diastolic)  data.diastolic  = Number(form.diastolic);
    else                 delete data.diastolic;
    data.heart_rate = form.heart_rate ? Number(form.heart_rate) : undefined;
    data.measured_at = new Date(form.measured_at).toISOString();
    mutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{isEdit ? 'Modifica Misurazione' : 'Nuova Misurazione'}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs">Data e ora misurazione</Label>
          <Input type="datetime-local" value={form.measured_at}
            onChange={e => setForm({ ...form, measured_at: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Sistolica</Label>
            <Input type="number" placeholder="120" value={form.systolic}
              onChange={e => setForm({ ...form, systolic: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Diastolica</Label>
            <Input type="number" placeholder="80" value={form.diastolic}
              onChange={e => setForm({ ...form, diastolic: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Battiti (bpm)</Label>
            <Input type="number" placeholder="72" value={form.heart_rate}
              onChange={e => setForm({ ...form, heart_rate: e.target.value })} />
          </div>
        </div>
        {hasBP && (!form.systolic || !form.diastolic) && (
          <p className="text-xs text-destructive">Inserisci sia sistolica che diastolica, oppure solo i battiti.</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Braccio</Label>
            <Select value={form.arm} onValueChange={v => setForm({ ...form, arm: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Sinistro</SelectItem>
                <SelectItem value="right">Destro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Posizione</Label>
            <Select value={form.position} onValueChange={v => setForm({ ...form, position: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sitting">Seduto</SelectItem>
                <SelectItem value="standing">In piedi</SelectItem>
                <SelectItem value="lying">Sdraiato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label className="text-xs">Note</Label>
          <Textarea placeholder="Note aggiuntive..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending || (!hasBP && !hasHR) || (hasBP && (!form.systolic || !form.diastolic))}>
          {mutation.isPending ? 'Salvataggio...' : isEdit ? 'Aggiorna Misurazione' : 'Salva Misurazione'}
        </Button>
      </form>
    </div>
  );
}
