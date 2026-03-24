import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { TestTube2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import BloodTestUpload from '../components/bloodtests/BloodTestUpload';
import BloodTestCard from '../components/bloodtests/BloodTestCard';

export default function BloodTests() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showUpload, setShowUpload] = useState(urlParams.get('add') === 'true');
  const qc = useQueryClient();

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: () => base44.entities.BloodTest.list('-test_date', 50),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BloodTest.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tests'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <PageHeader
        title="Analisi del Sangue"
        subtitle="Carica e gestisci le tue analisi"
        onAdd={() => setShowUpload(true)}
        addLabel="Carica Analisi"
      />

      {showUpload && <BloodTestUpload onClose={() => setShowUpload(false)} />}

      {tests.length === 0 && !showUpload ? (
        <EmptyState
          icon={TestTube2}
          title="Nessuna analisi"
          description="Carica il PDF delle tue analisi del sangue e l'AI estrarrà tutti i dati automaticamente"
          onAction={() => setShowUpload(true)}
          actionLabel="Carica Analisi"
        />
      ) : (
        <div className="space-y-2">
          {tests.map(t => (
            <BloodTestCard key={t.id} test={t} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  );
}