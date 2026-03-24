import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { Heart, Scale, Pill, Activity, Thermometer, Droplets } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import BPChart from '../components/dashboard/BPChart';

export default function Dashboard() {
  const { data: bpData = [] } = useQuery({
    queryKey: ['bp'],
    queryFn: () => base44.entities.BloodPressure.list('-created_date', 30),
  });

  const { data: bodyData = [] } = useQuery({
    queryKey: ['body'],
    queryFn: () => base44.entities.BodyMetric.list('-measured_at', 10),
  });

  const { data: meds = [] } = useQuery({
    queryKey: ['meds'],
    queryFn: () => base44.entities.Medication.filter({ active: true }),
  });

  const { data: symptoms = [] } = useQuery({
    queryKey: ['symptoms'],
    queryFn: () => base44.entities.SymptomLog.list('-created_date', 10),
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: () => base44.entities.BloodTest.list('-test_date', 5),
  });

  const lastBP = bpData[0];
  const lastBody = bodyData[0];
  const activeMeds = meds.length;

  // Combine all activities for timeline
  const allActivities = [
    ...bpData.slice(0, 3).map(d => ({ ...d, _type: 'BloodPressure' })),
    ...bodyData.slice(0, 2).map(d => ({ ...d, _type: 'BodyMetric' })),
    ...symptoms.slice(0, 3).map(d => ({ ...d, _type: 'SymptomLog' })),
    ...tests.slice(0, 2).map(d => ({ ...d, _type: 'BloodTest' })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Panoramica della tua salute</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Heart}
          label="Pressione"
          value={lastBP ? `${lastBP.systolic}/${lastBP.diastolic}` : null}
          unit="mmHg"
          color="primary"
        />
        <StatCard
          icon={Activity}
          label="Frequenza Cardiaca"
          value={lastBP?.heart_rate}
          unit="bpm"
          color="destructive"
        />
        <StatCard
          icon={Scale}
          label="Peso"
          value={lastBody?.weight}
          unit="kg"
          color="accent"
        />
        <StatCard
          icon={Thermometer}
          label="Temperatura"
          value={lastBody?.temperature}
          unit="°C"
          color="chart4"
        />
        <StatCard
          icon={Droplets}
          label="Glicemia"
          value={lastBody?.blood_sugar}
          unit="mg/dL"
          color="chart3"
        />
        <StatCard
          icon={Pill}
          label="Farmaci Attivi"
          value={activeMeds}
          color="chart3"
        />
      </div>

      <QuickActions />

      <div className="grid md:grid-cols-2 gap-4">
        <BPChart data={bpData} />
        <RecentActivity activities={allActivities} />
      </div>
    </div>
  );
}