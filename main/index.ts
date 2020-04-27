//

import {
  App,
  BrowserWindow,
  app as electronApp,
  ipcMain
} from "electron";
import {
  client
} from "electron-connect";


class Main {

  private app: App;
  private window: BrowserWindow | null = null;

  public constructor(app: App) {
    this.app = app;
    this.setupIpc();
  }

  public main(): void {
    this.app.on("ready", this.onReady.bind(this));
    this.app.on("activate", this.onActivated.bind(this));
    this.app.on("window-all-closed", this.onWindowAllClosed.bind(this));
  }

  private setupIpc(): void {
    ipcMain.on("resize", (event, width, height) => {
      if (this.window !== null) {
        this.window.setContentSize(width, height);
      }
    });
  }

  private createWindow(): void {
    let options = {autoHideMenuBar: true, acceptFirstMouse: true, useContentSize: true, webPreferences: {nodeIntegration: true}};
    this.window = new BrowserWindow({width: 450, height: 600, minWidth: 450, minHeight: 400, ...options});
    this.window.loadFile("./index.html", {query: {mode: "dashboard"}});
    this.window.on("closed", () => {
      this.window = null;
    });
  }

  private onReady(): void {
    this.createWindow();
    client.create(this.window);
  }

  private onActivated(): void {
    if (this.window === null) {
      this.createWindow();
    }
  }

  private onWindowAllClosed(): void {
    this.app.quit();
  }

}


let main = new Main(electronApp);
main.main();