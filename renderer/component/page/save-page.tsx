//

import {
  Button
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  ExtendedSave,
  Save,
  SaveExtension
} from "../../util/save-parser";
import {
  Component
} from "../component";


export class SavePage extends Component<Props, State> {

  public constructor(props: any) {
    super(props);
    let save = SaveExtension.extend(props.save);
    this.state = {save};
  }

  public render(): ReactNode {
    let save = this.state.save;
    let node = (
      <div className="zp-root">
        <h4 className="bp3-heading">基本情報</h4>
        <div className="zp-horizontal">
          <div className="zp-horizontal-row">
            <div className="zp-value-wrapper">
              <div className="zp-name">ゲームモード</div>
              <div className="zp-value">{save.gameMode} {save.speedrunMode}</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">難易度</div>
              <div className="zp-value">{save.difficulty}</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">ループ回数</div>
              <div className="zp-value">{save.loopCount}</div>
            </div>
          </div>
          <div className="zp-horizontal-row">
            <div className="zp-value-wrapper">
              <div className="zp-name">マップ取得率</div>
              <div className="zp-value">{save.mapPercent}%</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">アイテム取得率</div>
              <div className="zp-value">{save.itemPercent}%</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">チャプター</div>
              <div className="zp-value">{save.chapter}</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">タウンメンバー</div>
              <div className="zp-value">{save.townMemberCount}</div>
            </div>
          </div>
          <div className="zp-horizontal-row">
            <div className="zp-value-wrapper">
              <div className="zp-name">プレイ時間 (ゲーム内)</div>
              <div className="zp-value">{save.playTimeString} / {save.totalPlayTimeString}</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">プレイ時間</div>
              <div className="zp-value">{save.runTimeString} / {save.totalRunTimeString}</div>
            </div>
          </div>
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
  save: Save
};
type State = {
  save: ExtendedSave
};