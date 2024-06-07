import "./Collected.css";
import {PhishInfo, useCollectedState} from "./CollectedState.ts";
import {StackShim} from "@fluentui/react-migration-v8-v9";
import {
  MdCalendarMonth,
  MdCrisisAlert,
  MdDownload,
  MdLink,
  MdRefresh, MdSecurity,
  MdVerified
} from "react-icons/md";
import {
  Body1Strong,
  Body2,
  Button,
  Divider,
  Spinner,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
} from "@fluentui/react-components";
import {FoodFishFilled} from "@fluentui/react-icons";
import {TitleHeader} from "../components/TitleHeader.tsx";
import {useEffect} from "react";
import {enqueueSnackbar} from "notistack";
import {defaultPath, defaultServer, getApiServer} from "../utils/server.tsx";

function Collected() {
  const state = useCollectedState();

  const loadData = async () => {
    const server = `${ defaultServer }${ defaultPath }/collected/list`;
    state.update({ phishInfo: [] });
    try {
      const response = await fetch(server, { mode: "cors" });
      const phishInfo: PhishInfo[] = await response.json();
      state.update({ phishInfo: phishInfo.toSorted((a, b) => -a.date.localeCompare(b.date)) });
    } catch {
      enqueueSnackbar("Failed to load data", {
        variant: "error",
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
    }
  }

  useEffect(() => {
    loadData().then();
    state.update({ apiServer: getApiServer() });
  }, []);

  return (
    <div className="centeringHorizontal">
      <StackShim horizontalAlign="center" tokens={ { padding: "48px 0px 48px 0px" } }>
        { /*タイトル*/ }
        <TitleHeader/>

        <StackShim className="header" tokens={ { padding: "48px 0px 12px 0px" } }>
          <StackShim horizontal horizontalAlign="center" tokens={ { padding: "0px 0px 48px 0px" } }>
            <Toolbar>
              <ToolbarButton
                children={ "Download Data" }
                icon={ <MdDownload/> }
                onClick={ () => window.open(`${ state.apiServer }${ defaultPath }/collected/downloadAll`, "_blank") }
              />

              <ToolbarDivider/>

              <ToolbarButton
                children={ "Refresh" }
                icon={ <MdRefresh/> }
                onClick={ async () => await loadData() }
              />
            </Toolbar>
          </StackShim>

          <PhishInfoHeader/>
          <Divider appearance={ "brand" } style={ { paddingTop: 12 } }/>
        </StackShim>

        <StackShim tokens={ { childrenGap: 12 } }>
          { state.phishInfo.length > 0
            ? state.phishInfo.map(info => (
              <StackShim tokens={ { childrenGap: 12 } }>
                <PhishInfoRow info={ info }/>
                <Divider appearance={ "strong" }/>
              </StackShim>
            ))
            : <Spinner size={ "huge" } style={ { paddingTop: 96 } }/>
          }
        </StackShim>
      </StackShim>
    </div>
  );
}

const PhishInfoHeader = () => {
  return (
    <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 24, padding: "0px 48px 0px 48px" } }>
      <StackShim horizontal verticalAlign={ "center" }>
        <MdCalendarMonth size={ 18 } style={ { marginRight: 8 } }/>
        <Body1Strong style={ { width: 180 } }> DATE </Body1Strong>
      </StackShim>

      <StackShim horizontal verticalAlign={ "center" }>
        <MdLink size={ 18 } style={ { marginRight: 8 } }/>
        <Body1Strong style={ { width: "35svw" } }> URL </Body1Strong>
      </StackShim>

      <StackShim horizontal verticalAlign={ "center" }>
        <MdCrisisAlert size={ 18 } style={ { marginRight: 8 } }/>
        <Body1Strong style={ { width: 140 } }> TARGET </Body1Strong>
      </StackShim>

      <StackShim horizontal verticalAlign={ "center" }>
        <MdSecurity size={ 18 } style={ { marginRight: 8 } }/>
        <Body1Strong style={ { width: 32 } }> GSB </Body1Strong>
      </StackShim>

      <Body1Strong style={ { width: 36 } }> </Body1Strong>
    </StackShim>
  );
}

const PhishInfoRow = (props: { info: PhishInfo }) => {
  const state = useCollectedState();

  return (
    <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 24, padding: "0px 48px 0px 48px" } }>
      <Body2 style={ { width: 180 + 18 + 8 } }>{ props.info.date }</Body2>

      <Tooltip content={ props.info.url } relationship={ "label" } withArrow>
        <Body2 style={ { width: "calc(18px + 8px + 35svw)" } } truncate wrap={ false }>{ props.info.url }</Body2>
      </Tooltip>

      <Tooltip content={ props.info.target } relationship={ "label" } withArrow>
        <Body2 style={ { width: 140 + 18 + 8 } } truncate wrap={ false }>{ props.info.target }</Body2>
      </Tooltip>

      <StackShim horizontal verticalAlign={ "center" } tokens={ { padding: "0px 19px 0px 19px" } }>
        { props.info.gsb
          ? <FoodFishFilled fontSize={ 20 } color={ "#FF0000" }/>
          : <MdVerified size={ 20 } color={ "#00B379" }/> }
      </StackShim>

      <StackShim horizontal verticalAlign={ "center" } tokens={ { padding: "0px 0px 0px 12px" } }>
        <Button
          icon={ <MdDownload size={ 20 }/> }
          size={ "small" }
          onClick={ () =>
            window.open(`${ state.apiServer }${ defaultPath }/collected/download?url=${ props.info.url }`, "_blank")
          }
        />
      </StackShim>
    </StackShim>
  );
}

export default Collected;