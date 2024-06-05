import {create} from "zustand";
import {defaultServer, ServerStatus} from "../utils/server.tsx";
import {JSX} from "react";
import {GiFishBucket, GiFishing} from "react-icons/gi";
import {MdError} from "react-icons/md";

export enum Warning {
  Safe, Unknown, Phishing,
}

export class CollectStatus {
  public static readonly NotCollected = new CollectStatus("NotCollected", <GiFishing/>, "Crawl Phishing Page");
  public static readonly Collecting = new CollectStatus("Collecting", undefined, "Collecting");
  public static readonly Collected = new CollectStatus("Collected", <GiFishBucket color="#00B379"/>, "Collected");
  public static readonly Error = new CollectStatus("Error", <MdError color="#FF0000"/>, "Server Error");

  public constructor(
    private _value: string,
    private _icon: JSX.Element | undefined,
    private _tooltip: string,
  ) {
  }

  public get value() {
    return this._value;
  }

  public get icon() {
    return this._icon;
  }

  public get tooltip() {
    return this._tooltip;
  }
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
  },
  status: CollectStatus
}

type HomeState = {
  urlInfo: UrlInfo[];
  serverDialogOpen: boolean;
  gsbDialogOpen: boolean;
  apiServer: string;
  serverStatus: ServerStatus;
};

type HomeAction = {
  update: (newState: Partial<HomeState>) => void;
  reset: () => void;
}

export const defaultHomeState: HomeState = {
  urlInfo: [{
    url: "",
    target: "",
    warning: { gsb: Warning.Unknown, browser: Warning.Unknown },
    status: CollectStatus.NotCollected,
  }],
  serverDialogOpen: false,
  gsbDialogOpen: false,
  apiServer: defaultServer,
  serverStatus: ServerStatus.LOADING,
}

export const useHomeState = create<HomeState & HomeAction>((set) => ({
  ...defaultHomeState,
  update: (newState) => set(newState),
  reset: () => set(defaultHomeState),
}));