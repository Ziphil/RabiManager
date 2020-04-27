//

import {
  Button
} from "@blueprintjs/core";
import * as react from "react";
import {
  ReactNode
} from "react";
import {
  Save
} from "../../util/save-parser";
import {
  Component
} from "../component";


export class SavePage extends Component<Props, State> {

  public render(): ReactNode {
    let node = (
      <div className="zp-root">
        <pre className="bp3-code-block">
          {JSON.stringify(this.props.save, null, 2)}
        </pre>
      </div>
    );
    return node;
  }

}


type Props = {
  save: Save
};
type State = {
};