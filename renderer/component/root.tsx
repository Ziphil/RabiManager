//

import {
  ipcRenderer
} from "electron";
import * as queryParser from "query-string";
import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  DashboardPage
} from "./page/dashboard-page";
import {
  SavePage
} from "./page/save-page";
import "./root.scss";


export class Root extends Component<Props, State> {

  public state: State = {
    mode: "",
    id: "",
    props: null
  };

  public async componentDidMount(): Promise<void> {
    let query = queryParser.parse(window.location.search);
    let mode = query.mode;
    let id = query.id;
    if (typeof mode === "string" && typeof id === "string") {
      this.setState({mode, id});
    }
    ipcRenderer.on("get-props", (event, props) => {
      this.setState({props}, () => {
        ipcRenderer.send("ready-show", id);
      });
    });
    ipcRenderer.send("ready-get-props", id);
  }

  public render(): ReactNode {
    let pageNode = (() => {
      if (this.state.props !== null) {
        if (this.state.mode === "dashboard") {
          return <DashboardPage id={this.state.id} {...this.state.props}/>;
        } else if (this.state.mode === "save") {
          return <SavePage id={this.state.id} {...this.state.props}/>;
        }
      }
    })();
    let node = pageNode ?? <div/>;
    return node;
  }

}


type Props = {
};
type State = {
  mode: string,
  id: string,
  props: any | null
};