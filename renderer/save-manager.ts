//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";


const DEFAULT_STEAM_DIRECTORY = "C:/Program Files (x86)/Steam/steamapps/common/Rabi-Ribi/save";
const DEFAULT_BACKUP_DIRECTORY = joinPath(process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"] ?? "", ".zajka");


export class SaveGroup {

  public key: string;
  public location: SaveLocation;
  private manager: SaveManager;
  public saves: Map<number, boolean>;

  public constructor(key: string, location: SaveLocation, manager: SaveManager) {
    this.key = key;
    this.location = location;
    this.manager = manager;
    this.saves = new Map();
  }

  public async load(): Promise<void> {
    let files = await fs.readdir(this.location.get("backup", "save"), {withFileTypes: true});
    for (let number = 0 ; number <= 30 ; number ++) {
      let exists = files.find((file) => file.name === `save${number}.sav`) !== undefined;
      this.saves.set(number, exists);
    }
  }

  private async ensureBackupDirectories(): Promise<void> {
    await fs.mkdir(this.location.get("backup", "save"), {recursive: true});
    await fs.mkdir(this.location.get("backup", "image"), {recursive: true});
  }

  private async copy(targetPlace: "backup" | "steam", type: "save" | "image"): Promise<void> {
    let sourcePlace = SaveLocation.oppositePlace(targetPlace);
    let regexp = (type === "save") ? /save(\d+)\.sav$/ : /save(\d+)_a\.bmp$/;
    let sourceFiles = await fs.readdir(this.location.get(sourcePlace, type));
    let targetFiles = await fs.readdir(this.location.get(targetPlace, type));
    let filteredSourceFiles = sourceFiles.filter((file) => file.match(regexp));
    let filteredTargetFiles = targetFiles.filter((file) => file.match(regexp));
    let unlinkPromises = filteredTargetFiles.map((file) => {
      let promise = fs.unlink(this.location.get(targetPlace, type, file));
      return promise;
    });
    await Promise.all(unlinkPromises);
    let copyPromises = filteredSourceFiles.map((file) => {
      let promise = fs.copyFile(this.location.get(sourcePlace, type, file), this.location.get(targetPlace, type, file));
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

}


export class SaveManager {

  public currentKey: string | null;
  public steamDirectory: string;
  public backupDirectory: string;
  public saveGroups: Map<string, SaveGroup>;

  public constructor() {
    this.currentKey = null;
    this.steamDirectory = DEFAULT_STEAM_DIRECTORY;
    this.backupDirectory = DEFAULT_BACKUP_DIRECTORY;
    this.saveGroups = new Map();
  }

  public async load(): Promise<void> {
    await this.ensureBackupDirectory();
    await Promise.all([this.loadSaveGroups(), this.loadSetting()]);
  }

  private async ensureBackupDirectory(): Promise<void> {
    await fs.mkdir(this.backupDirectory, {recursive: true});
  }

  private async loadSaveGroups(): Promise<void> {
    let files = await fs.readdir(this.backupDirectory, {withFileTypes: true});
    let keys = files.filter((file) => file.isDirectory()).map((file) => file.name);
    for (let key of keys) {
      let location = this.createLocation(key);
      let saveGroup = new SaveGroup(key, location, this);
      await saveGroup.load();
      this.saveGroups.set(key, saveGroup);
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
    let saveGroup = this.saveGroups.get(key);
    if (saveGroup === undefined && key.match(/^[\w\d-]+$/)) {
      let location = this.createLocation(key);
      saveGroup = new SaveGroup(key, location, this);
      this.saveGroups.set(key, saveGroup);
    }
    if (saveGroup) {
      this.currentKey = key;
      await saveGroup.backup();
      await saveGroup.load();
      await this.saveSetting();
    }
  }

  public async use(key: string): Promise<void> {
    let saveGroup = this.saveGroups.get(key);
    if (saveGroup) {
      this.currentKey = key;
      await saveGroup.use();
      await this.saveSetting();
    }
  }

  public async change(key: string): Promise<void> {
    if (this.currentKey) {
      await this.backup(this.currentKey);
    }
    await this.use(key);
  }

  private createLocation(key: string): SaveLocation {
    let backupSaveDirectory = joinPath(this.backupDirectory, key);
    let backupImageDirectory = joinPath(this.backupDirectory, key, "image");
    let steamSaveDirectory = joinPath(this.steamDirectory);
    let steamImageDirectory = joinPath(this.steamDirectory, "image");
    let location = new SaveLocation(backupSaveDirectory, backupImageDirectory, steamSaveDirectory, steamImageDirectory);
    return location;
  }

}


export class SaveLocation {

  public backupSaveDirectory: string;
  public backupImageDirectory: string;
  public steamSaveDirectory: string;
  public steamImageDirectory: string;

  public constructor(backupSaveDirectory: string, backupImageDirectory: string, steamSaveDirectory: string, steamImageDirectory: string) {
    this.backupSaveDirectory = backupSaveDirectory;
    this.backupImageDirectory = backupImageDirectory;
    this.steamSaveDirectory = steamSaveDirectory;
    this.steamImageDirectory = steamImageDirectory;
  }

  public get(place: SavePlace, type: SaveType, file?: string): string {
    let directory = "";
    if (place === "backup") {
      directory = (type === "save") ? this.backupSaveDirectory : this.backupImageDirectory;
    } else {
      directory = (type === "save") ? this.steamSaveDirectory : this.steamImageDirectory;
    }
    let paths = [directory];
    if (file !== undefined) {
      paths.push(file);
    }
    let path = joinPath(...paths);
    return path;
  }

  public static oppositePlace(place: SavePlace): SavePlace {
    return (place === "backup") ? "steam" : "backup";
  }

}


type SavePlace = "backup" | "steam";
type SaveType = "save" | "image";