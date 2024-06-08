import './Home.css'
import {
  CollectStatus,
  defaultHomeState,
  SortBy,
  UrlInfo,
  useHomeState,
  Warning,
} from "./HomeState.tsx";
import {StackShim} from "@fluentui/react-migration-v8-v9";
import {
  Body1Strong,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Input,
  InputProps,
  Spinner,
  Subtitle2,
  Tag,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip
} from "@fluentui/react-components";
import {FoodFish20Filled, ServerMultipleFilled} from "@fluentui/react-icons";
import {InputOnChangeData} from "@fluentui/react-input";
import {formatURL} from "../utils/url.ts";
import {MouseEventHandler, useEffect, useRef, useState} from "react";
import {
  MdAddLink,
  MdClose,
  MdContentCopy,
  MdCopyAll,
  MdCrisisAlert,
  MdDeleteForever,
  MdDoneAll,
  MdOpenInNew,
  MdSecurity,
  MdTravelExplore,
} from "react-icons/md";
import {DialogOpenChangeEventHandler} from "@fluentui/react-dialog";
import {checkGSB} from "../utils/gsb.ts";
import {sleep} from "../utils/sleep.ts";
import {TitleHeader} from "../components/TitleHeader.tsx";
import {updateArray} from "../utils/extension.ts";
import {enqueueSnackbar} from "notistack";
import {defaultPath, getApiServer, ServerStatus, setApiServer} from "../utils/server.tsx";

function Home() {
  const state = useHomeState();

  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const getServerStatus = async () => {
    return await fetch(`${ state.apiServer }${ defaultPath }/status`, { signal: AbortSignal.timeout(5000) })
      .then(res => ServerStatus.fromCode(res.status))
      .catch(e => e.message === "signal timed out" ? ServerStatus.STOPPING : ServerStatus.ERROR);
  }

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
    // eslint-disable-next-line no-control-regex
    const urlInfo = data.split(RegExp(" |\r|\n|\r\n")).map(url => ({
      url: url,
      target: "",
      warning: { gsb: Warning.Unknown, browser: Warning.Unknown },
      status: CollectStatus.NotCollected,
    } as UrlInfo));

    // 新しい状態の作成
    const newUrlInfo = [...state.urlInfo.map((info, index) => index === idx ? urlInfo[0] : info), ...urlInfo.slice(1)] // 値の更新と追加
      .map(info => ({ ...info, url: formatURL(info.url) }) as UrlInfo)  // URLを整形
      .filter(info => info.url.includes("http") || RegExp("[A-Za-z]+.[A-Za-z]+").test(info.url))  // URL以外を除去
      .map(info => ({ ...info, url: !info.url.includes("http") ? `https://${ info.url }` : info.url }) as UrlInfo);  // httpsを追加

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

  const collectPhish = async (index: number, url: string, target: string, gsb: Warning) => {
    if (gsb === Warning.Unknown) return;

    state.update({
      urlInfo: updateArray(state.urlInfo, index, { ...state.urlInfo[index], status: CollectStatus.Collecting }),
    });

    await fetch(`${ state.apiServer }${ defaultPath }/crawler/collect?url=${ url }&target=${ target }&gsb=${ gsb === Warning.Phishing }`).then(async res => await res.text() === "OK"
      ? state.update({
        urlInfo: updateArray(state.urlInfo, index, { ...state.urlInfo[index], status: CollectStatus.Collected }),
      })
      : state.update({
        urlInfo: updateArray(state.urlInfo, index, { ...state.urlInfo[index], status: CollectStatus.Error }),
      })
    ).catch(() => state.update({
      urlInfo: updateArray(state.urlInfo, index, { ...state.urlInfo[index], status: CollectStatus.Error }),
    }));
  }

  useEffect(() => {
    state.update({ apiServer: getApiServer() });
  }, []);

  return (
    <div className="centeringHorizontal" ref={ scrollBottomRef }>
      <StackShim horizontalAlign="center" tokens={ { padding: "48px 12px 48px 12px" } }>
        { /*タイトル*/ }
        <TitleHeader/>

        {/*固定するヘッダ*/ }
        <StackShim className="header" tokens={ { padding: "48px 0px 12px 0px" } }>
          { /*コントロールボタン*/ }
          <StackShim horizontalAlign={ "center" }>
            <ControlButtons
              onCopy={ async () => {
                await navigator.clipboard.writeText(state.urlInfo.map(info => info.url).join(" "));
                enqueueSnackbar("Copied All URLs!", {
                  variant: "success",
                  anchorOrigin: { vertical: "bottom", horizontal: "center" },
                });
              } }
              onDelete={ () => state.reset() }
              onOpenAll={ () => state.urlInfo.forEach(info => window.open(info.url, "_blank")) }
              getServerStatus={ getServerStatus }
            />
          </StackShim>

          { /*URL入力フィールドのヘッダー*/ }
          <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 8, padding: "48px 0px 0px 0px" } }>
            <SortableTitle width={ "35svw" } sortBy={ SortBy.Url }> Phishing URL </SortableTitle>
            <SortableTitle width={ "20svw" } sortBy={ SortBy.Target }> Target Service </SortableTitle>
            <Toolbar>
              <SortableTitle width={ "40px" } sortBy={ SortBy.GSB }> GSB </SortableTitle>
              <ToolbarDivider/>
              <SortableTitle width={ "40px" } sortBy={ SortBy.Browser }> 警告 </SortableTitle>
              <ToolbarDivider/>
              <Body1Strong style={ { width: "40px", textAlign: "center" } }> 収集 </Body1Strong>
              <ToolbarDivider/>
              <Body1Strong style={ { width: "120px", textAlign: "center" } }> Actions </Body1Strong>
            </Toolbar>
          </StackShim>
        </StackShim>

        { /*URL入力フィールド*/ }
        <StackShim tokens={ { childrenGap: 12 } }>
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
              onBrowserChangeClick={ () => state.update({
                urlInfo: updateArray(
                  state.urlInfo,
                  index,
                  { ...info, warning: { ...info.warning, browser: info.warning.browser.next } }
                )
              }) }
              onCollectClick={ async () => await collectPhish(index, info.url, info.target, info.warning.browser) }
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
          style={ { marginTop: "48px" } }
        />
      </StackShim>
    </div>
  )
}

const ControlButtons = (props: {
  onCopy: MouseEventHandler,
  onDelete: MouseEventHandler,
  onOpenAll: MouseEventHandler,
  getServerStatus: () => Promise<ServerStatus>,
}) => {
  const state = useHomeState();

  return (
    <Toolbar>
      <ServerStatusButton
        isOpen={ state.serverDialogOpen }
        onOpenChange={ async (_, data) => {
          state.update({ serverDialogOpen: data.open });
          state.update({ serverStatus: data.open ? await props.getServerStatus() : ServerStatus.LOADING });
        } }
      />

      <ToolbarDivider/>

      <ToolbarButton icon={ <MdCopyAll/> } onClick={ props.onCopy }>Copy URLs</ToolbarButton>
      <ToolbarButton icon={ <MdDeleteForever/> } onClick={ props.onDelete }>Delete URLs</ToolbarButton>

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

      <ToolbarButton icon={ <MdOpenInNew/> } onClick={ props.onOpenAll }>Open All URLs</ToolbarButton>
    </Toolbar>
  );
}

const SortableTitle = (props: { width: string, children: string, sortBy?: SortBy }) => {
  const state = useHomeState();

  return (
    <Body1Strong style={ { width: props.width, textAlign: "center", cursor: "pointer" } } onClick={ () => {
      switch (props.sortBy) {
        case SortBy.Url:
          state.update({ urlInfo: state.urlInfo.toSorted((a, b) => a.url.localeCompare(b.url)) });
          break;
        case SortBy.Target:
          state.update({ urlInfo: state.urlInfo.toSorted((a, b) => a.target.localeCompare(b.target)) });
          break;
        case SortBy.GSB:
          state.update({ urlInfo: state.urlInfo.toSorted((a, b) => a.warning.gsb.order - b.warning.gsb.order) });
          break;
        case SortBy.Browser:
          state.update({ urlInfo: state.urlInfo.toSorted((a, b) => a.warning.browser.order - b.warning.browser.order) });
          break;
      }
    } }>
      { props.children }
    </Body1Strong>
  )
}

const URLInputField = (props: {
  urlInfo: UrlInfo,
  index: number,
  onUrlChange: InputProps["onChange"],
  onUrlPaste: InputProps["onPaste"],
  onTargetChange: InputProps["onChange"],
  onFillClick: MouseEventHandler,
  onBrowserChangeClick: MouseEventHandler,
  onCollectClick: MouseEventHandler,
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
            size={ "small" }
            onClick={ async () => {
              await navigator.clipboard.writeText(props.urlInfo.url);
              enqueueSnackbar("Copied URL!", {
                variant: "success",
                anchorOrigin: { vertical: "bottom", horizontal: "center" },
              });
            } }
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

        <WarningStatus status={ props.urlInfo.warning.browser } onChange={ props.onBrowserChangeClick }/>

        <ToolbarDivider/>

        <Tooltip content={ props.urlInfo.status.tooltip } relationship={ "label" } withArrow>
          <Button
            appearance={ props.urlInfo.status === CollectStatus.NotCollected ? "primary" : "outline" }
            icon={ props.urlInfo.status === CollectStatus.Collecting
              ? <Spinner size="tiny" style={ { width: 20 } }/>
              : props.urlInfo.status.icon
            }
            size={ "large" }
            onClick={ props.urlInfo.status === CollectStatus.NotCollected ? props.onCollectClick : undefined }
          />
        </Tooltip>

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

const ServerStatusButton = (props: {
  isOpen: boolean,
  onOpenChange: DialogOpenChangeEventHandler,
}) => {
  const state = useHomeState();

  const [serverTmp, setServerTmp] = useState(state.apiServer);

  return (
    <Dialog open={ props.isOpen } onOpenChange={ props.onOpenChange }>
      <DialogTrigger disableButtonEnhancement>
        <ToolbarButton icon={ <ServerMultipleFilled/> }> Server Status </ToolbarButton>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Server Status</DialogTitle>
          <DialogContent>
            <StackShim tokens={ { childrenGap: 24, padding: "24px 24px 24px 24px" } }>
              <StackShim tokens={ { childrenGap: 12 } }>
                <Subtitle2 style={ { width: 48 } }>Server</Subtitle2>
                <Input
                  value={ serverTmp }
                  onChange={ (_, v) => setServerTmp(v.value) }
                  contentAfter={ <Button icon={ <MdDoneAll/> } size={ "small" } onClick={ () => {
                    setApiServer(serverTmp);
                    state.update({ apiServer: serverTmp });
                  } }/> }
                />
              </StackShim>
              <StackShim tokens={ { childrenGap: 12 } }>
                <Subtitle2 style={ { width: 48 } }>Status</Subtitle2>
                { state.serverStatus !== ServerStatus.LOADING
                  ? <Tag appearance="outline" icon={ state.serverStatus.icon }> { state.serverStatus.value } </Tag>
                  : <Spinner size="tiny" style={ { width: 20 } }/>
                }
              </StackShim>
            </StackShim>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
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

const WarningStatus = (props: { status: Warning, onChange?: MouseEventHandler }) => {
  return (
    <Button
      appearance={ "outline" }
      icon={ props.status.icon }
      size={ "large" }
      style={ { color: props.status.color } }
      onClick={ props.onChange }
    />
  );
}

export default Home
