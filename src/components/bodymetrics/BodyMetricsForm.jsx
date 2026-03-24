import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

export default function BodyMetricForm({ onClose }) {
  const [form, setForm] = useState({
    measured_at: new Date().toISOString().split('T')[0],
    weight: '', height: '', body_fat: '', waist: '', hip: '',
    blood_sugar: '', oxygen_saturation: '', temperature: '', notes: ''
  });
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.BodyMetric.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['body'] }); onClose(); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { measured_at: form.measured_at, notes: form.notes };
    
    // Only include numeric fields that have values
    ['weight','height','body_fat','waist','hip','blood_sugar','oxygen_saturation','temperature']
      .forEach(f => { if (form[f]) data[f] = Number(form[f]); });
    
    // Auto-calculate BMI
    if (data.weight && data.height) {
      data.bmi = Math.round((data.weight / ((data.height / 100) ** 2)) * 10) / 10;
    }

    mutation.mutate(data);
  };

  const field = (name, label, placeholder, unit) => (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        <Input type="number" step="any" placeholder={placeholder} value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })} />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border shadow-lg p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Nuova Misurazione</h3>
        <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-xs">Data *</Label>
          <Input type="date" value={form.measured_at} onChange={e => setForm({ ...form, measured_at: e.target.value })} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field('weight', 'Peso', '75', 'kg')}
          {field('height', 'Altezza', '175', 'cm')}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {field('body_fat', 'Grasso Corp.', '20', '%')}
          {field('waist', 'Vita', '85', 'cm')}
          {field('hip', 'Fianchi', '95', 'cm')}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {field('blood_sugar', 'Glicemia', '90', 'mg/dL')}
          {field('oxygen_saturation', 'SpO2', '98', '%')}
          {field('temperature', 'Temperatura', '36.5', '°C')}
        </div>

        <Button type="submit" className="w-full rounded-xl" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvataggio...' : 'Salva Misurazione'}
        </Button>
      </form>
    </div>
  );
}