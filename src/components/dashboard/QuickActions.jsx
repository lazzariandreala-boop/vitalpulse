import { Link } from 'react-router-dom';
import { Heart, TestTube2, Scale, Pill, ClipboardList } from 'lucide-react';

const actions = [
  { to: '/blood-pressure?add=true', icon: Heart,         label: 'Pressione', bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/20',    hover: 'hover:bg-red-500/25' },
  { to: '/blood-tests?add=true',    icon: TestTube2,     label: 'Analisi',   bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/20',   hover: 'hover:bg-blue-500/25' },
  { to: '/body-metrics?add=true',   icon: Scale,         label: 'Peso',      bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/20',  hover: 'hover:bg-green-500/25' },
  { to: '/medications?add=true',    icon: Pill,          label: 'Farmaco',   bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/25' },
  { to: '/symptoms?add=true',       icon: ClipboardList, label: 'Sintomo',   bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/20',  hover: 'hover:bg-amber-500/25' },
];

export default function QuickActions() {
  return (
    <div className="bg-card rounded-2xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Registrazione Rapida</h3>
        <span className="text-xs text-muted-foreground">Tocca per aggiungere</span>
      </div>
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {actions.map(action => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={[
              'w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center',
              'transition-all duration-150 group-hover:scale-105 group-active:scale-95',
              action.bg, action.border, action.hover,
            ].join(' ')}>
              <action.icon className={['w-5 h-5 md:w-6 md:h-6', action.text].join(' ')} />
            </div>
            <span className="text-[10px] md:text-xs text-muted-foreground font-medium text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
