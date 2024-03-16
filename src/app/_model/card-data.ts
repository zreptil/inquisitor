import {BaseData} from '@/_model/base-data';

export class CardData extends BaseData {
  type: string;
  question: string;
  answer: string;
  categories: string[] = [];

  override get asJson(): any {
    return {
      t: this.type,
      q: this.question,
      a: this.answer,
      c: this.categories
    };
  }

  static fromJson(json: any, def?: CardData): CardData {
    const ret = new CardData();
    ret.fillFromJson(json, def);
    return ret;
  }

  override _fillFromJson(json: any, def?: any): void {
    console.log('json', json);
    this.type = json.t;
    this.question = json.q;
    this.answer = json.a;
    this.categories = json.c ?? [];
  }

  hasCategory(value: string): boolean {
    return this.categories.includes(value);
  }
}
