//

import {
  Alert,
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
  Fragment,
  ReactElement,
  ReactNode
} from "react";
import {
  SaveManager
} from "../../util/save-manager";
import {
  Save
} from "../../util/save-parser";
import {
  Component
} from "../component";


export class DashboardPage extends Component<Props, State> {

  public state: State = {
    manager: new SaveManager(),
    nextKey: "",
    showBackupAlert: false,
    showUseAlert: false,
    ready: false
  };

  public async componentDidMount(): Promise<void> {
    await this.state.manager.load();
    let currentKey = this.state.manager.currentKey ?? "";
    this.setState({ready: true, nextKey: currentKey});
    this.fitWindow();
  }

  private async changeKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      try {
        await this.state.manager.change(key);
        CustomToaster.show({message: "セーブグループを変更しました。", intent: "success", icon: "tick"});
      } catch (error) {
        this.catchError(error);
      } finally {
        this.setState({manager: this.state.manager});
      }
    }
  }

  private async backupKey(alert: boolean = true): Promise<void> {
    let key = this.state.nextKey;
    let currentKey = this.state.manager.currentKey;
    if (alert) {
      if (currentKey === null || this.state.manager.saveGroups.get(key) === undefined) {
        this.backupKey(false);
      } else {
        this.setState({showBackupAlert: true});
      }
    } else {
      try {
        await this.state.manager.backup(key);
        CustomToaster.show({message: "セーブグループをコピーしました。", intent: "success", icon: "tick"});
      } catch (error) {
        this.catchError(error);
      } finally {
        this.setState({manager: this.state.manager, showBackupAlert: false});
      }
    }
  }

  private async useKey(alert: boolean = true): Promise<void> {
    let key = this.state.nextKey;
    if (alert) {
      this.setState({showUseAlert: true});
    } else {
      try {
        await this.state.manager.use(key);
        CustomToaster.show({message: "セーブグループを反映しました。", intent: "success", icon: "tick"});
      } catch (error) {
        this.catchError(error);
      } finally {
        this.setState({manager: this.state.manager, showUseAlert: false});
      }
    }
  }

  private async deleteKey(alert: boolean = true): Promise<void> {
    CustomToaster.show({message: "未実装です。", intent: "warning", icon: "warning-sign"});
  }

  private openSave(save: Save): void {
    let props = {save};
    let options = {width: 700, height: 700, minWidth: 700, minHeight: 700};
    this.createWindow("save", props, options);
  }

  private catchError(error: any): void {
    if (error.name === "SaveError") {
      let code = error.code;
      if (code === "invalidKey") {
        CustomToaster.show({message: "セーブグループ名が不正です。半角英数字とアンダーバーとハイフンのみで構成してください。", intent: "danger", icon: "error"});
      }
    } else {
      CustomToaster.show({message: "予期しないエラーが発生しました。", intent: "danger", icon: "error"});
    }
  }

  private openSetting(): void {
    CustomToaster.show({message: "未実装です。", intent: "warning", icon: "warning-sign"});
  }

  private async refreshManager(): Promise<void> {
    await this.state.manager.load();
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
          <Button text="設定" minimal={true} icon="cog" onClick={() => this.openSetting()}/>
          <Button text="更新" minimal={true} icon="updated" onClick={() => this.refreshManager()}/>
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
              <InputGroup value={this.state.nextKey} fill={true} onChange={(event) => this.setState({nextKey: event.target.value})}/>
              <Button icon="double-caret-vertical"/>
            </ControlGroup>
          </StringSelect>
        </FormGroup>
        <ButtonGroup className="zp-right-margin-button">
          <Button text="変更" intent="primary" icon="refresh" onClick={() => this.changeKey()}/>
        </ButtonGroup>
        <ButtonGroup className="zp-right-margin-button">
          <Button text="コピー" icon="circle-arrow-right" onClick={() => this.backupKey()}/>
          <Button text="反映" icon="circle-arrow-left" onClick={() => this.useKey()}/>
        </ButtonGroup>
        <ButtonGroup>
          <Button text="削除" intent="danger" icon="delete" onClick={() => this.deleteKey()}/>
        </ButtonGroup>
      </div>
    );
    return node;
  }

  private renderAlerts(): ReactNode {
    let commonProps = {confirmButtonText: "実行", cancelButtonText: "キャンセル", canOutsideClickCancel: true, intent: "danger", icon: "warning-sign"} as const;
    let node = (
      <Fragment>
        <Alert isOpen={this.state.showBackupAlert} onConfirm={() => this.backupKey(false)} onCancel={() => this.setState({showBackupAlert: false})} {...commonProps}>
          <p className="zp-justify">
            ゲームが参照しているセーブグループを保存用としてコピーします。
            これを実行すると、保存用のデータが上書きされ、現在のデータが失われる可能性があります。
          </p>
        </Alert>
        <Alert isOpen={this.state.showUseAlert} onConfirm={() => this.useKey(false)} onCancel={() => this.setState({showUseAlert: false})} {...commonProps}>
          <p className="zp-justify">
            保存用のセーブグループをゲームが参照する箇所にコピーします。
            これを実行すると、ゲームが参照しているデータが上書きされ、現在のデータが失われる可能性があります。
          </p>
        </Alert>
      </Fragment>
    );
    return node;
  }

  private renderViewSaveGroup(): ReactNode {
    let saveGroup = this.state.manager.saveGroups.get(this.state.nextKey ?? "");
    let buttonNodes = Array.from({length: 3}, (_, row) => {
      let rowButtonNodes = Array.from({length: 10}, (_, column) => {
        let number = row * 10 + column + 1;
        let save = saveGroup?.saves.get(number);
        let rowButtonNode = <Button text={number} key={number} disabled={!save} fill={true} onClick={() => this.openSave(save!)}/>;
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
        {this.renderAlerts()}
      </div>
    );
    return node;
  }

}


type Props = {
};
type State = {
  manager: SaveManager,
  nextKey: string,
  showBackupAlert: boolean,
  showUseAlert: boolean,
  ready: boolean
};

let StringSelect = Select.ofType<string>();
let CustomToaster = Toaster.create({className: "zp-toaster", position: "top", maxToasts: 2});