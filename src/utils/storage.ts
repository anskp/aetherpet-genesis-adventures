
import { GameState } from '../contexts/GameContext';

const STORAGE_KEY = 'aetherpet_game_state';

// Save game state to local storage
export const saveGameState = (state: GameState): void => {
  try {
    // Convert Date objects to ISO strings for storage
    const serializedState = {
      ...state,
      lastInteraction: {
        feed: state.lastInteraction.feed?.toISOString() || null,
        play: state.lastInteraction.play?.toISOString() || null,
        clean: state.lastInteraction.clean?.toISOString() || null,
        sleep: state.lastInteraction.sleep?.toISOString() || null,
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedState));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

// Load game state from local storage
export const loadGameState = (): Partial<GameState> | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    
    if (!savedState) return null;
    
    const parsedState = JSON.parse(savedState);
    
    // Convert ISO strings back to Date objects
    return {
      ...parsedState,
      lastInteraction: {
        feed: parsedState.lastInteraction.feed ? new Date(parsedState.lastInteraction.feed) : null,
        play: parsedState.lastInteraction.play ? new Date(parsedState.lastInteraction.play) : null,
        clean: parsedState.lastInteraction.clean ? new Date(parsedState.lastInteraction.clean) : null,
        sleep: parsedState.lastInteraction.sleep ? new Date(parsedState.lastInteraction.sleep) : null,
      }
    };
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

// Clear game state from local storage (for resets)
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
};
