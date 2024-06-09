import {create} from "zustand";
import {defaultPath, defaultServer, getApiServer, ServerStatus, setApiServer} from "../utils/server.tsx";
import {JSX} from "react";
import {GiFishBucket, GiFishing} from "react-icons/gi";
import {MdError, MdHelp, MdVerified} from "react-icons/md";
import {FoodFishFilled} from "@fluentui/react-icons";
import {checkGSB} from "../utils/gsb.ts";
import {updateArray} from "../utils/extension.ts";
import {formatURL} from "../utils/url.ts";


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
  warningGSB: Warning,
  warningBrowser: Warning,
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
  // UPDATE urlInfo
  checkGSB: () => Promise<void>;
  sortUrlInfo: (sortBy: SortBy) => void,
  pasteUrl: (index: number, newValue: string) => void,
  changeUrl: (index: number, newValue: string) => void,
  changeTarget: (index: number, newValue: string) => void,
  fillTarget: (index: number) => void,
  changeBrowserWarning: (index: number) => void,
  collectPhish: (index: number) => Promise<void>,
  deleteUrlInfo: (index: number) => void,
  addUrlInfo: () => void,
  // UPDATE serverDialogOpen
  openServerDialog: () => void;
  closeServerDialog: () => void;
  // UPDATE gsbDialogOpen
  openGSBDialog: () => void;
  closeGSBDialog: () => void;
  // UPDATE apiServer
  updateApiServer: (server?: string) => void;
  // UPDATE serverStatus
  updateServerStatus: () => Promise<void>;
  update: (newState: Partial<HomeState>) => void;
  reset: () => void;
}

const defaultHomeState: HomeState = {
  urlInfo: [{
    url: "",
    target: "",
    warningGSB: Warning.Unknown,
    warningBrowser: Warning.Unknown,
    status: CollectStatus.NotCollected,
  }],
  serverDialogOpen: false,
  gsbDialogOpen: false,
  apiServer: defaultServer,
  serverStatus: ServerStatus.LOADING,
}

const useHomeState = create<HomeState & HomeAction>((set, get) => ({
  ...defaultHomeState,
  // UPDATE urlInfo
  checkGSB: async () => {
    set({ urlInfo: await checkGSB(get().urlInfo) });
    get().closeGSBDialog();
  },
  sortUrlInfo: (sortBy: SortBy) => {
    switch (sortBy) {
      case SortBy.Url:
        set({ urlInfo: get().urlInfo.toSorted((a, b) => a.url.localeCompare(b.url)) });
        break;
      case SortBy.Target:
        set({ urlInfo: get().urlInfo.toSorted((a, b) => a.target.localeCompare(b.target)) });
        break;
      case SortBy.GSB:
        set({ urlInfo: get().urlInfo.toSorted((a, b) => a.warningGSB.order - b.warningGSB.order) });
        break;
      case SortBy.Browser:
        set({ urlInfo: get().urlInfo.toSorted((a, b) => a.warningBrowser.order - b.warningBrowser.order) });
        break;
    }
  },
  pasteUrl: (index, newValue) => {
    // eslint-disable-next-line no-control-regex
    const urlInfo = newValue.split(RegExp(" |\r|\n|\r\n")).map(url => ({
      ...defaultHomeState.urlInfo[0], url: url,
    }));

    set({
      urlInfo: [...updateArray(get().urlInfo, index, urlInfo[0]), ...urlInfo.slice(1)] // 値の更新と追加
        .map(info => ({ ...info, url: formatURL(info.url) }))  // URLを整形
        .filter(info => info.url.includes("http") || RegExp("[A-Za-z]+.[A-Za-z]+").test(info.url))  // URL以外を除去
        .map(info => ({ ...info, url: !info.url.includes("http") ? `https://${ info.url }` : info.url }))  // httpsを追加
    });
  },
  changeUrl: (index, newValue) => set({
    urlInfo: updateArray(
      get().urlInfo,
      index,
      { ...get().urlInfo[index], url: formatURL(newValue), }
    )
  }),
  changeTarget: (index, newValue) => set({
    urlInfo: updateArray(
      get().urlInfo,
      index,
      { ...get().urlInfo[index], target: newValue, }
    )
  }),
  fillTarget: (index) => set({
    urlInfo: get().urlInfo.map((info) => ({
      ...info,
      target: get().urlInfo[index].target
    }))
  }),
  changeBrowserWarning: (index) => set({
    urlInfo: updateArray(
      get().urlInfo,
      index,
      { ...get().urlInfo[index], warningBrowser: get().urlInfo[index].warningBrowser.next },
    )
  }),
  collectPhish: async (index) => {
    if (get().urlInfo[index].warningBrowser === Warning.Unknown) return;

    set({ urlInfo: updateArray(get().urlInfo, index, { ...get().urlInfo[index], status: CollectStatus.Collecting }) });

    const urlInfo = get().urlInfo[index];
    await fetch(`${ get().apiServer }${ defaultPath }/crawler/collect?url=${ urlInfo.url }&target=${ urlInfo.target }&gsb=${ urlInfo.warningBrowser === Warning.Phishing }`)
      .then(async res => set({
        urlInfo: updateArray(get().urlInfo, index, {
          ...get().urlInfo[index],
          status: await res.text() === "OK" ? CollectStatus.Collected : CollectStatus.Error,
        })
      })).catch(() => set({
        urlInfo: updateArray(get().urlInfo, index, { ...get().urlInfo[index], status: CollectStatus.Error }),
      }));
  },
  deleteUrlInfo: (index) => set({ urlInfo: get().urlInfo.filter((_, idx) => idx !== index) }),
  addUrlInfo: () => set({ urlInfo: [...get().urlInfo, ...defaultHomeState.urlInfo] }),
  // UPDATE serverDialogOpen
  openServerDialog: () => set({ serverDialogOpen: true }),
  closeServerDialog: () => set({ serverDialogOpen: false }),
  // UPDATE gsbDialogOpen
  openGSBDialog: () => set({ gsbDialogOpen: true }),
  closeGSBDialog: () => set({ gsbDialogOpen: false }),
  // UPDATE apiServer
  updateApiServer: (server) => {
    if (server) {
      setApiServer(server);
      set({ apiServer: server });
    } else {
      set({ apiServer: getApiServer() });
    }
  },
  // UPDATE serverStatus
  updateServerStatus: async () => {
    set({ serverStatus: ServerStatus.LOADING });
    return await fetch(`${ get().apiServer }${ defaultPath }/status`, { signal: AbortSignal.timeout(5000) })
      .then(res => set({ serverStatus: ServerStatus.fromCode(res.status) }))
      .catch(e => set({ serverStatus: e.message === "signal timed out" ? ServerStatus.STOPPING : ServerStatus.ERROR }));
  },
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