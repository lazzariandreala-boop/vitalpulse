import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { Scale, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import BodyMetricForm from '../components/bodymetrics/BodyMetricsForm';

function WeightChart({ data }) {
  const chartData = [...data]
    .filter(d => d.weight)
    .sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at))
    .slice(-20)
    .map(d => ({
      date: format(new Date(d.measured_at), 'dd/MM'),
      peso: d.weight,
      bmi: d.bmi,
    }));

  if (chartData.length < 2) return null;

  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Andamento Peso</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(214,20%,90%)', fontSize: 12 }} />
            <Line type="monotone" dataKey="peso" stroke="hsl(168,76%,42%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function BodyMetrics() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showForm, setShowForm] = useState(urlParams.get('add') === 'true');
  const qc = useQueryClient();

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['body'],
    queryFn: () => base44.entities.BodyMetric.list('-measured_at', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BodyMetric.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['body'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <PageHeader title="Metriche Corporee" subtitle="Peso, BMI, glicemia e altro"
        onAdd={() => setShowForm(true)} addLabel="Nuova Misurazione" />

      {showForm && <BodyMetricForm onClose={() => setShowForm(false)} />}

      {metrics.length > 0 && <WeightChart data={metrics} />}

      {metrics.length === 0 && !showForm ? (
        <EmptyState icon={Scale} title="Nessuna misurazione"
          description="Inizia a tracciare peso, BMI e altri parametri corporei"
          onAction={() => setShowForm(true)} actionLabel="Registra Dati" />
      ) : (
        <div className="space-y-2">
          {metrics.map(m => (
            <div key={m.id} className="bg-card rounded-xl border p-4 flex items-center gap-4 group hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  {m.weight && <span className="font-bold">{m.weight} kg</span>}
                  {m.bmi && <span className="text-muted-foreground">BMI {m.bmi}</span>}
                  {m.body_fat && <span className="text-muted-foreground">Grasso {m.body_fat}%</span>}
                  {m.blood_sugar && <span className="text-muted-foreground">Glicemia {m.blood_sugar}</span>}
                  {m.oxygen_saturation && <span className="text-muted-foreground">SpO2 {m.oxygen_saturation}%</span>}
                  {m.temperature && <span className="text-muted-foreground">{m.temperature}°C</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(m.measured_at), 'dd MMMM yyyy', { locale: it })}
                </p>
              </div>
              <button onClick={() => deleteMutation.mutate(m.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}