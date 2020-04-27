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

  public static itemStatuses(): Converter<ItemStatuses> {
    let converter = function (buffer: Buffer, _: number): ItemStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(ITEM_STATUSES_DATA)) {
        let offset = spec.offset;
        let maxLevel = spec.maxLevel;
        let rawLevel = SaveParser.int()(buffer, offset);
        let level = Math.abs(rawLevel);
        let equipped = rawLevel >= 0;
        if (level < 0 || level > maxLevel) {
          throw new Error(`weird save: 0x${offset.toString(16)}[4] -> 0x${rawLevel.toString(16)}`);
        }
        result[key] = {level, equipped};
      }
      return result;
    };
    return converter;
  }

  public static consummableCounts(): Converter<ConsummableCounts> {
    let converter = function (buffer: Buffer, _: number): ConsummableCounts {
      let result = {} as any;
      for (let [key, spec] of Object.entries(CONSUMMABLE_COUNTS_DATA)) {
        let offset = spec.offset;
        result[key] = SaveParser.int()(buffer, offset);
      }
      return result;
    };
    return converter;
  }

  public static badgeStatuses(): Converter<BadgeStatuses> {
    let converter = function (buffer: Buffer, _: number): BadgeStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(BADGE_STATUSES_DATA)) {
        let offset = spec.offset;
        result[key] = SaveParser.of(BADGE_STATUSES)(buffer, offset);
      }
      return result;
    };
    return converter;
  }

  public static strengthCounts(): Converter<StrengthCounts> {
    let converter = function (buffer: Buffer, _: number): StrengthCounts {
      let result = {} as any;
      for (let [key, spec] of Object.entries(STRENGTH_COUNTS_DATA)) {
        let offset = spec.offset;
        result[key] = SaveParser.count(64)(buffer, offset);
      }
      return result;
    };
    return converter;
  }

  public static bossStatuses(): Converter<BossStatuses> {
    let converter = function (buffer: Buffer, orderOffset: number): BossStatuses {
      let orderCodes = [] as Array<number>;
      let result = {} as any;
      for (let i = 0 ; i < 24 ; i ++) {
        let orderCode = SaveParser.int()(buffer, orderOffset + i * 4);
        orderCodes.push(orderCode);
      }
      for (let [key, spec] of Object.entries(BOSS_STATUSES_DATA)) {
        let bossOffset = spec.offset;
        let bossSpecialOffset = spec.specialOffset;
        let bossCode = spec.code;
        let rank = (bossOffset !== null) ? SaveParser.of(RANKS)(buffer, bossOffset) : null;
        let specialRank = (bossSpecialOffset !== null) ? SaveParser.of(RANKS)(buffer, bossSpecialOffset) : null;
        let order = (orderCodes.indexOf(bossCode) >= 0) ? orderCodes.indexOf(bossCode) : null;
        result[key] = {rank, specialRank, order};
      }
      return result;
    };
    return converter;
  }

  public static count(size: number): Converter<number> {
    let converter = function (buffer: Buffer, offset: number): number {
      let count = 0;
      for (let i = 0 ; i < size ; i ++) {
        let code = SaveParser.int()(buffer, offset + i * 4);
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
      let code = SaveParser.int()(buffer, offset);
      if (code >= array.length) {
        throw new Error(`weird save: 0x${offset.toString(16)}[4] -> 0x${code.toString(16)}`);
      }
      return array[code];
    };
    return converter;
  }

  public static int(): Converter<number> {
    let converter = function (buffer: Buffer, offset: number): number {
      let code = buffer.readInt32LE(offset);
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

const ITEM_STATUSES_DATA = {
  pikoHammer: {offset: 0x7090, maxLevel: 3},
  carrotBomb: {offset: 0x709C, maxLevel: 3},
  bunnyAmulet: {offset: 0x7110, maxLevel: 4},
  superCarrot: {offset: 0x711C, maxLevel: 3},
  airJump: {offset: 0x7094, maxLevel: 1},
  rabiSlippers: {offset: 0x70B4, maxLevel: 1},
  slidingPowder: {offset: 0x7098, maxLevel: 3},
  bunnyStrike: {offset: 0x7100, maxLevel: 3},
  wallJump: {offset: 0x7108, maxLevel: 3},
  airDash: {offset: 0x70FC, maxLevel: 3},
  bunnyWhirl: {offset: 0x70B8, maxLevel: 3},
  hammerRoll: {offset: 0x70CC, maxLevel: 3},
  hammerWave: {offset: 0x70C8, maxLevel: 3},
  speedBoost: {offset: 0x70A4, maxLevel: 3},
  soulHeart: {offset: 0x70B0, maxLevel: 1},
  spikeBarrier: {offset: 0x710C, maxLevel: 3},
  hourglass: {offset: 0x70A0, maxLevel: 1},
  strangeBox: {offset: 0x7104, maxLevel: 1},
  fireOrb: {offset: 0x70D8, maxLevel: 3},
  waterOrb: {offset: 0x70D4, maxLevel: 3},
  natureOrb: {offset: 0x70DC, maxLevel: 3},
  lightOrb: {offset: 0x70D0, maxLevel: 3},
  ribbon: {offset: 0x70AC, maxLevel: 1},
  sunnyBeam: {offset: 0x70E4, maxLevel: 1},
  chaosRod: {offset: 0x70C4, maxLevel: 1},
  healingStaff: {offset: 0x70F0, maxLevel: 1},
  explodeShot: {offset: 0x70F8, maxLevel: 1},
  carrotShooter: {offset: 0x7118, maxLevel: 1},
  quickBarrette: {offset: 0x70BC, maxLevel: 1},
  maxBracelet: {offset: 0x70F4, maxLevel: 1},
  chargeRing: {offset: 0x7114, maxLevel: 3},
  plusNecklace: {offset: 0x70E8, maxLevel: 3},
  autoEarrings: {offset: 0x70A8, maxLevel: 3},
  carrotBook: {offset: 0x70C0, maxLevel: 1},
  pHairpin: {offset: 0x70E0, maxLevel: 3},
  cyberFlower: {offset: 0x70EC, maxLevel: 1}
} as const;
const CONSUMMABLE_COUNTS_DATA = {
  rumiDonut: {offset: 0x7120},
  rumiCake: {offset: 0x7124},
  goldCarrot: {offset: 0x7128},
  cocoaBomb: {offset: 0x712C}
} as const;
const BADGE_STATUSES_DATA = {
  healthPlus: {offset: 0x718C},
  healthSurge: {offset: 0x7190},
  manaPlus: {offset: 0x7194},
  manaSurge: {offset: 0x7198},
  crisisBoost: {offset: 0x719C},
  attackGrow: {offset: 0x71A0},
  defenceGrow: {offset: 0x71A4},
  attackTrade: {offset: 0x71A8},
  defenceTrade: {offset: 0x71AC},
  armStrength: {offset: 0x71B0},
  carrotBoost: {offset: 0x71B4},
  weaken: {offset: 0x71B8},
  selfDefense: {offset: 0x71BC},
  armored: {offset: 0x71C0},
  luckySeven: {offset: 0x71C4},
  hexCancel: {offset: 0x71C8},
  pureLove: {offset: 0x71CC},
  toxicStrike: {offset: 0x71D0},
  frameCancel: {offset: 0x71D4},
  healthWager: {offset: 0x71D8},
  manaWager: {offset: 0x71DC},
  staminaPlus: {offset: 0x71E0},
  blessed: {offset: 0x71E4},
  hitboxDown: {offset: 0x71E8},
  cashback: {offset: 0x71EC},
  survival: {offset: 0x71F0},
  topForm: {offset: 0x71F4},
  toughSkin: {offset: 0x71F8},
  erinaBadge: {offset: 0x71FC},
  ribbonBadge: {offset: 0x7200},
  autoTrigger: {offset: 0x7204},
  lilithGift: {offset: 0x7208}
} as const;
const STRENGTH_COUNTS_DATA = {
  healthUp: {offset: 0x720C},
  attackUp: {offset: 0x730C},
  manaUp: {offset: 0x740C},
  regenUp: {offset: 0x750C},
  packUp: {offset: 0x760C}
} as const;
const BOSS_STATUSES_DATA = {
  rumi: {offset: 0x81BC, specialOffset: null, code: 0x01},
  rita: {offset: 0x81C0, specialOffset: null, code: 0x02},
  nieve: {offset: 0x81C4, specialOffset: null, code: 0x03},
  nixie: {offset: 0x81C8, specialOffset: null, code: 0x04},
  aruraune: {offset: 0x81CC, specialOffset: null, code: 0x05},
  pandora: {offset: 0x81D0, specialOffset: null, code: 0x06},
  irisu: {offset: 0x81D4, specialOffset: null, code: 0x07},
  saya: {offset: 0x81D8, specialOffset: null, code: 0x08},
  cicini: {offset: 0x81DC, specialOffset: null, code: 0x09},
  syaro: {offset: 0x81E0, specialOffset: null, code: 0x0A},
  cocoa: {offset: 0x81E4, specialOffset: 0x9A58, code: 0x0B},
  ashuri: {offset: 0x81E8, specialOffset: 0x9A5C, code: 0x0C},
  lilith: {offset: 0x81EC, specialOffset: null, code: 0x0D},
  vanilla: {offset: 0x81F0, specialOffset: null, code: 0x0E},
  chocolate: {offset: 0x81F4, specialOffset: null, code: 0x0F},
  kotri: {offset: 0x81F8, specialOffset: null, code: 0x10},
  kekeBunny: {offset: 0x81FC, specialOffset: null, code: 0x11},
  seana: {offset: 0x8200, specialOffset: null, code: 0x12},
  miriam: {offset: 0x8204, specialOffset: null, code: 0x13},
  miru: {offset: 0x8208, specialOffset: null, code: 0x14},
  noah: {offset: 0x820C, specialOffset: null, code: 0x15},
  erinoah: {offset: 0x8230, specialOffset: null, code: 0x1E},
  erina: {offset: null, specialOffset: null, code: 0x1F},
  ribbon: {offset: null, specialOffset: 0x9A94, code: 0x1A}
} as const;
const DATA = {
  itemStatuses: {offset: -1, converter: SaveParser.itemStatuses()},
  consummableCounts: {offset: -1, converter: SaveParser.consummableCounts()},
  badgeStatuses: {offset: -1, converter: SaveParser.badgeStatuses()},
  strengthCounts: {offset: -1, converter: SaveParser.strengthCounts()},
  bossStatuses: {offset: 0x95C4, converter: SaveParser.bossStatuses()},
  x: {offset: 0x7084, converter: SaveParser.int()},
  y: {offset: 0x7088, converter: SaveParser.int()},
  hp: {offset: 0x80A0, converter: SaveParser.int()},
  mp: {offset: 0x80C0, converter: SaveParser.double()},
  enAmount: {offset: 0x92AC, converter: SaveParser.int()},
  magicColor: {offset: 0x9948, converter: SaveParser.int()},
  takenDamage: {offset: 0x80C8, converter: SaveParser.int()},
  takenSpikeDamage: {offset: 0x9958, converter: SaveParser.int()},
  dealtDamage: {offset: 0x99AC, converter: SaveParser.int()},
  healedHp: {offset: 0x99B0, converter: SaveParser.int()},
  itemPercent: {offset: 0x9B18, converter: SaveParser.int()},
  mapPercent: {offset: 0x9B1C, converter: SaveParser.int()},
  mapName: {offset: 0x80A4, converter: SaveParser.of(MAP_NAMES)},
  chapter: {offset: 0x99A8, converter: SaveParser.int()},
  playTime: {offset: 0x80B8, converter: SaveParser.int()},
  runTime: {offset: 0x8280, converter: SaveParser.int()},
  totalPlayTime: {offset: 0x9950, converter: SaveParser.int()},
  totalRunTime: {offset: 0x9954, converter: SaveParser.int()},
  difficulty: {offset: 0x8118, converter: SaveParser.of(DIFFICULTIES)},
  gameMode: {offset: 0x11098, converter: SaveParser.of(GAME_MODES)},
  speedrunMode: {offset: 0x9A2C, converter: SaveParser.of(SPEEDRUN_MODES)},
  loopCount: {offset: 0x10E3C, converter: SaveParser.int()}
} as const;

export type ItemStatuses = {[K in keyof typeof ITEM_STATUSES_DATA]: {level: OrBelow<(typeof ITEM_STATUSES_DATA)[K]["maxLevel"]>, equipped: boolean}};
export type ConsummableCounts = {[K in keyof typeof CONSUMMABLE_COUNTS_DATA]: number};
export type BadgeStatuses = {[K in keyof typeof BADGE_STATUSES_DATA]: (typeof BADGE_STATUSES)[number]};
export type StrengthCounts = {[K in keyof typeof STRENGTH_COUNTS_DATA]: number};
export type BossStatuses = {[K in keyof typeof BOSS_STATUSES_DATA]: {rank: BossStatusesHelper<K, "offset">, specialRank: BossStatusesHelper<K, "specialOffset">, order: number | null}};
export type Save = {[K in keyof typeof DATA]: ReturnType<(typeof DATA)[K]["converter"]>};

type BossStatusesHelper<K extends keyof typeof BOSS_STATUSES_DATA, L extends "offset" | "specialOffset"> = (typeof BOSS_STATUSES_DATA)[K][L] extends null ? null : (typeof RANKS)[number];
type Converter<T> = (buffer: Buffer, offset: number) => T;