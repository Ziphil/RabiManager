//

import * as react from "react";
import {
  Component,
  ReactNode
} from "react";
import {
  DashboardPage
} from "./page/dashboard-page";
import "./root.scss";


export class Root extends Component<{}, {}> {

  public render(): ReactNode {
    let node;
    let match = window.location.search.match(/\?mode=(\w+)/);
    if (match) {
      let mode = match[1];
      if (mode === "dashboard") {
        node = <DashboardPage/>;
      } else if (mode === "save") {
        node = <div>Foo</div>;
      }
    }
    return node;
  }

}