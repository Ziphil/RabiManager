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
      let converter = spec.converter;
      result[key] = converter(buffer, offset);
    }
    return result;
  }

  public static int(): Converter<number> {
    let converter = function (buffer: Buffer, offset: number): number {
      let code = buffer.readUInt32LE(offset);
      return code;
    };
    return converter;
  }

  public static double(): Converter<number> {
    let converter = function (buffer: Buffer, offset: number): number {
      let code = buffer.readDoubleLE(offset);
      return code;
    };
    return converter;
  }

  public static level<N extends number>(maxLevel: N): Converter<OrBelow<N> | -1> {
    let converter = function (buffer: Buffer, offset: number): OrBelow<N> | -1 {
      let code = buffer.readUInt32LE(offset);
      if (code === 0xFFFFFFFF) {
        code = -1;
      }
      if (code < -1 || code > maxLevel) {
        throw new Error(`weird save: 0x${offset.toString(16)}[4] -> 0x${code.toString(16)}`);
      }
      return code as any;
    };
    return converter;
  }

  public static count(size: number): Converter<number> {
    let converter = function (buffer: Buffer, offset: number): number {
      let count = 0;
      for (let i = 0 ; i < size ; i ++) {
        let code = buffer.readUInt32LE(offset + i * 4);
        if (code > 0) {
          count ++;
        }
      }
      return count;
    };
    return converter;
  }

  public static of<T>(array: ArrayLike<T>): Converter<T> {
    let converter = function (buffer: Buffer, offset: number): T {
      let code = buffer.readUInt32LE(offset);
      if (code >= array.length) {
        throw new Error(`weird save: 0x${offset.toString(16)}[4] -> 0x${code.toString(16)}`);
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
const RANKS = [
  "E", "D", "C", "B", "A", "S", "SS", "SSS", "MAX"
] as const;
const SPEEDRUN_MODES = [
  "Story", "Speedrun"
] as const;
const GAME_MODES = [
  "Standard", "Alternative", "Bunny Heaven", "Bunny Hell"
] as const;
const BADGE_STATUSES = [
  "unearned", "unequipped", "equipped"
] as const;

const DATA = {
  x: {offset: 0x7084, converter: SaveParser.int()},
  y: {offset: 0x7088, converter: SaveParser.int()},
  pikoHammerLevel: {offset: 0x7090, converter: SaveParser.level(3)},
  airJumpLevel: {offset: 0x7094, converter: SaveParser.level(1)},
  slidingPowderLevel: {offset: 0x7098, converter: SaveParser.level(3)},
  carrotBombLevel: {offset: 0x709C, converter: SaveParser.level(3)},
  sandglassLevel: {offset: 0x70A0, converter: SaveParser.level(1)},
  speedBoostLevel: {offset: 0x70A4, converter: SaveParser.level(3)},
  autoAttackLevel: {offset: 0x70A8, converter: SaveParser.level(3)},
  ribbonLevel: {offset: 0x70AC, converter: SaveParser.level(1)},
  soulHeartLevel: {offset: 0x70B0, converter: SaveParser.level(1)},
  rabiSlipperLevel: {offset: 0x70B4, converter: SaveParser.level(1)},
  bunnySpinLevel: {offset: 0x70B8, converter: SaveParser.level(3)},
  quickHairpinLevel: {offset: 0x70BC, converter: SaveParser.level(1)},
  fairyBookLevel: {offset: 0x70C0, converter: SaveParser.level(1)},
  chaosRodLevel: {offset: 0x70C4, converter: SaveParser.level(1)},
  hammerWaveLevel: {offset: 0x70C8, converter: SaveParser.level(3)},
  hammerRollLevel: {offset: 0x70CC, converter: SaveParser.level(3)},
  lightOrbLevel: {offset: 0x70D0, converter: SaveParser.level(3)},
  waterOrbLevel: {offset: 0x70D4, converter: SaveParser.level(3)},
  fireOrbLevel: {offset: 0x70D8, converter: SaveParser.level(3)},
  natureOrbLevel: {offset: 0x70DC, converter: SaveParser.level(3)},
  pHairpinLevel: {offset: 0x70E0, converter: SaveParser.level(3)},
  sunnyBeamLevel: {offset: 0x70E4, converter: SaveParser.level(1)},
  plusNecklaceLevel: {offset: 0x70E8, converter: SaveParser.level(3)},
  cyberFlowerLevel: {offset: 0x70EC, converter: SaveParser.level(1)},
  healingStaffLevel: {offset: 0x70F0, converter: SaveParser.level(1)},
  maxBraceletLevel: {offset: 0x70F4, converter: SaveParser.level(1)},
  explosionShotLevel: {offset: 0x70F8, converter: SaveParser.level(1)},
  airDashLevel: {offset: 0x70FC, converter: SaveParser.level(3)},
  bunnyStrikeLevel: {offset: 0x7100, converter: SaveParser.level(3)},
  strangeBoxLevel: {offset: 0x7104, converter: SaveParser.level(1)},
  wallJumpLevel: {offset: 0x7108, converter: SaveParser.level(3)},
  spikeBarrierLevel: {offset: 0x710C, converter: SaveParser.level(3)},
  bunnyAmuletLevel: {offset: 0x7110, converter: SaveParser.level(4)},
  chargeRingLevel: {offset: 0x7114, converter: SaveParser.level(3)},
  carrotShooterLevel: {offset: 0x7118, converter: SaveParser.level(1)},
  superCarrotLevel: {offset: 0x711C, converter: SaveParser.level(3)},
  rumiDonutNumber: {offset: 0x7120, converter: SaveParser.int()},
  rumiCakeNumber: {offset: 0x7124, converter: SaveParser.int()},
  goldCarrotNumber: {offset: 0x7128, converter: SaveParser.int()},
  cocoaBombNumber: {offset: 0x712C, converter: SaveParser.int()},
  healthPlusStatus: {offset: 0x718C, converter: SaveParser.of(BADGE_STATUSES)},
  healthSurgeStatus: {offset: 0x7190, converter: SaveParser.of(BADGE_STATUSES)},
  manaPlusStatus: {offset: 0x7194, converter: SaveParser.of(BADGE_STATUSES)},
  manaSurgeStatus: {offset: 0x7198, converter: SaveParser.of(BADGE_STATUSES)},
  crisisBoostStatus: {offset: 0x719C, converter: SaveParser.of(BADGE_STATUSES)},
  attackGrowStatus: {offset: 0x71A0, converter: SaveParser.of(BADGE_STATUSES)},
  defenceGrowStatus: {offset: 0x71A4, converter: SaveParser.of(BADGE_STATUSES)},
  attackTradeStatus: {offset: 0x71A8, converter: SaveParser.of(BADGE_STATUSES)},
  defenceTradeStatus: {offset: 0x71AC, converter: SaveParser.of(BADGE_STATUSES)},
  armStrengthStatus: {offset: 0x71B0, converter: SaveParser.of(BADGE_STATUSES)},
  carrotBoostStatus: {offset: 0x71B4, converter: SaveParser.of(BADGE_STATUSES)},
  weakenStatus: {offset: 0x71B8, converter: SaveParser.of(BADGE_STATUSES)},
  selfDefenseStatus: {offset: 0x71BC, converter: SaveParser.of(BADGE_STATUSES)},
  armoredStatus: {offset: 0x71C0, converter: SaveParser.of(BADGE_STATUSES)},
  luckySevenStatus: {offset: 0x71C4, converter: SaveParser.of(BADGE_STATUSES)},
  hexCancelStatus: {offset: 0x71C8, converter: SaveParser.of(BADGE_STATUSES)},
  pureLoveStatus: {offset: 0x71CC, converter: SaveParser.of(BADGE_STATUSES)},
  toxicStrikeStatus: {offset: 0x71D0, converter: SaveParser.of(BADGE_STATUSES)},
  frameCancelStatus: {offset: 0x71D4, converter: SaveParser.of(BADGE_STATUSES)},
  healthWagerStatus: {offset: 0x71D8, converter: SaveParser.of(BADGE_STATUSES)},
  manaWagerStatus: {offset: 0x71DC, converter: SaveParser.of(BADGE_STATUSES)},
  staminaPlusStatus: {offset: 0x71E0, converter: SaveParser.of(BADGE_STATUSES)},
  blessedStatus: {offset: 0x71E4, converter: SaveParser.of(BADGE_STATUSES)},
  hitboxDownStatus: {offset: 0x71E8, converter: SaveParser.of(BADGE_STATUSES)},
  cashbackStatus: {offset: 0x71EC, converter: SaveParser.of(BADGE_STATUSES)},
  survivalStatus: {offset: 0x71F0, converter: SaveParser.of(BADGE_STATUSES)},
  topFormStatus: {offset: 0x71F4, converter: SaveParser.of(BADGE_STATUSES)},
  toughSkinStatus: {offset: 0x71F8, converter: SaveParser.of(BADGE_STATUSES)},
  erinaBadgeStatus: {offset: 0x71FC, converter: SaveParser.of(BADGE_STATUSES)},
  ribbonBadgeStatus: {offset: 0x7200, converter: SaveParser.of(BADGE_STATUSES)},
  autoTriggerStatus: {offset: 0x7204, converter: SaveParser.of(BADGE_STATUSES)},
  lilithGiftStatus: {offset: 0x7208, converter: SaveParser.of(BADGE_STATUSES)},
  healthUpCount: {offset: 0x720C, converter: SaveParser.count(64)},
  attackUpCount: {offset: 0x730C, converter: SaveParser.count(64)},
  manaUpCount: {offset: 0x740C, converter: SaveParser.count(64)},
  regenUpCount: {offset: 0x750C, converter: SaveParser.count(64)},
  packUpCount: {offset: 0x760C, converter: SaveParser.count(64)},
  hp: {offset: 0x80A0, converter: SaveParser.int()},
  currentMapName: {offset: 0x80A4, converter: SaveParser.of(MAP_NAMES)},
  playedTime: {offset: 0x80B8, converter: SaveParser.int()},
  mp: {offset: 0x80C0, converter: SaveParser.double()},
  takenDamage: {offset: 0x80C8, converter: SaveParser.int()},
  difficulty: {offset: 0x8118, converter: SaveParser.of(DIFFICULTIES)},
  rumiRank: {offset: 0x81BC, converter: SaveParser.of(RANKS)},
  speedrunMode: {offset: 0x9A2C, converter: SaveParser.of(SPEEDRUN_MODES)},
  gameMode: {offset: 0x11098, converter: SaveParser.of(GAME_MODES)}
};

type Converter<T> = (buffer: Buffer, offset: number) => T;
export type Save = {[K in keyof typeof DATA]: ReturnType<(typeof DATA)[K]["converter"]>};