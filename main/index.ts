//

import {
  App,
  BrowserWindow,
  app as electronApp
} from "electron";


class Main {

  private app: App;
  private window: BrowserWindow | null = null;

  public constructor(app: App) {
    this.app = app;
  }

  public main(): void {
    this.app.on("ready", this.onReady.bind(this));
    this.app.on("activate", this.onActivated.bind(this));
    this.app.on("window-all-closed", this.onWindowAllClosed.bind(this));
  }

  private createWindow(): void {
    this.window = new BrowserWindow({width: 700, height: 400, autoHideMenuBar: true, acceptFirstMouse: true, webPreferences: {nodeIntegration: true}});
    this.window.loadFile("./index.html");
    this.window.on("closed", () => {
      this.window = null;
    });
  }

  private onReady(): void {
    this.createWindow();
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