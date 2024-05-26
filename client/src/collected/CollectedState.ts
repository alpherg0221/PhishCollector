import {create} from "zustand";

export type PhishInfo = {
  url: string,
  date: string,
  target: string,
  gsb: string,
}

type CollectedState = {
  phishInfo: PhishInfo[];
};

type CollectedAction = {
  update: (newState: Partial<CollectedState>) => void;
  reset: () => void;
}

export const defaultCollectedState: CollectedState = {
  phishInfo: [],
}

export const useCollectedState = create<CollectedState & CollectedAction>((set) => ({
  ...defaultCollectedState,
  update: (newState) => set(newState),
  reset: () => set(defaultCollectedState),
}));