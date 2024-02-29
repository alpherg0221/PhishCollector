import {Button, Divider, DrawerBody, DrawerHeader, DrawerHeaderTitle, InlineDrawer} from "@fluentui/react-components";
import {JSX} from "react";
import {StackShim} from "@fluentui/react-migration-v8-v9";
import {MdHome, MdPhishing, MdSettings} from "react-icons/md";

export enum Route {
  Home = "home",
  Collected = "collected",
  Settings = "settings",
}

export const AppDrawer = (props: { children?: JSX.Element, current: Route, }) => {
  const items: { route: Route, name: string, icon: JSX.Element }[] = [
    { route: Route.Home, name: "Home", icon: <MdHome/> },
    { route: Route.Collected, name: "Collected", icon: <MdPhishing/> },
    { route: Route.Settings, name: "Settings", icon: <MdSettings/> },
  ];

  return (
    <StackShim horizontal horizontalAlign={ "start" } verticalAlign={ "start" }>
      <InlineDrawer open style={ { minHeight: "100svh", height: "auto" } }>
        <DrawerHeader style={ { marginBottom: 24 } }>
          <DrawerHeaderTitle> Menu </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody style={ { textAlign: "center" } }>
          { items.map((item) =>
            <Button
              appearance={ props.current === item.route ? "primary" : "transparent" }
              icon={ item.icon }
              size={ "large" }
              style={ { width: "220px", marginBottom: 24 } }
              children={ item.name }
              onClick={ () => window.location.href = `../${item.route.toString()}/` }
            />
          ) }
        </DrawerBody>
      </InlineDrawer>

      <Divider vertical style={ { minHeight: "100svh", height: "auto" } }/>

      { props.children }
    </StackShim>
  );
}