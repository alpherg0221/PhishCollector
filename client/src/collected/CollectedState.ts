import {create} from "zustand";
import {defaultPath, defaultServer, ServerStatus} from "../utils/server.tsx";
import {enqueueSnackbar} from "notistack";

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
  loadData: () => Promise<void>;
  update: (newState: Partial<CollectedState>) => void;
  reset: () => void;
}

export const defaultCollectedState: CollectedState = {
  phishInfo: [],
  apiServer: defaultServer,
  serverStatus: ServerStatus.LOADING,
}

export const useCollectedState = create<CollectedState & CollectedAction>((update) => ({
  ...defaultCollectedState,
  loadData: async () => {
    update({ phishInfo: [] });
    await fetch(
      `${ defaultServer }${ defaultPath }/collected/list`,
      { mode: "cors", signal: AbortSignal.timeout(5000), }
    ).then(async res => update(
      { phishInfo: (await res.json() as PhishInfo[]).toSorted((a, b) => -a.date.localeCompare(b.date)) },
    )).catch(() => enqueueSnackbar(
      "Failed to load data",
      { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "center" }, },
    ));
  },
  update: (newState) => update(newState),
  reset: () => update(defaultCollectedState),
}));