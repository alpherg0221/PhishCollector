import {create} from "zustand";

export enum Warning {
  Safe, Unknown, Phishing,
}

export const warningOrder = Object.values(Warning);

export const warningNextTo = (warning: Warning) => {
  switch (warning) {
    case Warning.Safe:
      return Warning.Unknown;
    case Warning.Unknown:
      return Warning.Phishing;
    case Warning.Phishing:
      return Warning.Safe;
  }
}

export enum SortBy {
  Url, Target, GSB, Browser,
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