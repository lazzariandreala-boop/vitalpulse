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
    queryFn: () => base44.entities.BodyMetric.list('-created_date', 10),
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

  const systolic = (bpData ? bpData?.find(x => x.systolic) : bodyData.find(x => x.systolic))?.systolic;
  const diastolic = (bpData ? bpData?.find(x => x.diastolic) : bodyData.find(x => x.diastolic))?.diastolic;
  const heart_rate = (bpData ? bpData?.find(x => x.heart_rate) : bodyData.find(x => x.heart_rate))?.heart_rate;
  const weight = bodyData.find(x => x.weight)?.weight;
  const temperature = bodyData.find(x => x.temperature)?.temperature;
  const hba1c = bodyData.find(x => x.hba1c)?.hba1c;

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
          value={lastBP ? `${systolic}/${diastolic}` : null}
          unit="mmHg"
          color="primary"
          to="/blood-pressure?add=true"
        />
        <StatCard
          icon={Activity}
          label="Frequenza Cardiaca"
          value={heart_rate}
          unit="bpm"
          color="destructive"
          to="/blood-pressure?add=true"
        />
        <StatCard
          icon={Scale}
          label="Peso"
          value={weight}
          unit="kg"
          color="accent"
          to="/body-metrics?add=true"
        />
        <StatCard
          icon={Thermometer}
          label="Temperatura"
          value={temperature}
          unit="°C"
          color="chart4"
          to="/body-metrics?add=true"
        />
        <StatCard
          icon={Droplets}
          label="Glicata (HbA1c)"
          value={hba1c}
          unit="%"
          color="chart3"
          to="/body-metrics?add=true"
        />
        <StatCard
          icon={Pill}
          label="Farmaci Attivi"
          value={activeMeds || null}
          color="chart3"
          to="/medications?add=true"
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