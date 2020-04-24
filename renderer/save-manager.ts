//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";


const STEAM_DIRECTORY = "C:/Program Files (x86)/Steam/steamapps/common/Rabi-Ribi/save";
const BACKUP_DIRECTORY = joinPath(process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"] ?? "", ".zajka");


export class Save {

  public key: string;

  public constructor(key: string) {
    this.key = key;
  }

  private async ensureBackupDirectories(): Promise<void> {
    await fs.mkdir(this.path("backup", "save"), {recursive: true});
    await fs.mkdir(this.path("backup", "image"), {recursive: true});
  }

  private async copy(targetPlace: "backup" | "source", type: "save" | "image"): Promise<void> {
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
    await Promise.all([this.copy("source", "save"), this.copy("source", "image")]);
  }

  private path(place: "backup" | "source", type: "save" | "image", file?: string): string {
    let path = "";
    if (place === "backup") {
      if (type === "save") {
        path = Save.createPath([BACKUP_DIRECTORY, this.key], file);
      } else {
        path = Save.createPath([BACKUP_DIRECTORY, this.key, "image"], file);
      }
    } else {
      if (type === "save") {
        path = Save.createPath([STEAM_DIRECTORY], file);
      } else {
        path = Save.createPath([STEAM_DIRECTORY, "image"], file);
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

  private static oppositePlace(place: "backup" | "source"): "backup" | "source" {
    return (place === "backup") ? "source" : "backup";
  }

}


export class SaveManager {

  public currentKey: string | null = null;
  public saves: Map<string, Save> = new Map();

  public async load(): Promise<void> {
    await this.ensureBackupDirectory();
    await Promise.all([this.loadSaves(), this.loadSetting()]);
  }

  private async ensureBackupDirectory(): Promise<void> {
    await fs.mkdir(BACKUP_DIRECTORY, {recursive: true});
  }

  private async loadSaves(): Promise<void> {
    let files = await fs.readdir(BACKUP_DIRECTORY, {withFileTypes: true});
    let keys = files.filter((file) => file.isDirectory()).map((file) => file.name);
    for (let key of keys) {
      let save = new Save(key);
      this.saves.set(key, save);
    }
  }

  private async loadSetting(): Promise<void> {
    let settingPath = joinPath(BACKUP_DIRECTORY, "setting.json");
    try {
      let buffer = await fs.readFile(settingPath);
      let setting = JSON.parse(buffer.toString());
      this.currentKey = setting.currentKey;
    } catch (error) {
      this.currentKey = null;
    }
  }

  private async saveSetting(): Promise<void> {
    let settingPath = joinPath(BACKUP_DIRECTORY, "setting.json");
    let setting = {} as any;
    setting.currentKey = this.currentKey;
    await fs.writeFile(settingPath, JSON.stringify(setting));
  }

  public async backup(key: string): Promise<void> {
    let save = this.saves.get(key);
    if (save === undefined && key.match(/^[\w\d-]+$/)) {
      save = new Save(key);
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