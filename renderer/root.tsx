//

import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  InputGroup,
  MenuItem
} from "@blueprintjs/core";
import {
  IItemRendererProps,
  Select
} from "@blueprintjs/select";
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
    changedKey: null,
    createdKey: "",
    ready: false,
    processing: false
  };

  public async componentDidMount(): Promise<void> {
    await this.state.manager.load();
    this.setState({ready: true});
  }

  private async changeKey(): Promise<void> {
    let key = this.state.changedKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.change(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private async backupKey(): Promise<void> {
    let key = this.state.changedKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.backup(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private async useKey(): Promise<void> {
    let key = this.state.changedKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.use(key);
      this.setState({processing: false, manager: this.state.manager});
    }
  }

  private async createKey(): Promise<void> {
    let key = this.state.createdKey;
    if (key !== null) {
      this.setState({processing: true});
      await this.state.manager.backup(key);
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

  public render(): ReactNode {
    let keys = Array.from(this.state.manager.saves.keys());
    let currentKey = this.state.manager.currentKey ?? "";
    let node = (
      <div className="root">
        <div className="zp-title">
          <h2 className="bp3-heading">Zajka</h2>
          <span className="bp3-text-muted">Save Manager for “Rabi-Ribi”</span>
        </div>
        <div className="zp-card-wrapper">
          <Card className="zp-card">
            <h5 className="bp3-heading">使用するセーブグループの変更</h5>
            <FormGroup label="現在のセーブグループ名">
              <InputGroup value={currentKey} readOnly={true}/>
            </FormGroup>
            <FormGroup label="セーブグループ名">
              <StringSelect items={keys} activeItem={this.state.changedKey} itemRenderer={this.renderKeyItem} filterable={false} onItemSelect={(key) => this.setState({changedKey: key})}>
                <Button text={this.state.changedKey ?? " "} rightIcon="caret-down" alignText="left" fill={true}/>
              </StringSelect>
            </FormGroup>
            <ButtonGroup className="zp-right-margin">
              <Button text="変更" intent="primary" onClick={this.changeKey.bind(this)}/>
            </ButtonGroup>
            <ButtonGroup className="zp-right-margin">
              <Button text="削除" intent="danger"/>
            </ButtonGroup>
            <ButtonGroup>
              <Button text="コピーのみ" onClick={this.backupKey.bind(this)}/>
              <Button text="利用のみ" onClick={this.useKey.bind(this)}/>
            </ButtonGroup>
          </Card>
          <Card className="zp-card">
            <h5 className="bp3-heading">新規セーブグループの作成</h5>
            <FormGroup label="セーブグループ名">
              <InputGroup value={this.state.createdKey} onChange={(event) => this.setState({createdKey: event.target.value})}/>
            </FormGroup>
            <ButtonGroup>
              <Button text="作成" intent="primary" onClick={this.createKey.bind(this)}/>
            </ButtonGroup>
          </Card>
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
  changedKey: string | null,
  createdKey: string,
  ready: boolean,
  processing: boolean
};

let StringSelect = Select.ofType<string>();