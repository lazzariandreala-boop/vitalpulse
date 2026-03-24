import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Syringe } from 'lucide-react';

const timeOptions = [
  { id: 'morning', label: 'Mattina' },
  { id: 'afternoon', label: 'Pomeriggio' },
  { id: 'evening', label: 'Sera' },
  { id: 'night', label: 'Notte' },
];

const EMPTY = {
  name: '', dosage: '', frequency: 'once_daily',
  time_of_day: ['morning'], start_date: new Date().toISOString().split('T')[0],
  end_date: '', purpose: '', notes: '', active: true,
  insulin_basal: '', insulin_bolus: '',
};

export default function MedicationForm({ onClose, initialData }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(() => isEdit ? {
    name:          initialData.name          ?? '',
    dosage:        initialData.dosage        ?? '',
    frequency:     initialData.frequency     ?? 'once_daily',
    time_of_day:   initialData.time_of_day   ?? ['morning'],
    start_date:    initialData.start_date    ?? EMPTY.start_date,
    end_date:      initialData.end_date      ?? '',
    purpose:       initialData.purpose       ?? '',
    notes:         initialData.notes         ?? '',
    active:        initialData.active        ?? true,
    insulin_basal: initialData.insulin_basal ?? '',
    insulin_bolus: initialData.insulin_bolus ?? '',
  } : EMPTY);
  const qc = useQueryClient();

  const isInsulin = /insul/i.test(form.name);
  const insulinTotal = (Number(form.insulin_basal) || 0) + (Number(form.insulin_bolus) || 0);

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? base44.entities.Medication.update(initialData.id, data)
      : base44.entities.Medication.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meds'] }); onClose(); },
  });

  const toggleTime = (time) => {
    setForm(prev => ({
      ...prev,
      time_of_day: prev.time_of_day.includes(time)
        ? prev.time_of_day.filter(t => t !== time)
        : [...prev.time_of_day, time],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.end_date) delete data.end_date;
    if (isInsulin) {
      data.dosage = data.dosage || `${insulinTotal} U/die`;
      if (form.insulin_basal) data.insulin_basal = Number(form.insulin_basal);
      if (form.insulin_bolus) data.insulin_bolus = Number(form.insulin_bolus);
    } else {
      delete data.insulin_basal;
      delete data.insulin_bolus;
    }
    mutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{isEdit ? 'Modifica Farmaco' : 'Nuovo Farmaco'}</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nome */}
        <div>
          <Label className="text-xs">Nome Farmaco *</Label>
          <Input placeholder="Es. Aspirina, Insulina Glargine..." value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>

        {/* Dosaggio — normale O sezione insulina */}
        {isInsulin ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Syringe className="w-4 h-4" />
              Unità insulina giornaliere
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Basale (U/die)</Label>
                <Input type="number" min="0" placeholder="20" value={form.insulin_basal}
                  onChange={e => setForm({ ...form, insulin_basal: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Boli totali (~U/die)</Label>
                <Input type="number" min="0" placeholder="15" value={form.insulin_bolus}
                  onChange={e => setForm({ ...form, insulin_bolus: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Totale (U/die)</Label>
                <div className="h-10 rounded-md border bg-muted/40 flex items-center justify-center font-semibold text-sm">
                  {insulinTotal > 0 ? `${insulinTotal} U` : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Label className="text-xs">Dosaggio *</Label>
            <Input placeholder="Es. 500mg" value={form.dosage}
              onChange={e => setForm({ ...form, dosage: e.target.value })} required />
          </div>
        )}

        <div>
          <Label className="text-xs">Frequenza</Label>
          <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="once_daily">Una volta al giorno</SelectItem>
              <SelectItem value="twice_daily">Due volte al giorno</SelectItem>
              <SelectItem value="three_times_daily">Tre volte al giorno</SelectItem>
              <SelectItem value="weekly">Settimanale</SelectItem>
              <SelectItem value="as_needed">Al bisogno</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-2 block">Orario</Label>
          <div className="flex gap-3 flex-wrap">
            {timeOptions.map(opt => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.time_of_day.includes(opt.id)} onCheckedChange={() => toggleTime(opt.id)} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Data Inizio</Label>
            <Input type="date" value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Data Fine (opzionale)</Label>
            <Input type="date" value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Motivo</Label>
          <Input placeholder="Per cosa lo prendi?" value={form.purpose}
            onChange={e => setForm({ ...form, purpose: e.target.value })} />
        </div>

        <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvataggio...' : isEdit ? 'Aggiorna Farmaco' : 'Salva Farmaco'}
        </Button>
      </form>
    </div>
  );
}
