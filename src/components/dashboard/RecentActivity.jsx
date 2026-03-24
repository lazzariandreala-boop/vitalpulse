import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Heart, TestTube2, Scale, Pill, ClipboardList } from 'lucide-react';

const typeConfig = {
  BloodPressure: { icon: Heart,         bg: 'bg-red-500/15',    text: 'text-red-400',    label: 'Pressione' },
  BloodTest:     { icon: TestTube2,     bg: 'bg-blue-500/15',   text: 'text-blue-400',   label: 'Analisi' },
  BodyMetric:    { icon: Scale,         bg: 'bg-green-500/15',  text: 'text-green-400',  label: 'Metrica' },
  Medication:    { icon: Pill,          bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'Farmaco' },
  SymptomLog:    { icon: ClipboardList, bg: 'bg-amber-500/15',  text: 'text-amber-400',  label: 'Sintomo' },
};

function getDescription(type, item) {
  switch (type) {
    case 'BloodPressure': return `${item.systolic}/${item.diastolic} mmHg — ${item.heart_rate || '—'} bpm`;
    case 'BloodTest':     return `${item.results?.length || 0} parametri analizzati`;
    case 'BodyMetric':    return [item.weight && `${item.weight} kg`, item.bmi && `BMI ${item.bmi.toFixed(1)}`].filter(Boolean).join(' · ') || '—';
    case 'Medication':    return `${item.name} ${item.dosage}`;
    case 'SymptomLog':    return `${item.symptom} · Gravità ${item.severity}/10`;
    default: return '';
  }
}

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5 flex flex-col">
      <h3 className="text-sm font-semibold mb-4">Attività Recente</h3>

      {!activities.length ? (
        <p className="text-sm text-muted-foreground text-center py-8 flex-1 flex items-center justify-center">
          Nessuna attività. Inizia a monitorare la tua salute!
        </p>
      ) : (
        <div className="space-y-0">
          {activities.map((item, i) => {
            const cfg = typeConfig[item._type] || typeConfig.BloodPressure;
            const Icon = cfg.icon;
            const isLast = i === activities.length - 1;
            return (
              <div key={i} className="flex gap-3">
                {/* timeline line */}
                <div className="flex flex-col items-center">
                  <div className={['w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', cfg.bg].join(' ')}>
                    <Icon className={['w-3.5 h-3.5', cfg.text].join(' ')} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border my-1" />}
                </div>

                <div className={['min-w-0 flex-1 pb-3', isLast ? '' : ''].join(' ')}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight truncate">{getDescription(item._type, item)}</p>
                    <span className={['text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5', cfg.bg, cfg.text].join(' ')}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(item.created_date), 'dd MMM yyyy, HH:mm', { locale: it })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
