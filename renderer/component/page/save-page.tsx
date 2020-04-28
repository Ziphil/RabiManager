//

import {
  Divider,
  Tag
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  ATTACK_ITEM_KEYS,
  CONSUMMABLE_COUNTS_DATA,
  ConsummableCounts,
  ExtendedSave,
  ITEM_STATUSES_DATA,
  ItemStatuses,
  MAGIC_ITEM_KEYS,
  ORB_ITEM_KEYS,
  OTHER_ITEM_KEYS,
  RIBBON_SKILL_ITEM_KEYS,
  SKILL_ITEM_KEYS,
  STRENGTH_COUNTS_DATA,
  Save,
  SaveExtension,
  StrengthCounts
} from "../../util/save-parser";
import {
  genericKeys
} from "../../util/type";
import {
  Component
} from "../component";


export class SavePage extends Component<Props, State> {

  public constructor(props: any) {
    super(props);
    let save = SaveExtension.extend(props.save);
    this.state = {save};
  }

  private renderBasicInformation(): ReactNode {
    let save = this.state.save;
    let node = (
      <div>
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
          </div>
          <div className="zp-horizontal-row">
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

  private renderItems(): ReactNode {
    let save = this.state.save;
    let createItemNodes = function (keys: Readonly<Array<keyof ItemStatuses>>): ReactNode {
      let itemNodes = keys.map((key) => {
        let data = ITEM_STATUSES_DATA[key];
        let status = save.itemStatuses[key];
        let equipNode;
        let levelNode;
        if (status.level > 0 && status.equipped) {
          equipNode = <Tag className="zp-small-tag zp-left-margin-tag" minimal={true} round={true}>E</Tag>;
        }
        if (data.maxLevel > 1 && status.level > 0 && status.equipped) {
          levelNode = <Tag className="zp-small-tag zp-left-margin-tag" round={true}>Lv.{status.level}</Tag>;
        }
        let itemNode = (
          <div className="zp-item" key={key}>
            {(status.level > 0) ? data.name : "—"}
            {levelNode}
            {equipNode}
          </div>
        );
        return itemNode;
      });
      return itemNodes;
    };
    let createConsummableNodes = function (keys: Readonly<Array<keyof ConsummableCounts>>): ReactNode {
      let consummableNodes = keys.map((key) => {
        let data = CONSUMMABLE_COUNTS_DATA[key];
        let count = save.consummableCounts[key];
        let countNode;
        if (count > 0) {
          countNode = <Tag className="zp-small-tag zp-left-margin-tag" round={true}>×{count}</Tag>;
        }
        let consummableNode = (
          <div className="zp-item" key={key}>
            {(count > 0) ? data.name : "—"}
            {countNode}
          </div>
        );
        return consummableNode;
      });
      return consummableNodes;
    };
    let createStrengthNodes = function (keys: Readonly<Array<keyof StrengthCounts>>): ReactNode {
      let strengthNodes = keys.map((key) => {
        let data = STRENGTH_COUNTS_DATA[key];
        let count = save.strengthCounts[key];
        let countNode;
        if (count > 0) {
          countNode = <Tag className="zp-small-tag zp-left-margin-tag" round={true}>×{count}</Tag>;
        }
        let strengthNode = (
          <div className="zp-item" key={key}>
            {(count > 0) ? data.name : "—"}
            {countNode}
          </div>
        );
        return strengthNode;
      });
      return strengthNodes;
    };
    let node = (
      <div>
        <h4 className="bp3-heading">アイテム</h4>
        <div className="zp-horizontal">
          <div className="zp-horizontal-row">
            <h5 className="bp3-heading zp-small-heading">攻撃アイテム</h5>
            {createItemNodes(ATTACK_ITEM_KEYS)}
            <h5 className="bp3-heading zp-small-heading">エリナ用スキル</h5>
            {createItemNodes(SKILL_ITEM_KEYS)}
            <h5 className="bp3-heading zp-small-heading">その他</h5>
            {createItemNodes(OTHER_ITEM_KEYS)}
          </div>
          <div className="zp-horizontal-row">
            <h5 className="bp3-heading zp-small-heading">魔法アイテム</h5>
            {createItemNodes(MAGIC_ITEM_KEYS)}
            <h5 className="bp3-heading zp-small-heading">リボン用スキル</h5>
            {createItemNodes(RIBBON_SKILL_ITEM_KEYS)}
            <h5 className="bp3-heading zp-small-heading">オーブ</h5>
            {createItemNodes(ORB_ITEM_KEYS)}
          </div>
          <div className="zp-horizontal-row">
            <h5 className="bp3-heading zp-small-heading">消費アイテム</h5>
            {createConsummableNodes(genericKeys(CONSUMMABLE_COUNTS_DATA))}
            <h5 className="bp3-heading zp-small-heading">強化アイテム</h5>
            {createStrengthNodes(genericKeys(STRENGTH_COUNTS_DATA))}
          </div>
        </div>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-root">
        {this.renderBasicInformation()}
        <Divider className="zp-divider"/>
        {this.renderItems()}
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