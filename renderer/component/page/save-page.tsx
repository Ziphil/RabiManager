//

import {
  Divider,
  ProgressBar,
  Tag
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  ATTACK_ITEM_KEYS,
  BADGE_DATA,
  BOSS_DATA,
  BadgeStatuses,
  BossStatuses,
  CONSUMMABLE_DATA,
  ConsummableCounts,
  ExtendedSave,
  ITEM_DATA,
  ItemStatuses,
  MAGIC_ITEM_KEYS,
  ORB_ITEM_KEYS,
  OTHER_ITEM_KEYS,
  RIBBON_SKILL_ITEM_KEYS,
  SKILL_ITEM_KEYS,
  STRENGTH_DATA,
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
    console.log(save);
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
              <div className="zp-name">マップ踏破率</div>
              <div className="zp-value">{save.mapPercent.toFixed(2)}%</div>
            </div>
            <div className="zp-value-wrapper">
              <div className="zp-name">アイテム取得率</div>
              <div className="zp-value">{save.itemPercent.toFixed(2)}%</div>
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

  private renderItemStatuses(): ReactNode {
    let save = this.state.save;
    let createItemNodes = function (keys: Readonly<Array<keyof ItemStatuses>>): ReactNode {
      let itemNodes = keys.map((key) => {
        let data = ITEM_DATA[key];
        let status = save.itemStatuses[key];
        let nameClassName = (status.level > 0 && !status.equipped) ? "zp-striked" : "";
        let equipNode;
        let levelNode;
        if (status.level > 0 && status.equipped) {
          equipNode = <Tag className="zp-small-tag zp-left-margin-tag" minimal={true} round={true}>E</Tag>;
        }
        if (data.maxLevel > 1 && status.level > 0) {
          levelNode = <Tag className="zp-small-tag zp-left-margin-tag" round={true}>Lv.{status.level}</Tag>;
        }
        let itemNode = (
          <div className="zp-item" key={key}>
            <span className={nameClassName}>{(status.level > 0) ? data.name : "—"}</span>
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
        let data = CONSUMMABLE_DATA[key];
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
        let data = STRENGTH_DATA[key];
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
            {createConsummableNodes(genericKeys(CONSUMMABLE_DATA))}
            <h5 className="bp3-heading zp-small-heading">強化アイテム</h5>
            {createStrengthNodes(genericKeys(STRENGTH_DATA))}
          </div>
        </div>
      </div>
    );
    return node;
  }

  private renderBadgeStatuses(): ReactNode {
    let save = this.state.save;
    let createBadgeNodes = function (keys: Readonly<Array<keyof BadgeStatuses>>): ReactNode {
      let badgeNodes = keys.map((key) => {
        let data = BADGE_DATA[key];
        let status = save.badgeStatuses[key];
        let nameClassName = (status.obtained && !status.equipped) ? "zp-striked" : "";
        let equipNode;
        if (status.equipped) {
          equipNode = <Tag className="zp-small-tag zp-left-margin-tag" minimal={true} round={true}>E</Tag>;
        }
        let badgeNode = (
          <div className="zp-item" key={key}>
            <span className={nameClassName}>{(status.obtained) ? data.name : "—"}</span>
            {equipNode}
          </div>
        );
        return badgeNode;
      });
      return badgeNodes;
    };
    let node = (
      <div>
        <h4 className="bp3-heading">バッジ</h4>
        <div className="zp-horizontal">
          <div className="zp-horizontal-row">
            {createBadgeNodes(genericKeys(BADGE_DATA).slice(0, 10))}
          </div>
          <div className="zp-horizontal-row">
            {createBadgeNodes(genericKeys(BADGE_DATA).slice(10, 21))}
          </div>
          <div className="zp-horizontal-row">
            {createBadgeNodes(genericKeys(BADGE_DATA).slice(21, 32))}
          </div>
        </div>
      </div>
    );
    return node;
  }

  private renderBossStatuses(): ReactNode {
    let save = this.state.save;
    let createBossNodes = function (keys: Readonly<Array<keyof BossStatuses>>): ReactNode {
      let bossNodes = keys.map((key) => {
        let data = BOSS_DATA[key];
        let status = save.bossStatuses[key];
        let rankRatio = (status.order !== null && status.rank !== null) ? (status.rank.number + 1) / 9 : 0;
        let bossNode = (
          <div className="zp-value-wrapper" key={key}>
            <div className="zp-name">{data.name}</div>
            <div className="zp-value">
              <ProgressBar value={rankRatio} stripes={false}/>
              <div className="zp-rank-wrapper">
                <div className="zp-rank">{(status.order !== null && status.rank !== null) ? status.rank.string : "—"}</div>
                <div className="zp-order">{(status.order !== null) ? "#" + (status.order + 1) : ""}</div>
              </div>
            </div>
          </div>
        );
        return bossNode;
      });
      return bossNodes;
    };
    let node = (
      <div>
        <h4 className="bp3-heading">タウンメンバー</h4>
        <div className="zp-horizontal">
          <div className="zp-horizontal-row">
            {createBossNodes(genericKeys(BOSS_DATA).slice(0, 8))}
          </div>
          <div className="zp-horizontal-row">
            {createBossNodes(genericKeys(BOSS_DATA).slice(8, 16))}
          </div>
          <div className="zp-horizontal-row">
            {createBossNodes(genericKeys(BOSS_DATA).slice(16, 24))}
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
        {this.renderItemStatuses()}
        <Divider className="zp-divider"/>
        {this.renderBadgeStatuses()}
        <Divider className="zp-divider"/>
        {this.renderBossStatuses()}
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