import React from 'react';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { ROADMAP, PHASES } from '../constants';

interface ProgressBarProps {
  currentDay: number;      // Dia selecionado atualmente
  unlockedDays: number;    // Até onde o usuário chegou
  onSelectDay: (day: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentDay, unlockedDays, onSelectDay }) => {
  return (
    <div className="w-full h-full overflow-y-auto p-4 bg-white border-r border-brand-100">
      <h2 className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-2">
        <span>🗓️</span> Roteiro de 60 Dias
      </h2>

      <div className="space-y-6">
        {PHASES.map((phase) => (
          <div key={phase.id} className="relative">
            <div className="sticky top-0 bg-white z-10 py-2 border-b border-brand-100 mb-2">
              <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider">{phase.name}</h3>
              <p className="text-xs text-gray-500">{phase.description}</p>
            </div>
            
            <div className="space-y-2 pl-2 border-l-2 border-brand-100 ml-1">
              {ROADMAP.filter(d => d.phase === phase.id).map((dayPlan) => {
                 // Um dia está completo se for menor que o dia atual MÁXIMO (unlockedDays)
                 // Ou se quisermos ser estritos: menor que o unlocked.
                 const isUnlocked = dayPlan.day <= unlockedDays;
                 const isCompleted = dayPlan.day < unlockedDays;
                 const isSelected = dayPlan.day === currentDay;

                 return (
                   <button
                    key={dayPlan.day}
                    onClick={() => isUnlocked && onSelectDay(dayPlan.day)}
                    disabled={!isUnlocked}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-start gap-3
                      ${isSelected ? 'bg-brand-50 border border-brand-200' : 'hover:bg-gray-50'}
                      ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                   >
                     <div className="mt-1">
                       {isSelected ? (
                         <Circle className="w-4 h-4 text-brand-500 fill-brand-500" />
                       ) : isCompleted ? (
                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                       ) : (
                         <Lock className="w-4 h-4 text-gray-300" />
                       )}
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-800">Dia {dayPlan.day}: {dayPlan.title}</div>
                       <div className="text-xs text-gray-500 line-clamp-1">{dayPlan.focus}</div>
                     </div>
                   </button>
                 );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;