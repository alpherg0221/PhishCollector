import {JSX} from "react";
import {MdError, MdPlayArrow, MdStop} from "react-icons/md";

const defaultServer = "http://www.az.lab.uec.ac.jp:30080";
const defaultPath = "/PhishCollector/api"

const getApiServer = () => {
  const apiServer = localStorage.getItem("apiServer");
  return apiServer !== null ? apiServer : defaultServer;
}

const setApiServer = (apiServer: string) => {
  localStorage.setItem("apiServer", apiServer);
}

export class ServerStatus {
  public static readonly RUNNING = new ServerStatus("RUNNING", "#00B379", <MdPlayArrow color="#00B379"/>);
  public static readonly STOPPING = new ServerStatus("STOPPING", "#FF0000", <MdStop color="#FF0000"/>);
  public static readonly ERROR = new ServerStatus("ERROR", "#FF0000", <MdError color="#FF0000"/>);
  public static readonly LOADING = new ServerStatus("LOADING", undefined, undefined);

  public static fromCode(statusCode: number) {
    switch (statusCode) {
      case 200:
        return ServerStatus.RUNNING;
      case 500:
        return ServerStatus.ERROR;
      default:
        return ServerStatus.STOPPING;
    }
  }

  public constructor(
    private _value: string,
    private _color: string | undefined,
    private _icon: JSX.Element | undefined,
  ) {
  }

  public get value() {
    return this._value;
  }

  public get color() {
    return this._color;
  }

  public get icon() {
    return this._icon;
  }
}

export {
  defaultServer,
  defaultPath,
  getApiServer,
  setApiServer,
}