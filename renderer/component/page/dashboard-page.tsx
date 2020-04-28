//

import {
  Button,
  ButtonGroup,
  ControlGroup,
  Divider,
  FormGroup,
  InputGroup,
  Menu,
  MenuItem,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Toaster
} from "@blueprintjs/core";
import {
  IItemRendererProps,
  Select
} from "@blueprintjs/select";
import {
  shell
} from "electron";
import * as react from "react";
import {
  ReactElement,
  ReactNode
} from "react";
import {
  SaveGroup
} from "../../util/save-group";
import {
  SaveManager
} from "../../util/save-manager";
import {
  Component
} from "../component";


export class DashboardPage extends Component<Props, State> {

  public state: State = {
    manager: new SaveManager(),
    nextKey: null,
    ready: false
  };

  public async componentDidMount(): Promise<void> {
    await this.state.manager.load();
    let currentKey = this.state.manager.currentKey;
    this.setState({ready: true, nextKey: currentKey});
    this.fitWindow();
  }

  private async changeKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      await this.state.manager.change(key);
      this.setState({manager: this.state.manager});
    }
  }

  private async backupKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      await this.state.manager.backup(key);
      this.setState({manager: this.state.manager});
    }
  }

  private async useKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      await this.state.manager.use(key);
      this.setState({manager: this.state.manager});
    }
  }

  private async openSave(saveGroup: SaveGroup | undefined, number: number): Promise<void> {
    await saveGroup?.loadDetail(number);
    let save = saveGroup?.saves.get(number);
    if (save !== undefined && save !== true) {
      let props = {save};
      let options = {width: 500, height: 500, minWidth: 500, minHeight: 500};
      this.createWindow("save", props, options);
    }
  }

  private openSetting(): void {
    CustomToaster.show({message: "未実装です。", intent: "warning", icon: "warning-sign"});
  }

  private refreshManager(): void {
    this.state.manager.load();
    this.setState({manager: this.state.manager});
    CustomToaster.show({message: "セーブグループのデータを更新しました。", intent: "success", icon: "tick"});
  }

  private renderKeyItem(key: string, itemProps: IItemRendererProps): ReactElement {
    let node;
    let modifiers = itemProps.modifiers;
    if (modifiers.matchesPredicate) {
      node = <MenuItem text={key} key={key} active={modifiers.active} onClick={itemProps.handleClick}/>;
    }
    return node;
  }

  private renderNavbar(): ReactNode {
    let node = (
      <Navbar fixedToTop={true}>
        <NavbarGroup align="left">
          <NavbarHeading>
            <strong>Zajka</strong><br/>
            <small className="bp3-text-muted">Save Manager for “Rabi-Ribi”</small>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align="right">
          <Button text="設定" minimal={true} icon="cog" onClick={this.openSetting.bind(this)}/>
          <Button text="更新" minimal={true} icon="updated" onClick={this.refreshManager.bind(this)}/>
          <Popover>
            <Button text="開く" minimal={true} icon="folder-shared-open"/>
            <Menu>
              <MenuItem text="ゲームフォルダ" icon="folder-close" onClick={() => shell.openItem(this.state.manager.steamDirectory)}/>
              <MenuItem text="保存フォルダ" icon="folder-close" onClick={() => shell.openItem(this.state.manager.backupDirectory)}/>
            </Menu>
          </Popover>
        </NavbarGroup>
      </Navbar>
    );
    return node;
  }

  private renderChangeSaveGroup(): ReactNode {
    let keys = Array.from(this.state.manager.saveGroups.keys());
    let currentKey = this.state.manager.currentKey;
    let popoverProps = {position: "auto-start", minimal: true} as const;
    let node = (
      <div>
        <h5 className="bp3-heading zp-heading">セーブグループの変更</h5>
        <FormGroup label="現在のセーブグループ名">
          <InputGroup value={currentKey ?? ""} readOnly={true}/>
        </FormGroup>
        <FormGroup label="セーブグループ名">
          <StringSelect items={keys} activeItem={this.state.nextKey} itemRenderer={this.renderKeyItem} filterable={false} popoverProps={popoverProps} onItemSelect={(key) => this.setState({nextKey: key})}>
            <ControlGroup fill={true}>
              <InputGroup value={this.state.nextKey ?? ""} fill={true} onChange={(event) => this.setState({nextKey: event.target.value})}/>
              <Button icon="double-caret-vertical"/>
            </ControlGroup>
          </StringSelect>
        </FormGroup>
        <ButtonGroup className="zp-right-margin">
          <Button text="変更" intent="primary" icon="refresh" onClick={this.changeKey.bind(this)}/>
        </ButtonGroup>
        <ButtonGroup className="zp-right-margin">
          <Button text="コピー" icon="circle-arrow-right" onClick={this.backupKey.bind(this)}/>
          <Button text="反映" icon="circle-arrow-left" onClick={this.useKey.bind(this)}/>
        </ButtonGroup>
        <ButtonGroup>
          <Button text="削除" intent="danger" icon="delete"/>
        </ButtonGroup>
      </div>
    );
    return node;
  }

  private renderViewSaveGroup(): ReactNode {
    let saveGroup = this.state.manager.saveGroups.get(this.state.nextKey ?? "");
    let buttonNodes = Array.from({length: 3}, (_, row) => {
      let rowButtonNodes = Array.from({length: 10}, (_, column) => {
        let number = row * 10 + column + 1;
        let save = saveGroup?.saves.get(number);
        let rowButtonNode = <Button text={number} key={number} disabled={save === undefined} fill={true} onClick={() => this.openSave(saveGroup, number)}/>;
        return rowButtonNode;
      });
      let buttonNode = (
        <ButtonGroup key={row} fill={true}>
          {rowButtonNodes}
        </ButtonGroup>
      );
      return buttonNode;
    });
    let node = (
      <div>
        <h5 className="bp3-heading zp-heading">セーブグループの詳細</h5>
        <FormGroup className="zp-no-margin" label="セーブデータ情報">
          <div className="zp-vertical-group">
            {buttonNodes}
          </div>
        </FormGroup>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let node = (
      <div className="zp-root zp-navbar-root">
        {this.renderNavbar()}
        <div>
          {this.renderChangeSaveGroup()}
          <Divider className="zp-divider"/>
          {this.renderViewSaveGroup()}
        </div>
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
  manager: SaveManager,
  nextKey: string | null,
  ready: boolean
};

let StringSelect = Select.ofType<string>();
let CustomToaster = Toaster.create({className: "zp-toaster", position: "top", maxToasts: 3});