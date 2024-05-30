import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {BrandVariants, createDarkTheme, FluentProvider, Theme} from "@fluentui/react-components";
import {AppDrawer, Route} from "../components/Drawer.tsx";
import Analyze from "./Analyze.tsx";
import {SnackbarProvider} from "notistack";

const newTheme: BrandVariants = {
  10: "#000404", 20: "#061D1D", 30: "#003030", 40: "#003D3C",
  50: "#004B48", 60: "#005954", 70: "#00685F", 80: "#00776B",
  90: "#008676", 100: "#009681", 110: "#18A58B", 120: "#30B595",
  130: "#46C4A0", 140: "#5BD4AB", 150: "#72E3B6", 160: "#96EFC6"
};

const darkTheme: Theme = { ...createDarkTheme(newTheme) };

darkTheme.colorBrandForeground1 = newTheme[110];
darkTheme.colorBrandForeground2 = newTheme[120];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={ darkTheme }>
      <SnackbarProvider />
      <AppDrawer current={ Route.Analyze }>
        <Analyze/>
      </AppDrawer>
    </FluentProvider>
  </React.StrictMode>,
)
