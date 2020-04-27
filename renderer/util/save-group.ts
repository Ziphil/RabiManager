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
  public saves: Map<number, true | Save>;

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
      if (exists) {
        this.saves.set(number, true);
      } else {
        this.saves.delete(number);
      }
    }
  }

  public async loadDetail(number: number): Promise<void> {
    let currentSave = this.saves.get(number);
    if (currentSave === true) {
      let parser = new SaveParser(this.location.get("backup", "save", `save${number}.sav`));
      let save = await parser.parse();
      this.saves.set(number, save);
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