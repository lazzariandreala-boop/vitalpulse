import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, onAdd, addLabel }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {onAdd && (
        <Button
          onClick={onAdd}
          className="rounded-xl shadow-sm shadow-primary/20 gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{addLabel || 'Aggiungi'}</span>
          <span className="sm:hidden">Nuovo</span>
        </Button>
      )}
    </div>
  );
}
