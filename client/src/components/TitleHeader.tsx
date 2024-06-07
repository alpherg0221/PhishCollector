import {StackShim} from "@fluentui/react-migration-v8-v9";
import {MdSailing} from "react-icons/md";
import {LargeTitle, Subtitle2} from "@fluentui/react-components";

export const TitleHeader = () => {
  return (
    <StackShim horizontal verticalAlign={ "center" } tokens={ { childrenGap: 12 } }>
      <MdSailing style={ { width: 52, height: 52, color: "#38B48B" } }/>
      <div>
        <LargeTitle>Phish Collector </LargeTitle>
        <Subtitle2>v1.5.0</Subtitle2>
      </div>
    </StackShim>
  )
}