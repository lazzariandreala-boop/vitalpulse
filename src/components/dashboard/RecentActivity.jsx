import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Heart, TestTube2, Scale, Pill, ClipboardList } from 'lucide-react';

const iconMap = {
  BloodPressure: Heart,
  BloodTest: TestTube2,
  BodyMetric: Scale,
  Medication: Pill,
  SymptomLog: ClipboardList,
};

const colorMap = {
  BloodPressure: 'text-red-500 bg-red-50',
  BloodTest: 'text-blue-500 bg-blue-50',
  BodyMetric: 'text-green-500 bg-green-50',
  Medication: 'text-purple-500 bg-purple-50',
  SymptomLog: 'text-amber-500 bg-amber-50',
};

function getDescription(type, item) {
  switch (type) {
    case 'BloodPressure': return `${item.systolic}/${item.diastolic} mmHg • ${item.heart_rate || '—'} bpm`;
    case 'BloodTest': return `${item.results?.length || 0} parametri analizzati`;
    case 'BodyMetric': return `${item.weight ? item.weight + ' kg' : ''} ${item.bmi ? '• BMI ' + item.bmi.toFixed(1) : ''}`;
    case 'Medication': return `${item.name} ${item.dosage}`;
    case 'SymptomLog': return `${item.symptom} • Gravità ${item.severity}/10`;
    default: return '';
  }
}

export default function RecentActivity({ activities }) {
  if (!activities.length) {
    return (
      <div className="bg-card rounded-2xl p-5 border shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-4">Attività Recente</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nessuna attività registrata. Inizia a monitorare la tua salute!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Attività Recente</h3>
      <div className="space-y-3">
        {activities.map((item, i) => {
          const Icon = iconMap[item._type] || Heart;
          const color = colorMap[item._type] || 'text-muted-foreground bg-muted';
          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{getDescription(item._type, item)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.created_date), 'dd MMM yyyy, HH:mm', { locale: it })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}