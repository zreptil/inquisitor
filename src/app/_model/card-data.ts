import {BaseData} from '@/_model/base-data';

export class CardData extends BaseData {
  type: string;
  front: string;
  back: string;
  face = 'front';
  categories: string[] = [];
  colorBack: string;
  colorFore: string;

  override get asJson(): any {
    return {
      t: this.type,
      q: this.front,
      a: this.back,
      c: this.categories,
      cb: this.colorBack,
      cf: this.colorFore
    };
  }

  static fromJson(json: any, def?: CardData): CardData {
    const ret = new CardData();
    ret.fillFromJson(json, def);
    return ret;
  }

  override _fillFromJson(json: any, def?: any): void {
    this.type = json.t;
    this.front = json.q;
    this.back = json.a;
    this.categories = json.c ?? [];
    this.colorBack = json.cb;
    this.colorFore = json.cf;
  }

  hasCategory(value: string): boolean {
    return this.categories.includes(value);
  }
}
