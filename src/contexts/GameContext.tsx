
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { saveGameState, loadGameState } from '../utils/storage';

// Types
export type PetStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';
export type PetMood = 'happy' | 'hungry' | 'tired' | 'dirty' | 'sick' | 'neutral' | 'sad';
export type PetType = 'none' | 'fire' | 'water' | 'forest' | 'electric';

export interface GameState {
  petName: string;
  petStage: PetStage;
  petType: PetType;
  petAge: number; // Days since birth
  stats: {
    hunger: number; // 0-100
    happiness: number; // 0-100
    energy: number; // 0-100
    hygiene: number; // 0-100
  };
  lastInteraction: {
    feed: Date | null;
    play: Date | null;
    clean: Date | null;
    sleep: Date | null;
  };
  mood: PetMood;
  isSleeping: boolean;
  showIntro: boolean;
  gameTime: number; // Internal game time in minutes
}

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: Partial<GameState> }
  | { type: 'SET_PET_NAME'; payload: string }
  | { type: 'SET_PET_TYPE'; payload: PetType }
  | { type: 'FEED_PET' }
  | { type: 'PLAY_WITH_PET' }
  | { type: 'CLEAN_PET' }
  | { type: 'TOGGLE_SLEEP' }
  | { type: 'UPDATE_STATS'; payload: Partial<GameState['stats']> }
  | { type: 'UPDATE_MOOD' }
  | { type: 'PROGRESS_TIME' }
  | { type: 'COMPLETE_INTRO' };

const DEFAULT_STATE: GameState = {
  petName: '',
  petStage: 'egg',
  petType: 'none',
  petAge: 0,
  stats: {
    hunger: 70,
    happiness: 70,
    energy: 70,
    hygiene: 70,
  },
  lastInteraction: {
    feed: null,
    play: null,
    clean: null,
    sleep: null,
  },
  mood: 'neutral',
  isSleeping: false,
  showIntro: true,
  gameTime: 0,
};

// Determine pet's mood based on stats
const calculateMood = (stats: GameState['stats'], isSleeping: boolean): PetMood => {
  if (isSleeping) return 'neutral';
  
  if (stats.hunger < 30) return 'hungry';
  if (stats.energy < 30) return 'tired';
  if (stats.hygiene < 30) return 'dirty';
  if (stats.happiness < 30) return 'sad';
  if (stats.hunger > 70 && stats.happiness > 70 && stats.energy > 70 && stats.hygiene > 70) return 'happy';
  
  return 'neutral';
};

// Game reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return { ...state, ...action.payload };
      
    case 'SET_PET_NAME':
      return { ...state, petName: action.payload };
    
    case 'SET_PET_TYPE':
      return { 
        ...state, 
        petType: action.payload,
        petStage: 'baby', // Hatches from egg
      };
    
    case 'FEED_PET':
      const newHunger = Math.min(100, state.stats.hunger + 30);
      return {
        ...state,
        stats: {
          ...state.stats,
          hunger: newHunger,
        },
        lastInteraction: {
          ...state.lastInteraction,
          feed: new Date(),
        },
      };
    
    case 'PLAY_WITH_PET':
      const newHappiness = Math.min(100, state.stats.happiness + 30);
      return {
        ...state,
        stats: {
          ...state.stats,
          happiness: newHappiness,
          energy: Math.max(5, state.stats.energy - 10), // Playing uses some energy
        },
        lastInteraction: {
          ...state.lastInteraction,
          play: new Date(),
        },
      };
    
    case 'CLEAN_PET':
      const newHygiene = Math.min(100, state.stats.hygiene + 40);
      return {
        ...state,
        stats: {
          ...state.stats,
          hygiene: newHygiene,
        },
        lastInteraction: {
          ...state.lastInteraction,
          clean: new Date(),
        },
      };
    
    case 'TOGGLE_SLEEP':
      return {
        ...state,
        isSleeping: !state.isSleeping,
        lastInteraction: {
          ...state.lastInteraction,
          sleep: new Date(),
        },
        stats: {
          ...state.stats,
          energy: state.isSleeping 
            ? state.stats.energy // No immediate change when waking up
            : Math.min(100, state.stats.energy + 10), // Immediate small energy boost when going to sleep
        },
      };
    
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };
    
    case 'UPDATE_MOOD':
      const newMood = calculateMood(state.stats, state.isSleeping);
      return {
        ...state,
        mood: newMood,
      };
    
    case 'PROGRESS_TIME':
      // Natural stat decay over time
      // Slower decay when sleeping
      const decayMultiplier = state.isSleeping ? 0.3 : 1;
      const energyChange = state.isSleeping ? 1 : -1; // Gain energy while sleeping, lose while awake
      
      return {
        ...state,
        gameTime: state.gameTime + 1,
        petAge: state.gameTime % 1440 === 0 // 1440 minutes = 1 day
          ? state.petAge + 1
          : state.petAge,
        stats: {
          ...state.stats,
          hunger: Math.max(0, state.stats.hunger - (0.5 * decayMultiplier)),
          happiness: Math.max(0, state.stats.happiness - (0.3 * decayMultiplier)),
          hygiene: Math.max(0, state.stats.hygiene - (0.2 * decayMultiplier)),
          energy: Math.max(0, Math.min(100, state.stats.energy + energyChange * 0.5)),
        },
      };
    
    case 'COMPLETE_INTRO':
      return {
        ...state,
        showIntro: false,
      };
    
    default:
      return state;
  }
};

// Create context
interface GameContextType {
  state: GameState;
  feedPet: () => void;
  playWithPet: () => void;
  cleanPet: () => void;
  toggleSleep: () => void;
  setPetName: (name: string) => void;
  setPetType: (type: PetType) => void;
  completeIntro: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, DEFAULT_STATE);
  
  // Initialize game from saved state or default
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: 'INITIALIZE_GAME', payload: savedState });
    }
  }, []);
  
  // Save game state on changes
  useEffect(() => {
    if (!state.showIntro) { // Don't save during intro
      saveGameState(state);
    }
  }, [state]);
  
  // Update mood when stats change
  useEffect(() => {
    dispatch({ type: 'UPDATE_MOOD' });
  }, [state.stats, state.isSleeping]);
  
  // Game time progression - runs every minute (simulated as 1 second for demo)
  useEffect(() => {
    const gameTimer = setInterval(() => {
      dispatch({ type: 'PROGRESS_TIME' });
    }, 1000); // 1 second = 1 minute in game time
    
    return () => clearInterval(gameTimer);
  }, []);
  
  // Game actions
  const feedPet = () => {
    if (!state.isSleeping) {
      dispatch({ type: 'FEED_PET' });
    }
  };
  
  const playWithPet = () => {
    if (!state.isSleeping) {
      dispatch({ type: 'PLAY_WITH_PET' });
    }
  };
  
  const cleanPet = () => {
    if (!state.isSleeping) {
      dispatch({ type: 'CLEAN_PET' });
    }
  };
  
  const toggleSleep = () => {
    dispatch({ type: 'TOGGLE_SLEEP' });
  };
  
  const setPetName = (name: string) => {
    dispatch({ type: 'SET_PET_NAME', payload: name });
  };
  
  const setPetType = (type: PetType) => {
    dispatch({ type: 'SET_PET_TYPE', payload: type });
  };
  
  const completeIntro = () => {
    dispatch({ type: 'COMPLETE_INTRO' });
  };
  
  return (
    <GameContext.Provider value={{
      state,
      feedPet,
      playWithPet,
      cleanPet,
      toggleSleep,
      setPetName,
      setPetType,
      completeIntro
    }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
