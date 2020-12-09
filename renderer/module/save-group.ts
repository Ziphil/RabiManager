//

import {
  promises as fs
} from "fs";
import {
  SaveLocation
} from "./save-location";
import {
  SaveManager
} from "./save-manager";
import {
  Save,
  SaveParser
} from "./save-parser";


export class SaveGroup {

  public key: string;
  public location: SaveLocation;
  private manager: SaveManager;
  public saves: Map<number, Save>;

  public constructor(key: string, location: SaveLocation, manager: SaveManager) {
    this.key = key;
    this.location = location;
    this.manager = manager;
    this.saves = new Map();
  }

  public async load(): Promise<void> {
    this.saves = new Map();
    let promises = Array.from({length: 31}, (value, number) => {
      let promise = new Promise(async (resolve, reject) => {
        try {
          let parser = new SaveParser(this.location.get("backup", "save", number), this.location.get("backup", "image", number));
          let save = await parser.parse();
          this.saves.set(number, save);
        } catch (error) {
          this.saves.delete(number);
        }
        resolve();
      });
      return promise;
    });
    await Promise.all(promises);
  }

  private async ensureBackupDirectories(): Promise<void> {
    await fs.mkdir(this.location.get("backup", "save"), {recursive: true});
    await fs.mkdir(this.location.get("backup", "image"), {recursive: true});
  }

  private async copy(targetPlace: "backup" | "steam", type: "save" | "image"): Promise<void> {
    let sourcePlace = SaveLocation.oppositePlace(targetPlace);
    let regexp = SaveLocation.regexp(type);
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