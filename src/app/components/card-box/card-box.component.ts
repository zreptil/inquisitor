import {Component} from '@angular/core';
import {CardData} from '@/_model/card-data';
import {GLOBALS} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-card-box',
  templateUrl: './card-box.component.html',
  styleUrl: './card-box.component.scss',
})
export class CardBoxComponent {
  cardIdx: number;

  constructor(public ms: MessageService) {
    this.addCard();
  }

  get currentCard(): CardData {
    return this.cardIdx == null ? null : GLOBALS.cardList[this.cardIdx];
  }

  get cardConfig() {
    return GLOBALS.cardConfig;
  }

  get hasPrevCard(): boolean {
    return this.cardIdx > 0;
  }

  get hasNextCard(): boolean {
    return this.cardIdx < GLOBALS.cardList.length - 1;
  }

  get currCat(): string {
    return Utils.join(this.currentCard?.categories, ', ');
  }

  set currCat(value: string) {
    this.currentCard.categories.splice(0, this.currentCard.categories.length);
    this.currentCard.categories.push(...(value?.split(',') ?? []));
  }

  addCard() {
    const card = new CardData();
    card.categories.push('Standard');
    card.question = 'Wer weiss denn sowas?';
    card.answer = 'Keine alte Sau!';
    GLOBALS.cardList.push(card);
    this.cardIdx = GLOBALS.cardList.length - 1;
    this.cardConfig.extractCategories(GLOBALS.cardList);
  }
}
