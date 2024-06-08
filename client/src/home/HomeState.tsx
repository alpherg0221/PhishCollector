import {create} from "zustand";
import {defaultServer, ServerStatus} from "../utils/server.tsx";
import {JSX} from "react";
import {GiFishBucket, GiFishing} from "react-icons/gi";
import {MdError, MdHelp, MdVerified} from "react-icons/md";
import {FoodFishFilled} from "@fluentui/react-icons";


class Warning {
  public static readonly Safe = new Warning(0, "#00B379", <MdVerified/>);
  public static readonly Unknown = new Warning(1, undefined, <MdHelp/>);
  public static readonly Phishing = new Warning(2, "#FF0000", <FoodFishFilled/>);

  public constructor(
    private _order: number,
    private _color: string | undefined,
    private _icon: JSX.Element,
  ) {
  }

  public get order() {
    return this._order
  }

  public get color() {
    return this._color;
  }

  public get icon() {
    return this._icon;
  }

  public get next() {
    switch (this) {
      case Warning.Safe:
        return Warning.Unknown;
      case Warning.Unknown:
        return Warning.Phishing;
      case Warning.Phishing:
        return Warning.Safe;
      default:
        return Warning.Unknown;
    }
  }
}

class CollectStatus {
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

class SortBy {
  public static readonly Url = new SortBy();
  public static readonly Target = new SortBy();
  public static readonly GSB = new SortBy();
  public static readonly Browser = new SortBy();
}

type UrlInfo = {
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

const defaultHomeState: HomeState = {
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

const useHomeState = create<HomeState & HomeAction>((set) => ({
  ...defaultHomeState,
  update: (newState) => set(newState),
  reset: () => set(defaultHomeState),
}));

export {
  Warning,
  CollectStatus,
  SortBy,
  defaultHomeState,
  useHomeState,
}
export type {
  UrlInfo,
}