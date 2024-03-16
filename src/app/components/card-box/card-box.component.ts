import {Component, OnInit} from '@angular/core';
import {CardData} from '@/_model/card-data';
import {GLOBALS} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-card-box',
  templateUrl: './card-box.component.html',
  styleUrl: './card-box.component.scss',
})
export class CardBoxComponent implements OnInit {
  cardIdx: number;

  // https://drive.google.com/file/d/1cdrsvc9mzF2hjalFwjWqxXYr2RXmr2Oa/view?usp=drive_link
  // https://quizlet.com/de/894105546/das-sonnensystem-flash-cards/
  constructor(public ms: MessageService) {
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

  ngOnInit() {
    this.cardIdx = GLOBALS.cardList.length > 0 ? 0 : null;
  }

  addCard() {
    const card = new CardData();
    card.categories.push('Standard');
    if (GLOBALS.cardList.length === 0) {
      card.question = $localize`What do you want to know?`;
      card.answer = $localize`Everything!`;
    } else {
      card.question = $localize`Question`;
      card.answer = $localize`Answer`;
    }
    GLOBALS.cardList.push(card);
    this.cardIdx = GLOBALS.cardList.length - 1;
    this.cardConfig.extractCategories(GLOBALS.cardList);
  }

  clickPrev(evt: MouseEvent) {
    evt.stopPropagation();
    this.cardIdx = Math.max(0, this.cardIdx - 1);
  }

  clickNext(evt: MouseEvent) {
    evt.stopPropagation();
    this.cardIdx = Math.min(GLOBALS.cardList.length - 1, this.cardIdx + 1);
  }
}
