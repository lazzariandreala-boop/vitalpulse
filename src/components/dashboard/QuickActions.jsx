import { Link } from 'react-router-dom';
import { Heart, TestTube2, Scale, Pill, ClipboardList, Plus } from 'lucide-react';

const actions = [
  { to: '/blood-pressure?add=true', icon: Heart, label: 'Pressione', color: 'bg-red-50 text-red-500 border-red-100' },
  { to: '/blood-tests?add=true', icon: TestTube2, label: 'Analisi', color: 'bg-blue-50 text-blue-500 border-blue-100' },
  { to: '/body-metrics?add=true', icon: Scale, label: 'Peso', color: 'bg-green-50 text-green-500 border-green-100' },
  { to: '/medications?add=true', icon: Pill, label: 'Farmaco', color: 'bg-purple-50 text-purple-500 border-purple-100' },
  { to: '/symptoms?add=true', icon: ClipboardList, label: 'Sintomo', color: 'bg-amber-50 text-amber-500 border-amber-100' },
];

export default function QuickActions() {
  return (
    <div className="bg-card rounded-2xl p-5 border shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4">Registrazione Rapida</h3>
      <div className="grid grid-cols-5 gap-2">
        {actions.map(action => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}