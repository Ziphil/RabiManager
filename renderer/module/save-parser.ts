//

import {
  promises as fs
} from "fs";
import {
  Below,
  OrBelow
} from "../util/type";


export class SaveParser {

  private savePath: string;
  private imagePath: string;

  public constructor(savePath: string, imagePath: string) {
    this.savePath = savePath;
    this.imagePath = imagePath;
  }

  public async parse(): Promise<Save> {
    let buffer = await fs.readFile(this.savePath);
    let result = {} as any;
    for (let [key, spec] of Object.entries(DATA)) {
      let offset = spec.offset;
      let converter = spec.converter;
      result[key] = converter(buffer, offset);
    }
    result.savePath = this.savePath;
    result.imagePath = this.imagePath;
    return result;
  }

  public static itemStatuses(): Converter<ItemStatuses> {
    let converter = function (buffer: Buffer, _: number): ItemStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(ITEM_DATA)) {
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

  public static itemExpStatuses(): Converter<ItemExpStatuses> {
    let converter = function (buffer: Buffer, _: number): ItemExpStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(ITEM_EXP_DATA)) {
        let offset = spec.offset;
        let max = spec.max;
        let value = SaveParser.int()(buffer, offset);
        let proportion = value / max;
        result[key] = {value, proportion};
      }
      return result;
    };
    return converter;
  }

  public static consummableCounts(): Converter<ConsummableCounts> {
    let converter = function (buffer: Buffer, _: number): ConsummableCounts {
      let result = {} as any;
      for (let [key, spec] of Object.entries(CONSUMMABLE_DATA)) {
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
      for (let [key, spec] of Object.entries(BADGE_DATA)) {
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
      for (let [key, spec] of Object.entries(STRENGTH_DATA)) {
        let offset = spec.offset;
        result[key] = SaveParser.count(64)(buffer, offset);
      }
      return result;
    };
    return converter;
  }

  public static mapCompletionStatuses(): Converter<MapCompletionStatuses> {
    let converter = function (buffer: Buffer, _: number): MapCompletionStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(MAP_COMPLETION_DATA)) {
        let offset = spec.offset;
        let percent = SaveParser.int()(buffer, offset);
        let overallPercent = percent * spec.weight;
        result[key] = {percent, overallPercent};
      }
      return result;
    };
    return converter;
  }

  public static itemCompletionStatuses(): Converter<ItemCompletionStatuses> {
    let converter = function (buffer: Buffer, _: number): ItemCompletionStatuses {
      let result = {} as any;
      for (let [key, spec] of Object.entries(ITEM_COMPLETION_DATA)) {
        let offset = spec.offset;
        let count = SaveParser.int()(buffer, offset);
        let total = spec.total;
        let percent = (total !== 0) ? count / total * 100 : 0;
        result[key] = {count, total, percent};
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
      for (let [key, spec] of Object.entries(BOSS_DATA)) {
        let bossOffset = spec.offset;
        let bossSpecialOffset = spec.specialOffset;
        let bossCode = spec.code;
        let order = (orderCodes.indexOf(bossCode) >= 0) ? orderCodes.indexOf(bossCode) : null;
        let rank = (bossOffset !== null) ? {string: SaveParser.of(BOSS_RANK_STRINGS)(buffer, bossOffset), number: SaveParser.int()(buffer, bossOffset)} : null;
        let specialRank = (bossSpecialOffset !== null) ? {string: SaveParser.of(BOSS_RANK_STRINGS)(buffer, bossSpecialOffset), number: SaveParser.int()(buffer, bossSpecialOffset)} : null;
        result[key] = {order, rank, specialRank};
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


export const DIFFICULTIES = [
  "Casual", "Novice", "Normal", "Hard", "Hell", "Bunny Extinction"
] as const;
export const MAP_NAMES = [
  "Southern Woodland", "Weastern Coast", "Island Core", "Northern Tundra", "Eastern Highlands", "Rabi Rabi Town", "Plurkwood", "Subterranean Area", "Warp Destination", "System Interior"
] as const;
export const BOSS_RANK_STRINGS = [
  "E", "D", "C", "B", "A", "S", "SS", "SSS", "MAX"
] as const;
export const SPEEDRUN_MODES = [
  "Story", "Speedrun"
] as const;
export const GAME_MODES = [
  "Standard", "Alternative", "Bunny Heaven", "Bunny Hell"
] as const;
export const BADGE_STATUSES = [
  {obtained: false, equipped: false}, {obtained: true, equipped: false}, {obtained: true, equipped: true}
] as const;

export const ATTACK_ITEM_KEYS = [
  "pikoHammer", "carrotBomb", "bunnyAmulet", "superCarrot"
] as const;
export const SKILL_ITEM_KEYS = [
  "airJump", "rabiSlippers", "slidingPowder", "bunnyStrike", "wallJump", "airDash", "bunnyWhirl", "hammerRoll", "hammerWave", "speedBoost", "soulHeart", "spikeBarrier"
] as const;
export const ORB_ITEM_KEYS = [
  "fireOrb", "waterOrb", "natureOrb", "lightOrb"
] as const;
export const OTHER_ITEM_KEYS = [
  "hourglass", "strangeBox"
] as const;
export const MAGIC_ITEM_KEYS = [
  "ribbon", "sunnyBeam", "chaosRod", "healingStaff", "explodeShot", "carrotShooter"
] as const;
export const RIBBON_SKILL_ITEM_KEYS = [
  "quickBarrette", "maxBracelet", "chargeRing", "plusNecklace", "autoEarrings", "carrotBook", "pHairpin", "cyberFlower"
] as const;

export const ITEM_DATA = {
  pikoHammer: {offset: 0x7090, maxLevel: 3, name: "ピコハンマー"},
  carrotBomb: {offset: 0x709C, maxLevel: 3, name: "キャロットボム"},
  bunnyAmulet: {offset: 0x7110, maxLevel: 4, name: "バニーのお守り"},
  superCarrot: {offset: 0x711C, maxLevel: 3, name: "スーパーキャロット"},
  airJump: {offset: 0x7094, maxLevel: 1, name: "エアジャンプ"},
  rabiSlippers: {offset: 0x70B4, maxLevel: 1, name: "ラビスリッパー"},
  slidingPowder: {offset: 0x7098, maxLevel: 3, name: "スライディングパウダー"},
  bunnyStrike: {offset: 0x7100, maxLevel: 3, name: "バニーストライク"},
  wallJump: {offset: 0x7108, maxLevel: 3, name: "壁ジャンプ"},
  airDash: {offset: 0x70FC, maxLevel: 3, name: "エアダッシュ"},
  bunnyWhirl: {offset: 0x70B8, maxLevel: 3, name: "バニースピン"},
  hammerRoll: {offset: 0x70CC, maxLevel: 3, name: "ハンマーローリング"},
  hammerWave: {offset: 0x70C8, maxLevel: 3, name: "ハンマーウェーブ"},
  speedBoost: {offset: 0x70A4, maxLevel: 3, name: "スピードブースト"},
  soulHeart: {offset: 0x70B0, maxLevel: 1, name: "ソウルハート"},
  spikeBarrier: {offset: 0x710C, maxLevel: 3, name: "スパイクバリア"},
  hourglass: {offset: 0x70A0, maxLevel: 1, name: "砂時計"},
  strangeBox: {offset: 0x7104, maxLevel: 1, name: "変な箱"},
  fireOrb: {offset: 0x70D8, maxLevel: 3, name: "ファイヤーオーブ"},
  waterOrb: {offset: 0x70D4, maxLevel: 3, name: "ウォーターオーブ"},
  natureOrb: {offset: 0x70DC, maxLevel: 3, name: "ネイチャーオーブ"},
  lightOrb: {offset: 0x70D0, maxLevel: 3, name: "ライトオーブ"},
  ribbon: {offset: 0x70AC, maxLevel: 1, name: "リボン"},
  sunnyBeam: {offset: 0x70E4, maxLevel: 1, name: "サニービーム"},
  chaosRod: {offset: 0x70C4, maxLevel: 1, name: "ケイオスロッド"},
  healingStaff: {offset: 0x70F0, maxLevel: 1, name: "ヒーリングスタッフ"},
  explodeShot: {offset: 0x70F8, maxLevel: 1, name: "エクスプロージョンショット"},
  carrotShooter: {offset: 0x7118, maxLevel: 1, name: "キャロットシューター"},
  quickBarrette: {offset: 0x70BC, maxLevel: 1, name: "クイックヘアクリップ"},
  maxBracelet: {offset: 0x70F4, maxLevel: 1, name: "マックスブレスレット"},
  chargeRing: {offset: 0x7114, maxLevel: 3, name: "チャージリング"},
  plusNecklace: {offset: 0x70E8, maxLevel: 3, name: "プラスネックレス"},
  autoEarrings: {offset: 0x70A8, maxLevel: 3, name: "オートイヤリング"},
  carrotBook: {offset: 0x70C0, maxLevel: 1, name: "妖精の本"},
  pHairpin: {offset: 0x70E0, maxLevel: 3, name: "Pヘアピン"},
  cyberFlower: {offset: 0x70EC, maxLevel: 1, name: "サイバーフラワー"}
} as const;
export const ITEM_EXP_DATA = {
  pikoHammer: {offset: 0x9294, max: 7500},
  ribbon: {offset: 0x9298, max: 7000},
  carrotBomb: {offset: 0x929C, max: 500}
};
export const CONSUMMABLE_DATA = {
  rumiDonut: {offset: 0x7120, name: "ルミのドーナツ"},
  rumiCake: {offset: 0x7124, name: "ルミのケーキ"},
  goldCarrot: {offset: 0x7128, name: "ゴールドキャロット"},
  cocoaBomb: {offset: 0x712C, name: "ココアボム"}
} as const;
export const STRENGTH_DATA = {
  healthUp: {offset: 0x720C, name: "ヘルスアップ"},
  manaUp: {offset: 0x740C, name: "マナアップ"},
  regenUp: {offset: 0x750C, name: "リジェネアップ"},
  attackUp: {offset: 0x730C, name: "アタックアップ"},
  packUp: {offset: 0x760C, name: "バッジアップ"}
} as const;
export const BADGE_DATA = {
  healthPlus: {offset: 0x718C, name: "ヘルスプラス"},
  healthSurge: {offset: 0x7190, name: "ヘルスサージ"},
  manaPlus: {offset: 0x7194, name: "マナプラス"},
  manaSurge: {offset: 0x7198, name: "マナサージ"},
  crisisBoost: {offset: 0x719C, name: "クライシスブースト"},
  attackGrow: {offset: 0x71A0, name: "攻撃強化"},
  defenceGrow: {offset: 0x71A4, name: "防御強化"},
  attackTrade: {offset: 0x71A8, name: "Oコンバート"},
  defenceTrade: {offset: 0x71AC, name: "Dコンバート"},
  armStrength: {offset: 0x71B0, name: "ハンマーブースト"},
  carrotBoost: {offset: 0x71B4, name: "キャロットブースト"},
  weaken: {offset: 0x71B8, name: "ピアス"},
  selfDefense: {offset: 0x71BC, name: "アンチピアス"},
  armored: {offset: 0x71C0, name: "スーパーアーマー"},
  luckySeven: {offset: 0x71C4, name: "ラッキーセブン"},
  hexCancel: {offset: 0x71C8, name: "ヘックスキャンセル"},
  pureLove: {offset: 0x71CC, name: "ユリバッジ"},
  toxicStrike: {offset: 0x71D0, name: "ポイズンヒット"},
  frameCancel: {offset: 0x71D4, name: "レバーキャンセル"},
  healthWager: {offset: 0x71D8, name: "ヘルスコンバート"},
  manaWager: {offset: 0x71DC, name: "マナコンバート"},
  staminaPlus: {offset: 0x71E0, name: "スタミナプラス"},
  blessed: {offset: 0x71E4, name: "お守り強化"},
  hitboxDown: {offset: 0x71E8, name: "ヒットボックスダウン"},
  cashback: {offset: 0x71EC, name: "ENアップ"},
  survival: {offset: 0x71F0, name: "根性"},
  topForm: {offset: 0x71F4, name: "イミュニティR"},
  toughSkin: {offset: 0x71F8, name: "イミュニティG"},
  erinaBadge: {offset: 0x71FC, name: "エリナバッジ"},
  ribbonBadge: {offset: 0x7200, name: "リボンバッジ"},
  autoTrigger: {offset: 0x7204, name: "オートボム"},
  lilithGift: {offset: 0x7208, name: "リリスのプレゼント"}
} as const;
export const MAP_COMPLETION_DATA = {
  woodland: {offset: 0x80CC, weight: 16 / 130},
  coast: {offset: 0x80D0, weight: 16 / 130},
  core: {offset: 0x80D4, weight: 16 / 130},
  tundra: {offset: 0x80D8, weight: 16 / 130},
  highlands: {offset: 0x80DC, weight: 16 / 130},
  town: {offset: 0x80E0, weight: 1 / 130},
  plurkwood: {offset: 0x80E4, weight: 16 / 130},
  subterranean: {offset: 0x80E8, weight: 16 / 130},
  destination: {offset: 0x80EC, weight: 1 / 130},
  system: {offset: 0x80F0, weight: 16 / 130}
} as const;
export const ITEM_COMPLETION_DATA = {
  woodland: {offset: 0x99BC, total: 30},
  coast: {offset: 0x99C4, total: 33},
  core: {offset: 0x99CC, total: 25},
  tundra: {offset: 0x99D4, total: 26},
  highlands: {offset: 0x99DC, total: 31},
  town: {offset: 0x99E4, total: 2},
  plurkwood: {offset: 0x99EC, total: 0},
  subterranean: {offset: 0x99F4, total: 5},
  destination: {offset: 0x99FC, total: 0},
  system: {offset: 0x9A04, total: 7}
} as const;
export const BOSS_DATA = {
  rumi: {offset: 0x81BC, specialOffset: null, code: 0x01, name: "ルミ"},
  rita: {offset: 0x81C0, specialOffset: null, code: 0x02, name: "リタ"},
  nieve: {offset: 0x81C4, specialOffset: null, code: 0x03, name: "ニエベ"},
  nixie: {offset: 0x81C8, specialOffset: null, code: 0x04, name: "ニクシー"},
  aruraune: {offset: 0x81CC, specialOffset: null, code: 0x05, name: "アルルーナ"},
  pandora: {offset: 0x81D0, specialOffset: null, code: 0x06, name: "パンドラ"},
  irisu: {offset: 0x81D4, specialOffset: null, code: 0x07, name: "イリス"},
  saya: {offset: 0x81D8, specialOffset: null, code: 0x08, name: "サヤ"},
  cicini: {offset: 0x81DC, specialOffset: null, code: 0x09, name: "シシニ"},
  syaro: {offset: 0x81E0, specialOffset: null, code: 0x0A, name: "シャロ"},
  cocoa: {offset: 0x81E4, specialOffset: 0x9A58, code: 0x0B, name: "ココア"},
  ashuri: {offset: 0x81E8, specialOffset: 0x9A5C, code: 0x0C, name: "アシュリー"},
  lilith: {offset: 0x81EC, specialOffset: null, code: 0x0D, name: "リリス"},
  vanilla: {offset: 0x81F0, specialOffset: null, code: 0x0E, name: "バニラ"},
  chocolate: {offset: 0x81F4, specialOffset: null, code: 0x0F, name: "チョコレート"},
  kotri: {offset: 0x81F8, specialOffset: null, code: 0x10, name: "コトリ"},
  kekeBunny: {offset: 0x81FC, specialOffset: null, code: 0x11, name: "ケケバニー"},
  seana: {offset: 0x8200, specialOffset: null, code: 0x12, name: "シーナ"},
  miriam: {offset: 0x8204, specialOffset: null, code: 0x13, name: "ミリアム"},
  miru: {offset: 0x8208, specialOffset: null, code: 0x14, name: "ミル"},
  noah: {offset: 0x820C, specialOffset: null, code: 0x15, name: "ノア"},
  erinoah: {offset: 0x8230, specialOffset: null, code: 0x1E, name: "???"},
  erina: {offset: null, specialOffset: null, code: 0x1F, name: "エリナ"},
  ribbon: {offset: null, specialOffset: 0x9A94, code: 0x1A, name: "リボン"}
} as const;
export const DATA = {
  itemStatuses: {offset: -1, converter: SaveParser.itemStatuses()},
  itemExpStatuses: {offset: -1, converter: SaveParser.itemExpStatuses()},
  consummableCounts: {offset: -1, converter: SaveParser.consummableCounts()},
  strengthCounts: {offset: -1, converter: SaveParser.strengthCounts()},
  badgeStatuses: {offset: -1, converter: SaveParser.badgeStatuses()},
  mapCompletionStatuses: {offset: -1, converter: SaveParser.mapCompletionStatuses()},
  itemCompletionStatuses: {offset: -1, converter: SaveParser.itemCompletionStatuses()},
  bossStatuses: {offset: 0x95C4, converter: SaveParser.bossStatuses()},
  x: {offset: 0x7084, converter: SaveParser.int()},
  y: {offset: 0x7088, converter: SaveParser.int()},
  hp: {offset: 0x80A0, converter: SaveParser.int()},
  mp: {offset: 0x80C0, converter: SaveParser.int()},
  enAmount: {offset: 0x92AC, converter: SaveParser.int()},
  magicColor: {offset: 0x9948, converter: SaveParser.int()},
  takenDamage: {offset: 0x80C8, converter: SaveParser.int()},
  takenSpikeDamage: {offset: 0x9958, converter: SaveParser.int()},
  dealtDamage: {offset: 0x99AC, converter: SaveParser.int()},
  healedHp: {offset: 0x99B0, converter: SaveParser.int()},
  mapPercentRounded: {offset: 0x9B1C, converter: SaveParser.int()},
  itemPercentRounded: {offset: 0x9B18, converter: SaveParser.int()},
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

export type ItemData = typeof ITEM_DATA;
export type ItemExpData = typeof ITEM_EXP_DATA;
export type ConsummableData = typeof CONSUMMABLE_DATA;
export type StrengthData = typeof STRENGTH_DATA;
export type BadgeData = typeof BADGE_DATA;
export type MapCompletionData = typeof MAP_COMPLETION_DATA;
export type ItemCompletionData = typeof ITEM_COMPLETION_DATA;
export type BossData = typeof BOSS_DATA;

export type ItemStatuses = {[K in keyof ItemData]: {level: OrBelow<ItemData[K]["maxLevel"]>, equipped: boolean}};
export type ItemExpStatuses = {[K in keyof ItemExpData]: {value: number, proportion: number}};
export type ConsummableCounts = {[K in keyof ConsummableData]: number};
export type StrengthCounts = {[K in keyof StrengthData]: number};
export type BadgeStatuses = {[K in keyof BadgeData]: (typeof BADGE_STATUSES)[number]};
export type MapCompletionStatuses = {[K in keyof MapCompletionData]: {percent: number, overallPercent: number}};
export type ItemCompletionStatuses = {[K in keyof ItemCompletionData]: {count: number, total: number, percent: number}};
export type BossStatuses = {[K in keyof BossData]: {order: number | null, rank: BossRank<K>, specialRank: BossSpecialRank<K>}};

type BossRank<K extends keyof BossData> = BossData[K]["offset"] extends null ? null : {string: (typeof BOSS_RANK_STRINGS)[number], number: Below<(typeof BOSS_RANK_STRINGS)["length"]>};
type BossSpecialRank<K extends keyof BossData> = BossData[K]["specialOffset"] extends null ? null : {string: (typeof BOSS_RANK_STRINGS)[number], number: Below<(typeof BOSS_RANK_STRINGS)["length"]>};

type Converter<T> = (buffer: Buffer, offset: number) => T;


export class SaveExtension {

  private constructor(save: Save) {
    Object.assign(this, save);
  }

  public static extend(save: Save): Save & SaveExtension {
    let extendedSave = new SaveExtension(save);
    return extendedSave as any;
  }

  private createTimeString(time: number): string {
    let hour = Math.floor(time / 60 / 60 / 60);
    let minute = Math.floor(time / 60 / 60) % 60;
    let second = Math.floor(time / 60) % 60;
    let string = "";
    if (hour > 0) {
      string += hour;
      string += ":";
    }
    if (minute > 0) {
      string += (hour > 0) ? ("0" + minute).slice(-2) : minute;
      string += ":";
    }
    string += (hour > 0 || minute > 0) ? ("0" + second).slice(-2) : second;
    return string;
  }

  public get playTimeString(this: ExtendedSave): string {
    return this.createTimeString(this.playTime);
  }

  public get runTimeString(this: ExtendedSave): string {
    return this.createTimeString(this.runTime);
  }

  public get totalPlayTimeString(this: ExtendedSave): string {
    return this.createTimeString(this.totalPlayTime);
  }

  public get totalRunTimeString(this: ExtendedSave): string {
    return this.createTimeString(this.totalRunTime);
  }

  public get townMemberCount(this: ExtendedSave): number {
    let statuses = this.bossStatuses;
    let count = 0;
    for (let [key, status] of Object.entries(statuses)) {
      if (status.order !== null) {
        count ++;
      }
    }
    return count;
  }

  public get mapPercent(this: ExtendedSave): number {
    let percent = 0;
    for (let [key, status] of Object.entries(MAP_COMPLETION_DATA)) {
      percent += this.mapCompletionStatuses[key].overallPercent;
    }
    return percent;
  }

  public get itemPercent(this: ExtendedSave): number {
    let count = 0;
    let total = 0;
    for (let [key, status] of Object.entries(ITEM_COMPLETION_DATA)) {
      count += this.itemCompletionStatuses[key].count;
      total += this.itemCompletionStatuses[key].total;
    }
    let percent = count / total * 100;
    return percent;
  }

}


export type Save = {[K in keyof typeof DATA]: ReturnType<(typeof DATA)[K]["converter"]>} & {savePath: string, imagePath: string};
export type ExtendedSave = Save & SaveExtension;