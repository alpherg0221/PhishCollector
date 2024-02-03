import './Home.css'
import {defaultHomeState, UrlInfo, useHomeState, Warning} from "./HomeState.tsx";
import {StackShim} from "@fluentui/react-migration-v8-v9";
import {
  Body1Strong,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  InputProps,
  LargeTitle,
  Text,
  Toolbar, ToolbarButton,
  ToolbarDivider,
  Tooltip
} from "@fluentui/react-components";
import {FoodFish20Filled, FoodFishFilled} from "@fluentui/react-icons";
import {InputOnChangeData} from "@fluentui/react-input";
import {formatURL} from "../utils/url.ts";
import {MouseEventHandler, useRef} from "react";
import {
  MdAddLink,
  MdClose, MdContentCopy,
  MdCopyAll, MdCrisisAlert,
  MdDeleteForever, MdDoneAll,
  MdHelp,
  MdOpenInNew,
  MdSailing,
  MdSecurity,
  MdTravelExplore,
  MdVerified
} from "react-icons/md";
import {DialogOpenChangeEventHandler} from "@fluentui/react-dialog";
import {checkGSB} from "../utils/gsb.ts";
import {sleep} from "../utils/sleep.ts";

function Home() {
  const state = useHomeState();

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const onURLChange = (idx: number, data: InputOnChangeData) => {
    // 新しい状態の作成
    const newUrlInfo = state.urlInfo
      .map((info, index) => index === idx ? { ...info, url: data.value } : info) // 値の更新
      .map(info => ({ ...info, url: formatURL(info.url) }) as UrlInfo)  // URLを整形

    // 状態を更新
    state.update({ urlInfo: newUrlInfo });
  }

  const onURLPaste = (idx: number, data: string) => {
    // 複数URLを分割してUrlInfoに変換
    const urlInfo = data.split(" ").map(url => ({
      url: url,
      target: "",
      warning: { gsb: Warning.Unknown, browser: Warning.Unknown }
    } as UrlInfo));

    // 新しい状態の作成
    const newUrlInfo = [...state.urlInfo.map((info, index) => index === idx ? urlInfo[0] : info), ...urlInfo.slice(1)] // 値の更新と追加
      .map(info => ({ ...info, url: formatURL(info.url) }) as UrlInfo)  // URLを整形
      .filter(info => info.url.includes("http"));  // URL以外を除去

    // 状態を更新
    state.update({ urlInfo: newUrlInfo });
  }

  const onTargetChange = (idx: number, data: InputProps) => {
    state.update({
      urlInfo: state.urlInfo.map((info, index) => ({
        ...info,
        target: index === idx ? data.value : info.target,
      }) as UrlInfo),
    })
  }

  return (
    <div className="centeringHorizontal" ref={ scrollBottomRef }>
      <StackShim horizontalAlign="center" tokens={ { childrenGap: 48, padding: "48px 0px 48px 0px" } }>
        { /*タイトル*/ }
        <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 12 } }>
          <MdSailing style={ { width: 52, height: 52, color: "#38B48B" } }/>
          <LargeTitle>Phish Collector</LargeTitle>
        </StackShim>

        <ControlButtons
          onCopy={ async () => await navigator.clipboard.writeText(state.urlInfo.map(info => info.url).join(" ")) }
          onDelete={ () => state.reset() }
          onOpenAll={ () => state.urlInfo.forEach(info => window.open(info.url, "_blank")) }
        />

        <StackShim tokens={ { childrenGap: 12 } }>
          { /*URL入力フィールドのヘッダー*/ }
          <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 8 } }>
            <Body1Strong style={ { width: "35svw", textAlign: "center" } }> Phishing URL </Body1Strong>
            <Body1Strong style={ { width: "20svw", textAlign: "center" } }> Target Service </Body1Strong>
            <Toolbar>
              <Body1Strong style={ { width: "40px", textAlign: "center" } }> GSB </Body1Strong>
              <ToolbarDivider/>
              <Body1Strong style={ { width: "40px", textAlign: "center" } }> 警告 </Body1Strong>
              <ToolbarDivider/>
              <Body1Strong style={ { width: "120px", textAlign: "center" } }> Actions </Body1Strong>
            </Toolbar>
          </StackShim>

          { /*URL入力フィールド*/ }
          { state.urlInfo.map((info, index) =>
            <URLInputField
              key={ `urlInputField${ index }` }
              urlInfo={ info }
              index={ index }
              onUrlChange={ (_, data) => onURLChange(index, data) }
              onUrlPaste={ (ev) => {
                ev.preventDefault();
                onURLPaste(index, ev.clipboardData.getData("text"));
              } }
              onTargetChange={ (_, data) => onTargetChange(index, data) }
              onFillClick={ () => state.update({
                urlInfo: state.urlInfo.map((info) => ({ ...info, target: state.urlInfo[index].target }) as UrlInfo)
              }) }
              onDeleteClick={ () => state.update({ urlInfo: state.urlInfo.filter((_, idx) => idx !== index) }) }
            />
          ) }
        </StackShim>

        { /*URL追加ボタン*/ }
        <Button
          appearance={ "primary" }
          children={ "Add URL" }
          icon={ <MdAddLink/> }
          onClick={ async () => {
            state.update({ urlInfo: [...state.urlInfo, ...defaultHomeState.urlInfo] });
            await sleep(1);
            scrollBottomRef?.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          } }
          size={ "large" }
        />
      </StackShim>
    </div>
  )
}

const ControlButtons = (props: {
  onCopy: MouseEventHandler,
  onDelete: MouseEventHandler,
  onOpenAll: MouseEventHandler,
}) => {
  const state = useHomeState();

  return (
    <Toolbar>
      <ToolbarButton icon={ <MdCopyAll/> } onClick={ props.onCopy }>Copy URL</ToolbarButton>
      <ToolbarButton icon={ <MdDeleteForever/> } onClick={ props.onDelete }>Delete URL</ToolbarButton>

      <ToolbarDivider/>

      <GSBDialogButton
        isOpen={ state.gsbDialogOpen }
        onOpenChange={ (_, data) => state.update({ gsbDialogOpen: data.open }) }
        onCheck={ async () => {
          state.update({ gsbDialogOpen: false });
          state.update({ urlInfo: await checkGSB(state.urlInfo) });
        } }
      />

      <ToolbarDivider/>

      <ToolbarButton icon={ <MdOpenInNew/> } onClick={ props.onOpenAll }>Open All Urls</ToolbarButton>
    </Toolbar>
  );
}

const URLInputField = (props: {
  urlInfo: UrlInfo,
  index: number,
  onUrlChange: InputProps["onChange"],
  onUrlPaste: InputProps["onPaste"],
  onTargetChange: InputProps["onChange"],
  onFillClick: MouseEventHandler,
  onDeleteClick?: MouseEventHandler,
}) => {
  return (
    <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 8 } }>
      <Input
        value={ props.urlInfo.url }
        onChange={ props.onUrlChange }
        onPaste={ props.onUrlPaste }
        contentBefore={
          <StackShim horizontal verticalAlign={ "center" }>
            <FoodFish20Filled/>
            <Text>{ `${ props.index + 1 }`.padStart(2, "0") }</Text>
          </StackShim>
        }
        contentAfter={
          <Button
            appearance={ "outline" }
            icon={ <MdContentCopy size={ "18" }/> }
            size={ "small" } onClick={ () => navigator.clipboard.writeText(props.urlInfo.url) }
          />
        }
        placeholder={ "Phishing URL" }
        size={ "large" }
        style={ { width: "35svw" } }
        type={ "url" }
      />

      <Input
        value={ props.urlInfo.target }
        onChange={ props.onTargetChange }
        contentBefore={ <MdCrisisAlert/> }
        contentAfter={
          <Button
            appearance={ "outline" }
            icon={ <MdDoneAll size={ "18" }/> }
            size={ "small" } onClick={ props.onFillClick }
          />
        }
        placeholder={ "Target Service" }
        size={ "large" }
        style={ { width: "20svw" } }
        type={ "url" }
      />

      <Toolbar>
        <WarningStatus status={ props.urlInfo.warning.gsb }/>

        <ToolbarDivider/>

        <WarningStatus status={ props.urlInfo.warning.browser }/>

        <ToolbarDivider/>

        <Tooltip content={ "Search Results for Service and Domains" } relationship={ "label" } withArrow>
          <Button appearance={ "subtle" } icon={ <MdTravelExplore/> } size={ "large" } onClick={ () => {
            const domain = (new URL(props.urlInfo.url)).hostname;
            window.open(`https://www.google.com/search?q=${ props.urlInfo.target }`, "_blank");
            window.open(`https://www.google.com/search?q=site:${ domain }`, "_blank");
            window.open(`https://www.google.com/search?q=${ props.urlInfo.target } site:${ domain }`, "_blank");
          } }/>
        </Tooltip>

        <Tooltip content={ "Open in New Tab" } relationship={ "label" } withArrow>
          <Button appearance={ "subtle" } icon={ <MdOpenInNew/> } size={ "large" } onClick={ () => {
            window.open(props.urlInfo.url, "_blank");
          } }/>
        </Tooltip>

        <Tooltip content={ "Delete URL" } relationship={ "label" } withArrow>
          <Button appearance={ "subtle" } icon={ <MdDeleteForever/> } size={ "large" } onClick={ props.onDeleteClick }/>
        </Tooltip>
      </Toolbar>
    </StackShim>
  )
}

const GSBDialogButton = (props: {
  isOpen: boolean,
  onOpenChange: DialogOpenChangeEventHandler,
  onCheck: MouseEventHandler
}) => {
  return (
    <Dialog open={ props.isOpen } onOpenChange={ props.onOpenChange }>
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton icon={ <MdSecurity/> }> Check GSB Status </ToolbarButton>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>GSB登録有無の確認を実行しますか？</DialogTitle>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance={ "secondary" } icon={ <MdClose/> }>キャンセル</Button>
            </DialogTrigger>
            <Button appearance={ "primary" } icon={ <MdSecurity/> } onClick={ props.onCheck }>実行</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

const WarningStatus = (props: { status: Warning }) => {
  const items = {
    [Warning.Safe]: { icon: <MdVerified/>, style: { color: "#00B379" } },
    [Warning.Unknown]: { icon: <MdHelp/>, style: {} },
    [Warning.Phishing]: { icon: <FoodFishFilled/>, style: { color: "#FF0000" } },
  };

  return (
    <Button
      appearance={ "outline" }
      icon={ items[props.status].icon }
      size={ "large" }
      style={ items[props.status].style }
    />
  );
}

export default Home
