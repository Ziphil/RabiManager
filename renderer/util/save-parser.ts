//

import {
  promises as fs
} from "fs";
import {
  OrBelow
} from "./type";


export class SaveParser {

  private path: string;

  public constructor(path: string) {
    this.path = path;
  }

  public async parse(): Promise<Save> {
    let buffer = await fs.readFile(this.path);
    let result = {} as any;
    for (let [key, spec] of Object.entries(DATA)) {
      let offset = spec.offset;
      let length = spec.length;
      let converter = spec.converter;
      if (length === 1) {
        result[key] = converter(buffer.readInt8(offset));
      } else if (length === 2) {
        result[key] = converter(buffer.readInt16LE(offset));
      } else if (length === 4) {
        result[key] = converter(buffer.readInt32LE(offset));
      } else if (length === 8) {
        result[key] = converter(buffer.readDoubleLE(offset));
      }
    }
    return result;
  }

  public static number(): Converter<number> {
    let converter = function (code: number): number {
      return code;
    };
    return converter;
  }

  public static level<N extends number>(maxLevel: N): Converter<OrBelow<N>> {
    let converter = function (code: number): OrBelow<N> {
      if (code >= maxLevel + 1) {
        throw new Error("weird save");
      }
      return code as any;
    };
    return converter;
  }

  public static of<T>(array: ArrayLike<T>): Converter<T> {
    let converter = function (code: number): T {
      if (code >= array.length) {
        throw new Error("weird save");
      }
      return array[code];
    };
    return converter;
  }

}


const DIFFICULTIES = [
  "Casual", "Novice", "Normal", "Hard", "Hell", "Bunny Extinction"
] as const;
const MAP_NAMES = [
  "Southern Woodland", "Weastern Coast", "Island Core", "Northern Tundra", "Eastern Highlands", "Rabi Rabi Town", "Plurkwood", "Subterranean Area", "Warp Destination", "System Interior"
] as const;
const SPEEDRUN_MODES = [
  "Story", "Speedrun"
] as const;
const GAME_MODES = [
  "Standard", "Alternative", "Bunny Heaven", "Bunny Hell"
] as const;

const DATA = {
  pikoHammerLevel: {offset: 0x7090, length: 1, converter: SaveParser.level(3)},
  airJumpLevel: {offset: 0x7094, length: 1, converter: SaveParser.level(1)},
  slidingPowderLevel: {offset: 0x7098, length: 1, converter: SaveParser.level(3)},
  carrotBombLevel: {offset: 0x709C, length: 1, converter: SaveParser.level(3)},
  sandglassLevel: {offset: 0x70A0, length: 1, converter: SaveParser.level(1)},
  speedBoostLevel: {offset: 0x70A4, length: 1, converter: SaveParser.level(3)},
  autoAttackLevel: {offset: 0x70A8, length: 1, converter: SaveParser.level(3)},
  ribbonLevel: {offset: 0x70AC, length: 1, converter: SaveParser.level(1)},
  soulHeartLevel: {offset: 0x70B0, length: 1, converter: SaveParser.level(1)},
  rabiSlipperLevel: {offset: 0x70B4, length: 1, converter: SaveParser.level(1)},
  bunnySpinLevel: {offset: 0x70B8, length: 1, converter: SaveParser.level(3)},
  quickHairpinLevel: {offset: 0x70BC, length: 1, converter: SaveParser.level(1)},
  fairyBookLevel: {offset: 0x70C0, length: 1, converter: SaveParser.level(1)},
  chaosRodLevel: {offset: 0x70C4, length: 1, converter: SaveParser.level(1)},
  hammerWaveLevel: {offset: 0x70C8, length: 1, converter: SaveParser.level(3)},
  hammerRollLevel: {offset: 0x70CC, length: 1, converter: SaveParser.level(3)},
  lightOrbLevel: {offset: 0x70D0, length: 1, converter: SaveParser.level(3)},
  waterOrbLevel: {offset: 0x70D4, length: 1, converter: SaveParser.level(3)},
  fireOrbLevel: {offset: 0x70D8, length: 1, converter: SaveParser.level(3)},
  natureOrbLevel: {offset: 0x70DC, length: 1, converter: SaveParser.level(3)},
  pHairpinLevel: {offset: 0x70E0, length: 1, converter: SaveParser.level(3)},
  sunnyBeamLevel: {offset: 0x70E4, length: 1, converter: SaveParser.level(1)},
  plusNecklaceLevel: {offset: 0x70E8, length: 1, converter: SaveParser.level(3)},
  cyberFlowerLevel: {offset: 0x70EC, length: 1, converter: SaveParser.level(1)},
  healingStaffLevel: {offset: 0x70F0, length: 1, converter: SaveParser.level(1)},
  maxBraceletLevel: {offset: 0x70F4, length: 1, converter: SaveParser.level(1)},
  explosionShotLevel: {offset: 0x70F8, length: 1, converter: SaveParser.level(1)},
  airDashLevel: {offset: 0x70FC, length: 1, converter: SaveParser.level(3)},
  bunnyStrikeLevel: {offset: 0x7100, length: 1, converter: SaveParser.level(3)},
  strangeBoxLevel: {offset: 0x7104, length: 1, converter: SaveParser.level(1)},
  wallJumpLevel: {offset: 0x7108, length: 1, converter: SaveParser.level(3)},
  spikeBarrierLevel: {offset: 0x710C, length: 1, converter: SaveParser.level(3)},
  bunnyAmuletLevel: {offset: 0x7110, length: 1, converter: SaveParser.level(4)},
  chargeRingLevel: {offset: 0x7114, length: 1, converter: SaveParser.level(3)},
  carrotShooterLevel: {offset: 0x7118, length: 1, converter: SaveParser.level(1)},
  superCarrotLevel: {offset: 0x711C, length: 1, converter: SaveParser.level(3)},
  rumiDonutNumber: {offset: 0x7120, length: 1, converter: SaveParser.number()},
  rumiCakeNumber: {offset: 0x7124, length: 1, converter: SaveParser.number()},
  goldCarrotNumber: {offset: 0x7128, length: 1, converter: SaveParser.number()},
  cocoaBombNumber: {offset: 0x712C, length: 1, converter: SaveParser.number()},
  hp: {offset: 0x80A0, length: 4, converter: SaveParser.number()},
  currentMapName: {offset: 0x80A4, length: 1, converter: SaveParser.of(MAP_NAMES)},
  playedTime: {offset: 0x80B8, length: 4, converter: SaveParser.number()},
  mp: {offset: 0x80C0, length: 8, converter: SaveParser.number()},
  takenDamage: {offset: 0x80C8, length: 4, converter: SaveParser.number()},
  difficulty: {offset: 0x8118, length: 4, converter: SaveParser.of(DIFFICULTIES)},
  speedrunMode: {offset: 0x9A2C, length: 1, converter: SaveParser.of(SPEEDRUN_MODES)},
  gameMode: {offset: 0x11098, length: 1, converter: SaveParser.of(GAME_MODES)}
};

type Converter<T> = (code: number) => T;
export type Save = {[K in keyof typeof DATA]: ReturnType<(typeof DATA)[K]["converter"]>};