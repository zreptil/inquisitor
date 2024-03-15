import {ColorData} from '@/_model/color-data';
import {BaseData} from '@/_model/base-data';
import {CardData} from '@/_model/card-data';

export class CardType {
  key: string;
  name: string;
  color: ColorData;
}

export class CardConfig extends BaseData {
  categories: string[] = [];

  override get asJson(): any {
    throw new Error('Method not implemented.');
  }

  static fromJson(json: any): CardConfig {
    const ret = new CardConfig();
    ret.fillFromJson(json);
    return ret;
  }

  extractCategories(list: CardData[]): void {
    const ret: string[] = [];
    for (const card of list ?? []) {
      for (const cat of card.categories ?? []) {
        if (!ret.includes(cat)) {
          ret.push(cat);
        }
      }
    }
    for (let i = 0; i < 50; i++) {
      ret.push(`Eintrag ${i}`);
    }
    this.categories = ret;

  }

  override _fillFromJson(json: any, def?: any): void {
  }

}
