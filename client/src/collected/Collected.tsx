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
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
} from "@fluentui/react-components";
import {FoodFishFilled} from "@fluentui/react-icons";
import {TitleHeader} from "../components/TitleHeader.tsx";

const downloadData = async (url: string) => {
  window.open(`http:///www.az.lab.uec.ac.jp:30080/~ywatanabe/PhishCollector/api/collected/download?url=${ url }`, "_blank");
}

const downloadDataAll = async () => {
  window.open("http:///www.az.lab.uec.ac.jp:30080/~ywatanabe/PhishCollector/api/collected/downloadAll", "_blank");
}

function Collected() {
  const state = useCollectedState();

  const loadData = async () => {
    const server = "http:///www.az.lab.uec.ac.jp:30080/~ywatanabe/PhishCollector/api/collected/list";
    const phishInfo: PhishInfo[] = await fetch(server, { mode: "cors" }).then(res => res.json());
    state.update({ phishInfo: phishInfo.toSorted((a, b) => -a.date.localeCompare(b.date)) });
  }

  return (
    <div className="centeringHorizontal">
      <StackShim horizontalAlign="center" tokens={ { childrenGap: 48, padding: "48px 0px 48px 0px" } }>
        { /*タイトル*/ }
        <TitleHeader/>

        <StackShim>
          <Toolbar>
            <ToolbarButton
              children={ "Download Data" }
              icon={ <MdDownload/> }
              onClick={ async () => await downloadDataAll() }
            />

            <ToolbarDivider/>

            <ToolbarButton
              children={ "Load Data" }
              icon={ <MdRefresh/> }
              onClick={ async () => await loadData() }
            />
          </Toolbar>
        </StackShim>

        <StackShim tokens={ { childrenGap: 12 } }>
          <PhishInfoHeader/>
          <Divider appearance={ "brand" }/>

          { state.phishInfo.map(info => (
            <StackShim tokens={ { childrenGap: 12 } }>
              <PhishInfoRow info={ info }/>
              <Divider appearance={ "strong" }/>
            </StackShim>
          )) }
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

{/*各行の要素*/}
const PhishInfoRow = (props: { info: PhishInfo }) => {
  return (
    <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 24, padding: "0px 48px 0px 48px" } }>
      {/*日付*/}
      <Body2 style={ { width: 180 + 18 + 8 } }>{ props.info.date }</Body2>

      {/*URL*/}
      <Tooltip content={ props.info.url } relationship={ "label" } withArrow>
        <Body2 style={ { width: "calc(18px + 8px + 35svw)" } } truncate wrap={ false }>{ props.info.url }</Body2>
      </Tooltip>

      {/*ターゲット*/}
      <Body2 style={ { width: 140 + 18 + 8 } }>{ props.info.target }</Body2>

      {/*GSB*/}
      <StackShim horizontal verticalAlign={ "center" } tokens={ { padding: "0px 19px 0px 19px" } }>
        { props.info.gsb
          ? <FoodFishFilled fontSize={ 20 } color={ "#FF0000" }/>
          : <MdVerified size={ 20 } color={ "#00B379" }/> }
      </StackShim>

      {/*ダウンロードボタン*/}
      <StackShim horizontal verticalAlign={ "center" } tokens={ { padding: "0px 0px 0px 12px" } }>
        <Button
          icon={ <MdDownload size={ 20 }/> }
          size={ "small" }
          onClick={ async () => await downloadData(props.info.url) }
        />
      </StackShim>
    </StackShim>
  );
}

export default Collected;