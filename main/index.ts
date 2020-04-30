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


const COMMON_WINDOW_OPTIONS = {
  resizable: true,
  fullscreenable: false,
  autoHideMenuBar: true,
  acceptFirstMouse: true,
  useContentSize: true,
  webPreferences: {nodeIntegration: true, devTools: true}
};
const PRODUCTION_WINDOW_OPTIONS = {
  resizable: false,
  webPreferences: {nodeIntegration: true, devTools: false}
};


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
    ipcMain.on("ready-show", (event, id) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.show();
      }
    });
    ipcMain.on("resize", (event, id, width, height) => {
      let window = this.windows.get(id);
      if (window !== undefined) {
        window.setContentSize(width, height);
      }
    });
  }

  private createWindow(mode: string, parentId: string | null, props: object, options: BrowserWindowConstructorOptions): BrowserWindow {
    let show = false;
    let parent = (parentId !== null) ? this.windows.get(parentId) : undefined;
    let additionalOptions = (this.isDevelopment()) ? {} : PRODUCTION_WINDOW_OPTIONS;
    let window = new BrowserWindow({...COMMON_WINDOW_OPTIONS, ...additionalOptions, show, parent, ...options});
    let id = window.id.toString();
    window.loadFile("./index.html", {query: {id, mode}});
    window.once("closed", () => {
      this.windows.delete(id);
    });
    if (!this.isDevelopment()) {
      window.setMenu(null);
    }
    this.windows.set(id, window);
    this.props.set(id, props);
    return window;
  }

  private createMainWindow(): BrowserWindow {
    let options = {width: 420, height: 600, minWidth: 420, minHeight: 100};
    let window = this.createWindow("dashboard", null, {}, options);
    this.connectReloadClient(window);
    return window;
  }

  private connectReloadClient(window: BrowserWindow): void {
    if (this.isDevelopment()) {
      client.create(window, {}, () => {
        console.log("Reload client connected");
      });
    }
  }

  private isDevelopment(): boolean {
    return process.env["NODE_ENV"] === "development";
  }

}


let main = new Main(electronApp);
main.main();