//

import {
  join as joinPath
} from "path";


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


export type SavePlace = "backup" | "steam";
export type SaveType = "save" | "image";