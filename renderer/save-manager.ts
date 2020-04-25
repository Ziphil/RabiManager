//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";


const DEFAULT_STEAM_DIRECTORY = "C:/Program Files (x86)/Steam/steamapps/common/Rabi-Ribi/save";
const DEFAULT_BACKUP_DIRECTORY = joinPath(process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"] ?? "", ".zajka");


export class Save {

  public key: string;
  private manager: SaveManager;

  public constructor(key: string, manager: SaveManager) {
    this.key = key;
    this.manager = manager;
  }

  private async ensureBackupDirectories(): Promise<void> {
    await fs.mkdir(this.path("backup", "save"), {recursive: true});
    await fs.mkdir(this.path("backup", "image"), {recursive: true});
  }

  private async copy(targetPlace: "backup" | "steam", type: "save" | "image"): Promise<void> {
    let sourcePlace = Save.oppositePlace(targetPlace);
    let regexp = (type === "save") ? /save(\d+)\.sav$/ : /save(\d+)_a\.bmp$/;
    let sourceFiles = await fs.readdir(this.path(sourcePlace, type));
    let targetFiles = await fs.readdir(this.path(targetPlace, type));
    let filteredSourceFiles = sourceFiles.filter((file) => file.match(regexp));
    let filteredTargetFiles = targetFiles.filter((file) => file.match(regexp));
    let unlinkPromises = filteredTargetFiles.map((file) => {
      let promise = fs.unlink(this.path(targetPlace, type, file));
      return promise;
    });
    await Promise.all(unlinkPromises);
    let copyPromises = filteredSourceFiles.map((file) => {
      let promise = fs.copyFile(this.path(sourcePlace, type, file), this.path(targetPlace, type, file));
      return promise;
    });
    await Promise.all(copyPromises);
  }

  public async backup(): Promise<void> {
    await this.ensureBackupDirectories();
    await Promise.all([this.copy("backup", "save"), this.copy("backup", "image")]);
  }

  public async use(): Promise<void> {
    await Promise.all([this.copy("steam", "save"), this.copy("steam", "image")]);
  }

  private path(place: "backup" | "steam", type: "save" | "image", file?: string): string {
    let path = "";
    if (place === "backup") {
      if (type === "save") {
        path = Save.createPath([this.manager.backupDirectory, this.key], file);
      } else {
        path = Save.createPath([this.manager.backupDirectory, this.key, "image"], file);
      }
    } else {
      if (type === "save") {
        path = Save.createPath([this.manager.steamDirectory], file);
      } else {
        path = Save.createPath([this.manager.steamDirectory, "image"], file);
      }
    }
    return path;
  }

  private static createPath(paths: Array<string>, file?: string): string {
    let nextPaths = Array.from(paths);
    if (file) {
      nextPaths.push(file);
    }
    let path = joinPath(...nextPaths);
    return path;
  }

  private static oppositePlace(place: "backup" | "steam"): "backup" | "steam" {
    return (place === "backup") ? "steam" : "backup";
  }

}


export class SaveManager {

  public currentKey: string | null;
  public steamDirectory: string;
  public backupDirectory: string;
  public saves: Map<string, Save> = new Map();

  public constructor() {
    this.currentKey = null;
    this.steamDirectory = DEFAULT_STEAM_DIRECTORY;
    this.backupDirectory = DEFAULT_BACKUP_DIRECTORY;
  }

  public async load(): Promise<void> {
    await this.ensureBackupDirectory();
    await Promise.all([this.loadSaves(), this.loadSetting()]);
  }

  private async ensureBackupDirectory(): Promise<void> {
    await fs.mkdir(this.backupDirectory, {recursive: true});
  }

  private async loadSaves(): Promise<void> {
    let files = await fs.readdir(this.backupDirectory, {withFileTypes: true});
    let keys = files.filter((file) => file.isDirectory()).map((file) => file.name);
    for (let key of keys) {
      let save = new Save(key, this);
      this.saves.set(key, save);
    }
  }

  private async loadSetting(): Promise<void> {
    let settingPath = joinPath(this.backupDirectory, "setting.json");
    try {
      let buffer = await fs.readFile(settingPath);
      let setting = JSON.parse(buffer.toString());
      if (setting.currentKey !== undefined) {
        this.currentKey = setting.currentKey;
      }
      if (setting.steamDirectory !== undefined) {
        this.steamDirectory = setting.steamDirectory;
      }
      if (setting.backupDirectory !== undefined) {
        this.backupDirectory = setting.backupDirectory;
      }
    } catch (error) {
    }
  }

  private async saveSetting(): Promise<void> {
    let settingPath = joinPath(this.backupDirectory, "setting.json");
    let setting = {} as any;
    setting.currentKey = this.currentKey;
    setting.steamDirectory = this.steamDirectory;
    setting.backupDirectory = this.backupDirectory;
    await fs.writeFile(settingPath, JSON.stringify(setting));
  }

  public async backup(key: string): Promise<void> {
    let save = this.saves.get(key);
    if (save === undefined && key.match(/^[\w\d-]+$/)) {
      save = new Save(key, this);
      this.saves.set(key, save);
    }
    if (save) {
      this.currentKey = key;
      await save.backup();
      await this.saveSetting();
    }
  }

  public async use(key: string): Promise<void> {
    let save = this.saves.get(key);
    if (save) {
      this.currentKey = key;
      await save.use();
      await this.saveSetting();
    }
  }

  public async change(key: string): Promise<void> {
    if (this.currentKey) {
      await this.backup(this.currentKey);
    }
    await this.use(key);
  }

}