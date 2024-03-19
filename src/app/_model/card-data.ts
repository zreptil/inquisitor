import {BaseData} from '@/_model/base-data';

export class CardData extends BaseData {
  type: string;
  front: string;
  back: string;
  face = 'front';
  labels: string[] = [];
  colorBack: string;
  colorFore: string;

  override get asJson(): any {
    return {
      t: this.type,
      f: this.front,
      b: this.back,
      l: this.labels,
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
    this.front = json.f;
    this.back = json.b;
    this.labels = json.l ?? [];
    this.colorBack = json.cb;
    this.colorFore = json.cf;
  }

  hasCategory(value: string): boolean {
    return this.labels.includes(value);
  }
}
