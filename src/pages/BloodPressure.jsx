import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/apiClient';
import { Heart } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';
import BPForm from '../components/bloodpressure/BPForm';
import BPCard from '../components/bloodpressure/BPCard';
import BPChart from '../components/dashboard/BPChart';

export default function BloodPressure() {
  const urlParams = new URLSearchParams(window.location.search);
  const [showForm, setShowForm] = useState(urlParams.get('add') === 'true');
  const [editingItem, setEditingItem] = useState(null);
  const qc = useQueryClient();

  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['bp'],
    queryFn: () => base44.entities.BloodPressure.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BloodPressure.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bp'] }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      <PageHeader
        title="Pressione Arteriosa"
        subtitle="Monitora la tua pressione nel tempo"
        onAdd={() => setShowForm(true)}
        addLabel="Nuova Misurazione"
      />

      {(showForm || editingItem) && (
        <BPForm
          key={editingItem?.id ?? 'new'}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          initialData={editingItem}
        />
      )}

      {readings.length > 0 && <BPChart data={readings} />}

      {readings.length === 0 && !showForm ? (
        <EmptyState
          icon={Heart}
          title="Nessuna misurazione"
          description="Registra la tua prima misurazione della pressione arteriosa"
          onAction={() => setShowForm(true)}
          actionLabel="Registra Pressione"
        />
      ) : (
        <div className="space-y-2">
          {readings.map(r => (
            <BPCard key={r.id} reading={r}
              onDelete={(id) => deleteMutation.mutate(id)}
              onEdit={(item) => { setEditingItem(item); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}