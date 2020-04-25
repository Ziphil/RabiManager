//

import {
  Button,
  ButtonGroup,
  ControlGroup,
  FormGroup,
  InputGroup,
  Menu,
  MenuItem,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Popover
} from "@blueprintjs/core";
import {
  IItemRendererProps,
  Select
} from "@blueprintjs/select";
import {
  ipcRenderer
} from "electron";
import * as react from "react";
import {
  Component,
  ReactElement,
  ReactNode
} from "react";
import {
  SaveManager
} from "./save-manager";
import "./style.scss";


export class Root extends Component<Props, State> {

  public state: State = {
    manager: new SaveManager(),
    nextKey: null,
    ready: false,
    processing: false
  };

  public async componentDidMount(): Promise<void> {
    await this.state.manager.load();
    let currentKey = this.state.manager.currentKey;
    this.setState({ready: true, nextKey: currentKey});
    ipcRenderer.send("resize", document.body.clientWidth, document.body.clientHeight);
  }

  private async changeKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.change(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private async backupKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.backup(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private async useKey(): Promise<void> {
    let key = this.state.nextKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.use(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private renderKeyItem(key: string, itemProps: IItemRendererProps): ReactElement {
    let node;
    let modifiers = itemProps.modifiers;
    if (modifiers.matchesPredicate) {
      node = <MenuItem text={key} active={modifiers.active} onClick={itemProps.handleClick}/>;
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
          <NavbarDivider/>
          <Button text="設定" minimal={true} icon="cog"/>
          <Popover>
            <Button text="開く" minimal={true} icon="folder-shared-open"/>
            <Menu>
              <MenuItem text="ゲームフォルダ" icon="folder-close"/>
              <MenuItem text="保存フォルダ" icon="folder-close"/>
            </Menu>
          </Popover>
        </NavbarGroup>
        <NavbarGroup align="right">
          <small className="bp3-text-muted">© 2020 Ziphil</small>
        </NavbarGroup>
      </Navbar>
    );
    return node;
  }

  private renderChangeSave(): ReactNode {
    let keys = Array.from(this.state.manager.saves.keys());
    let currentKey = this.state.manager.currentKey;
    let node = (
      <div>
        <h5 className="bp3-heading zp-heading">セーブグループの変更</h5>
        <FormGroup label="現在のセーブグループ名">
          <InputGroup value={currentKey ?? ""} readOnly={true}/>
        </FormGroup>
        <FormGroup label="セーブグループ名">
          <StringSelect items={keys} activeItem={this.state.nextKey} itemRenderer={this.renderKeyItem} filterable={false} popoverProps={{position: "auto"}} onItemSelect={(key) => this.setState({nextKey: key})}>
            <ControlGroup fill={true}>
              <InputGroup value={this.state.nextKey ?? ""} fill={true} onChange={(event) => this.setState({nextKey: event.target.value})}/>
              <Button icon="double-caret-vertical"/>
            </ControlGroup>
          </StringSelect>
        </FormGroup>
        <ButtonGroup className="zp-right-margin">
          <Button text="変更" intent="primary" icon="refresh" onClick={this.changeKey.bind(this)}/>
          <Button text="コピー" intent="primary" icon="circle-arrow-right" onClick={this.backupKey.bind(this)}/>
        </ButtonGroup>
        <ButtonGroup className="zp-right-margin">
          <Button text="反映" intent="warning" icon="circle-arrow-left" onClick={this.useKey.bind(this)}/>
        </ButtonGroup>
        <ButtonGroup>
          <Button text="削除" intent="danger" icon="delete"/>
        </ButtonGroup>
      </div>
    );
    return node;
  }

  public render(): ReactNode {
    let node = (
      <div className="root">
        {this.renderNavbar()}
        {this.renderChangeSave()}
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
  ready: boolean,
  processing: boolean
};

let StringSelect = Select.ofType<string>();