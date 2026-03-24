import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function EmptyState({ icon: Icon, title, description, onAction, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      {onAction && (
        <Button onClick={onAction} className="mt-4 rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}