//

import * as merge from "webpack-merge";
import common from "./webpack-common";


let main = merge(common[0], {
  mode: "production"
});

let renderer = merge(common[1], {
  mode: "production"
});

export default [main, renderer];