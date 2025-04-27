
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { DropletIcon, Heart, ShowerHead, Sun, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

const GameUI: React.FC = () => {
  const { state, feedPet, playWithPet, cleanPet, toggleSleep } = useGame();
  
  const handleFeed = () => {
    if (state.isSleeping) {
      toast("Your pet is sleeping! Wake them up first.");
      return;
    }
    feedPet();
    toast("You fed your pet!");
  };
  
  const handlePlay = () => {
    if (state.isSleeping) {
      toast("Your pet is sleeping! Wake them up first.");
      return;
    }
    playWithPet();
    toast("Your pet enjoyed playtime!");
  };
  
  const handleClean = () => {
    if (state.isSleeping) {
      toast("Your pet is sleeping! Wake them up first.");
      return;
    }
    cleanPet();
    toast("Your pet is now clean!");
  };
  
  const handleSleep = () => {
    toggleSleep();
    if (!state.isSleeping) {
      toast("Your pet is now sleeping peacefully...");
    } else {
      toast("Your pet woke up!");
    }
  };
  
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-6">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleFeed}
              className="game-button"
              style={{ backgroundColor: 'hsl(var(--hunger-color))' }}
              disabled={state.isSleeping}
            >
              <DropletIcon size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Feed</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handlePlay}
              className="game-button"
              style={{ backgroundColor: 'hsl(var(--happiness-color))' }}
              disabled={state.isSleeping}
            >
              <Heart size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Play</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleClean}
              className="game-button"
              style={{ backgroundColor: 'hsl(var(--hygiene-color))' }}
              disabled={state.isSleeping}
            >
              <ShowerHead size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clean</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleSleep}
              className={`game-button ${state.isSleeping ? 'bg-yellow-500' : ''}`}
              style={{ backgroundColor: state.isSleeping ? 'hsl(var(--energy-color))' : 'hsl(230 60% 40%)' }}
            >
              {state.isSleeping ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{state.isSleeping ? 'Wake Up' : 'Sleep'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GameUI;
