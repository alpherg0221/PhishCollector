import {create} from "zustand";
import {defaultServer, ServerStatus} from "../utils/server.tsx";

export type PhishInfo = {
  url: string,
  date: string,
  target: string,
  gsb: string,
}

type CollectedState = {
  phishInfo: PhishInfo[];
  apiServer: string;
  serverStatus: ServerStatus;
};

type CollectedAction = {
  update: (newState: Partial<CollectedState>) => void;
  reset: () => void;
}

export const defaultCollectedState: CollectedState = {
  phishInfo: [],
  apiServer: defaultServer,
  serverStatus: ServerStatus.LOADING,
}

export const useCollectedState = create<CollectedState & CollectedAction>((set) => ({
  ...defaultCollectedState,
  update: (newState) => set(newState),
  reset: () => set(defaultCollectedState),
}));