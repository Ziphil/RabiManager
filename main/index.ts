//

import {
  App,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  app as electronApp,
  ipcMain
} from "electron";
import {
  client
} from "electron-connect";


class Main {

  private app: App;
  private windows: Map<string, BrowserWindow>;
  private props: Map<string, object>;

  public constructor(app: App) {
    this.app = app;
    this.windows = new Map();
    this.props = new Map();
  }

  public main(): void {
    this.setupEventHandlers();
    this.setupIpc();
  }

  private setupEventHandlers(): void {
    this.app.on("ready", () => {
      this.createMainWindow();
    });
    this.app.on("activate", () => {
      if (this.windows.size <= 0) {
        this.createMainWindow();
      }
    });
    this.app.on("window-all-closed", () => {
      this.app.quit();
    });
  }

  private setupIpc(): void {
    ipcMain.on("create-window", (event, mode, parentId, props, options) => {
      this.createWindow(mode, parentId, props, options);
    });
    ipcMain.on("ready-get-props", (event, id) => {
      event.reply("get-props", this.props.get(id));
      this.props.delete(id);
    });
    ipcMain.on("resize", (event, id, width, height) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.setContentSize(width, height);
      }
    });
  }

  private createWindow(mode: string, parentId: string | null, props: object, options: BrowserWindowConstructorOptions): BrowserWindow {
    let commonOptions = {autoHideMenuBar: true, acceptFirstMouse: true, useContentSize: true, webPreferences: {nodeIntegration: true}};
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let window = new BrowserWindow({parent, ...options, ...commonOptions});
    let id = window.id.toString();
    window.loadFile("./index.html", {query: {id, mode}});
    window.once("closed", () => {
      this.windows.delete(id);
    });
    this.windows.set(id, window);
    this.props.set(id, props);
    this.connectReloadClient(window);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 450, height: 600, minWidth: 450, minHeight: 450};
    let window = this.createWindow("dashboard", null, {}, options);
    return window;
  }

  private connectReloadClient(window: BrowserWindow): void {
    try {
      client.create(window);
    } catch (error) {
      console.error("livereload client not found");
    }
  }

}


let main = new Main(electronApp);
main.main();