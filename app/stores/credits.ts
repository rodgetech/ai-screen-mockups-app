import { create } from "zustand";

interface UserCredits {
  screenCredits: number;
  revisionCredits: number;
  remainingScreenCredits: number;
  remainingRevisionCredits: number;
}

interface CreditsState {
  credits: UserCredits | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  setCredits: (credits: UserCredits) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useCreditsStore = create<CreditsState>((set) => ({
  credits: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  setCredits: (credits) => set({ credits, lastUpdated: Date.now() }),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}));
