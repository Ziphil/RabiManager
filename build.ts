//

import * as builder from "electron-builder";


builder.build({
  config: {
    appId: "com.ziphil.rabi",
    win: {
      target: "zip"
    }
  }
});