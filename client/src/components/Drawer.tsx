import {
  Button,
  Divider,
  DrawerBody,
  InlineDrawer,
  Tooltip
} from "@fluentui/react-components";
import {JSX} from "react";
import {MdAnalytics, MdHome, MdPhishing, MdSettings} from "react-icons/md";
import {StackShim} from "@fluentui/react-migration-v8-v9";

enum Route {
  Home = "home",
  Collected = "collected",
  Analyze = "analyze",
  Settings = "settings",
}

const AppDrawer = (props: { children?: JSX.Element, current: Route, }) => {
  const items: { route: Route, name: string, icon: JSX.Element }[] = [
    { route: Route.Home, name: "Home", icon: <MdHome/> },
    { route: Route.Collected, name: "Collected", icon: <MdPhishing/> },
    { route: Route.Analyze, name: "Analyze", icon: <MdAnalytics/> },
    { route: Route.Settings, name: "Settings", icon: <MdSettings/> },
  ];

  return (
    <div style={ { display: "flex", height: "100svh" } }>
      <InlineDrawer open style={ { minWidth: 64, maxWidth: 64, width: 64 } }>
        <DrawerBody style={ { textAlign: "center", padding: 0 } }>
          <StackShim className="centering" horizontalAlign="center" verticalAlign="center">
            { items.map((item) =>
              <Tooltip content={ item.name } relationship="label">
                <Button
                  appearance={ props.current === item.route ? "primary" : "transparent" }
                  icon={ item.icon }
                  size={ "large" }
                  style={ { width: 220, marginBottom: 24 } }
                  onClick={ () => window.location.href = `../${ item.route.toString() }/` }
                />
              </Tooltip>
            ) }
          </StackShim>
        </DrawerBody>
      </InlineDrawer>

      <Divider vertical style={ { minHeight: "100svh", height: "auto" } }/>

      { props.children }
    </div>
  );
}

export {
  Route,
  AppDrawer
}