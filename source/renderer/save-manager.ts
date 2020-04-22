//

import * as fs from "fs";
import {
  join as joinPath
} from "path";


const STEAM_DIRECTORY = "C:/Program Files (x86)/Steam/steamapps/common/Rabi-Ribi/save";
const BACKUP_DIRECTORY = joinPath(process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"] ?? "", ".rabimanager");


export class Save {

  public key: string;

  public constructor(key: string) {
    this.key = key;
  }

  public backup(): void {
    fs.mkdirSync(this.backupSavePath(), {recursive: true});
    fs.mkdirSync(this.backupImagePath(), {recursive: true});
    let sourceSaveFiles = fs.readdirSync(this.sourceSavePath()).filter((file) => file.match(/save(\d+)\.sav$/));
    let sourceImageFiles = fs.readdirSync(this.sourceImagePath()).filter((file) => file.match(/save(\d+)_a\.bmp$/));
    let backupSaveFiles = fs.readdirSync(this.backupSavePath()).filter((file) => file.match(/save(\d+)\.sav$/));
    let backupImageFiles = fs.readdirSync(this.backupImagePath()).filter((file) => file.match(/save(\d+)_a\.bmp$/));
    for (let file of backupSaveFiles) {
      fs.unlinkSync(this.backupSavePath(file));
    }
    for (let file of backupImageFiles) {
      fs.unlinkSync(this.backupImagePath(file));
    }
    for (let file of sourceSaveFiles) {
      fs.copyFileSync(this.sourceSavePath(file), this.backupSavePath(file));
    }
    for (let file of sourceImageFiles) {
      fs.copyFileSync(this.sourceImagePath(file), this.backupImagePath(file));
    }
  }

  public use(): void {
    let sourceSaveFiles = fs.readdirSync(this.sourceSavePath()).filter((file) => file.match(/save(\d+)\.sav$/));
    let sourceImageFiles = fs.readdirSync(this.sourceImagePath()).filter((file) => file.match(/save(\d+)_a\.bmp$/));
    let backupSaveFiles = fs.readdirSync(this.backupSavePath()).filter((file) => file.match(/save(\d+)\.sav$/));
    let backupImageFiles = fs.readdirSync(this.backupImagePath()).filter((file) => file.match(/save(\d+)_a\.bmp$/));
    for (let file of sourceSaveFiles) {
      fs.unlinkSync(this.sourceSavePath(file));
    }
    for (let file of sourceImageFiles) {
      fs.unlinkSync(this.sourceImagePath(file));
    }
    for (let file of backupSaveFiles) {
      fs.copyFileSync(this.backupSavePath(file), this.sourceSavePath(file));
    }
    for (let file of backupImageFiles) {
      fs.copyFileSync(this.backupImagePath(file), this.sourceImagePath(file));
    }
  }

  private createPath(paths: Array<string>, file?: string): string {
    let nextPaths = Array.from(paths);
    if (file) {
      nextPaths.push(file);
    }
    let path = joinPath(...nextPaths);
    return path;
  }

  private backupSavePath(file?: string): string {
    return this.createPath([BACKUP_DIRECTORY, this.key], file);
  }

  private backupImagePath(file?: string): string {
    return this.createPath([BACKUP_DIRECTORY, this.key, "image"], file);
  }

  private sourceSavePath(file?: string): string {
    return this.createPath([STEAM_DIRECTORY], file);
  }

  private sourceImagePath(file?: string): string {
    return this.createPath([STEAM_DIRECTORY, "image"], file);
  }

}


export class SaveManager {

  public currentKey: string | null = null;
  public saves: Map<string, Save> = new Map();

  public constructor() {
    this.ensureDirectory();
    this.loadSaves();
    this.loadSetting();
  }

  private ensureDirectory(): void {
    fs.mkdirSync(BACKUP_DIRECTORY, {recursive: true});
  }

  private loadSaves(): void {
    let keys = fs.readdirSync(BACKUP_DIRECTORY).filter((file) => fs.statSync(joinPath(BACKUP_DIRECTORY, file)).isDirectory());
    for (let key of keys) {
      let save = new Save(key);
      this.saves.set(key, save);
    }
  }

  private loadSetting(): void {
    let settingPath = joinPath(BACKUP_DIRECTORY, "setting.json");
    if (fs.existsSync(settingPath)) {
      let setting = JSON.parse(fs.readFileSync(settingPath).toString());
      this.currentKey = setting.currentKey;
    }
  }

  private saveSetting(): void {
    let settingPath = joinPath(BACKUP_DIRECTORY, "setting.json");
    let setting = {} as any;
    setting.currentKey = this.currentKey;
    fs.writeFileSync(settingPath, JSON.stringify(setting));
  }

  public backup(key: string): void {
    let save = this.saves.get(key);
    if (save === undefined && key.match(/^[\w\d-]+$/)) {
      save = new Save(key);
      this.saves.set(key, save);
    }
    if (save) {
      save.backup();
      this.currentKey = key;
      this.saveSetting();
    }
  }

  public use(key: string): void {
    let save = this.saves.get(key);
    if (save) {
      save.use();
      this.currentKey = key;
      this.saveSetting();
    }
  }

  public change(key: string): void {
    if (this.currentKey) {
      this.backup(this.currentKey);
    }
    this.use(key);
  }

}