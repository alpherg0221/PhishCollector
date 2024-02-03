import {create} from "zustand";

export enum Warning {
  Safe, Unknown, Phishing,
}

export type UrlInfo = {
  url: string,
  target: string,
  warning: {
    gsb: Warning,
    browser: Warning,
  }
}

type HomeState = {
  urlInfo: UrlInfo[];
  gsbDialogOpen: boolean;
};

type HomeAction = {
  update: (newState: Partial<HomeState>) => void;
  reset: () => void;
}

export const defaultHomeState: HomeState = {
  urlInfo: [{ url: "", target: "", warning: { gsb: Warning.Unknown, browser: Warning.Unknown } }],
  gsbDialogOpen: false,
}

export const useHomeState = create<HomeState & HomeAction>((set) => ({
  ...defaultHomeState,
  update: (newState) => set(newState),
  reset: () => set(defaultHomeState),
}));