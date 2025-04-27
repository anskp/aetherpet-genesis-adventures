
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Heart, DropletIcon, Sun, ShowerHead } from 'lucide-react';

const GameStats: React.FC = () => {
  const { state } = useGame();
  
  const getStatColor = (value: number): string => {
    if (value > 70) return 'bg-green-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="w-full px-4 py-2 bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-[hsl(var(--happiness-color))]" />
            <span className="text-sm font-medium">Happiness</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${getStatColor(state.stats.happiness)}`} 
              style={{ width: `${state.stats.happiness}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DropletIcon size={18} className="text-[hsl(var(--hunger-color))]" />
            <span className="text-sm font-medium">Hunger</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${getStatColor(state.stats.hunger)}`} 
              style={{ width: `${state.stats.hunger}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sun size={18} className="text-[hsl(var(--energy-color))]" />
            <span className="text-sm font-medium">Energy</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${getStatColor(state.stats.energy)}`} 
              style={{ width: `${state.stats.energy}%` }}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShowerHead size={18} className="text-[hsl(var(--hygiene-color))]" />
            <span className="text-sm font-medium">Hygiene</span>
          </div>
          <div className="stat-bar">
            <div 
              className={`stat-bar-fill ${getStatColor(state.stats.hygiene)}`} 
              style={{ width: `${state.stats.hygiene}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Age:</span>
          <span className="text-sm font-medium">{state.petAge} days</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Mood:</span>
          <span className="text-sm font-medium capitalize">{state.mood}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs opacity-70">Stage:</span>
          <span className="text-sm font-medium capitalize">{state.petStage}</span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
