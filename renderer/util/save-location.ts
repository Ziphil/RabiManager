//

import {
  join as joinPath
} from "path";


export class SaveLocation {

  private backupSaveDirectory: string;
  private backupImageDirectory: string;
  private steamSaveDirectory: string;
  private steamImageDirectory: string;

  public constructor(backupSaveDirectory: string, backupImageDirectory: string, steamSaveDirectory: string, steamImageDirectory: string) {
    this.backupSaveDirectory = backupSaveDirectory;
    this.backupImageDirectory = backupImageDirectory;
    this.steamSaveDirectory = steamSaveDirectory;
    this.steamImageDirectory = steamImageDirectory;
  }

  public get(place: SavePlace, type: SaveType, file?: string | number): string {
    let directory = "";
    if (place === "backup") {
      directory = (type === "save") ? this.backupSaveDirectory : this.backupImageDirectory;
    } else {
      directory = (type === "save") ? this.steamSaveDirectory : this.steamImageDirectory;
    }
    let paths = [directory];
    if (file !== undefined) {
      if (typeof file === "string") {
        paths.push(file);
      } else {
        paths.push(SaveLocation.fullFile(type, file));
      }
    }
    let path = joinPath(...paths);
    return path;
  }

  public static oppositePlace(place: SavePlace): SavePlace {
    return (place === "backup") ? "steam" : "backup";
  }

  public static fullFile(type: SaveType, number: number): string {
    return (type === "save") ? `save${number}.sav` : `save${number}_a.bmp`;
  }

  public static regexp(type: SaveType): RegExp {
    return (type === "save") ? /save(\d+)\.sav$/ : /save(\d+)_a\.bmp$/;
  }

}


export type SavePlace = "backup" | "steam";
export type SaveType = "save" | "image";