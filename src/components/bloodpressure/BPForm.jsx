import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

export default function BPForm({ onClose }) {
  const [form, setForm] = useState({
    systolic: '', diastolic: '', heart_rate: '',
    arm: 'left', position: 'sitting', notes: ''
  });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.BloodPressure.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bp'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      heart_rate: form.heart_rate ? Number(form.heart_rate) : undefined,
      measured_at: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Nuova Misurazione</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Sistolica *</Label>
            <Input type="number" placeholder="120" value={form.systolic}
              onChange={e => setForm({ ...form, systolic: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs">Diastolica *</Label>
            <Input type="number" placeholder="80" value={form.diastolic}
              onChange={e => setForm({ ...form, diastolic: e.target.value })} required />
          </div>
          <div>
            <Label className="text-xs">Battiti (bpm)</Label>
            <Input type="number" placeholder="72" value={form.heart_rate}
              onChange={e => setForm({ ...form, heart_rate: e.target.value })} />
          </div>
        </div>
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
        <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvataggio...' : 'Salva Misurazione'}
        </Button>
      </form>
    </div>
  );
}