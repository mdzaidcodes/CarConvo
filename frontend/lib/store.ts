/**
 * Global State Management using Zustand
 * Manages app-wide state including session, profile, and recommendations
 */

import { create } from 'zustand';
import { LifestyleProfile, Car } from './api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AppState {
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Personality Test
  lifestyleProfile: LifestyleProfile | null;
  setLifestyleProfile: (profile: LifestyleProfile) => void;

  // Budget
  budget: number | null;
  setBudget: (budget: number) => void;

  // Conversation
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  // Car Recommendations
  recommendedCars: Car[];
  setRecommendedCars: (cars: Car[]) => void;

  // Selected cars for comparison
  selectedCars: string[];
  toggleSelectedCar: (carId: string) => void;
  clearSelectedCars: () => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset everything
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  sessionId: null,
  lifestyleProfile: null,
  budget: null,
  messages: [],
  recommendedCars: [],
  selectedCars: [],
  isLoading: false,

  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  
  setLifestyleProfile: (profile) => set({ lifestyleProfile: profile }),
  
  setBudget: (budget) => set({ budget }),
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  clearMessages: () => set({ messages: [] }),
  
  setRecommendedCars: (cars) => set({ recommendedCars: cars }),
  
  toggleSelectedCar: (carId) =>
    set((state) => ({
      selectedCars: state.selectedCars.includes(carId)
        ? state.selectedCars.filter((id) => id !== carId)
        : [...state.selectedCars, carId].slice(0, 3), // Max 3 cars
    })),
  
  clearSelectedCars: () => set({ selectedCars: [] }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  reset: () =>
    set({
      sessionId: null,
      lifestyleProfile: null,
      budget: null,
      messages: [],
      recommendedCars: [],
      selectedCars: [],
      isLoading: false,
    }),
}));

