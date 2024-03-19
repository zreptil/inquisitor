import {ColorData} from '@/_model/color-data';
import {BaseData} from '@/_model/base-data';
import {CardData} from '@/_model/card-data';

export class CardType {
  key: string;
  name: string;
  color: ColorData;
}

export class LabelColors {
  constructor(public back: string,
              public fore: string) {

  }
}

export class CardConfig extends BaseData {
  labels: string[] = [];
  labelColors: { [key: string]: LabelColors } = {};

  override get asJson(): any {
    const lc: any = {};
    for (const key of Object.keys(this.labelColors)) {
      lc[key] = {b: this.labelColors[key].back, f: this.labelColors[key].fore};
    }
    return {
      l: this.labels,
      lc: lc
    };
  }

  static fromJson(json: any): CardConfig {
    const ret = new CardConfig();
    ret.fillFromJson(json);
    return ret;
  }

  extractLabels(list: CardData[]): void {
    const ret: string[] = [];
    for (const card of list ?? []) {
      for (const cat of card.labels ?? []) {
        if (!ret.includes(cat)) {
          ret.push(cat);
        }
      }
    }
    this.labels = ret;
  }

  override _fillFromJson(json: any, def?: any): void {
    this.labelColors = {};
    for (const key of Object.keys(json.lc ?? {})) {
      this.labelColors[key] = new LabelColors(json.lc[key].b, json.lc[key].f);
    }
  }
}
