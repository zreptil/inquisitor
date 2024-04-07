import {ColorData} from '@/_model/color-data';
import {BaseData} from '@/_model/base-data';
import {CardData} from '@/_model/card-data';

export class CardType {
  key: string;
  name: string;
  color: ColorData;
}

export class LabelData {
  constructor(public back: string,
              public fore: string) {

  }
}

export class CardConfig extends BaseData {
  labels: string[] = [];
  labelData: { [key: string]: LabelData } = {};

  override get asJson(): any {
    const lc: any = {};
    for (const key of Object.keys(this.labelData)) {
      lc[key] = {b: this.labelData[key].back, f: this.labelData[key].fore};
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
    this.labelData = {};
    for (const key of Object.keys(json.lc ?? {})) {
      this.labelData[key] = new LabelData(json.lc[key].b, json.lc[key].f);
    }
  }
}
