
import React from 'react';
import { GameProvider, useGame } from '../contexts/GameContext';
import GameScene from '../components/GameScene';
import GameUI from '../components/GameUI';
import GameStats from '../components/GameStats';
import IntroSequence from '../components/IntroSequence';

// The main game component
const GameContent = () => {
  const { state } = useGame();
  
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden game-container">
      {state.showIntro ? (
        <IntroSequence />
      ) : (
        <>
          <header className="absolute top-0 left-0 right-0 p-4 z-10">
            <h1 className="text-center font-bold text-xl md:text-2xl">
              {state.petName ? `${state.petName} the AetherPet` : 'AetherPet Genesis'}
            </h1>
          </header>
          
          <div className="absolute top-16 left-0 right-0 px-4 z-10">
            <GameStats />
          </div>
          
          <div className="w-full h-screen">
            <GameScene />
          </div>
          
          <GameUI />
        </>
      )}
    </div>
  );
};

// The page component with provider
const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;
