import {BaseData} from '@/_model/base-data';

export class CardData extends BaseData {
  type: string;
  question: string;
  answer: string;

  override get asJson(): any {
    return {
      t: this.type,
      q: this.question,
      a: this.answer,
      c: this.categories
    };
  }

  private _categories: string[] = [];

  public get categories(): string[] {
    return this._categories;
  }

  override _fillFromJson(json: any, def?: any): void {
    this.type = json.t;
    this.question = json.q ?? '!';
    this.answer = json.a ?? '?';
    this._categories = json.c ?? [];
  }

  hasCategory(value: string): boolean {
    return this.categories.includes(value);
  }
}
