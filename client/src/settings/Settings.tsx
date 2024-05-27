import "./Settings.css"
import {StackShim} from "@fluentui/react-migration-v8-v9";
import {TitleHeader} from "../components/TitleHeader.tsx";

function Settings() {
  return (
    <div className="centeringHorizontal">
      <StackShim horizontalAlign="center" tokens={ { childrenGap: 48, padding: "48px 0px 48px 0px" } }>
        { /*タイトル*/ }
        <TitleHeader/>

        <div>今後追加予定</div>
      </StackShim>
    </div>
  );
}

export default Settings;