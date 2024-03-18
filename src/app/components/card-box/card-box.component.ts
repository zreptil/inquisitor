import {Component, HostListener, OnInit} from '@angular/core';
import {CardData} from '@/_model/card-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DialogResultButton} from '@/_model/dialog-data';

// https://3dtransforms.desandro.com/carousel
@Component({
  selector: 'app-card-box',
  templateUrl: './card-box.component.html',
  styleUrl: './card-box.component.scss',
  animations: [
    trigger('move', [
      state('next', style({
        transform: 'translateX(-100%)'
      })),
      state('prev', style({
        transform: 'translateX(100%)'
      })),
      transition('current => next', animate('1000ms ease-out')),
      transition('current => prev', animate('1000ms ease-in'))
    ])
  ]
})
export class CardBoxComponent implements OnInit {
  cardIdx: number;
  moveTrigger = 'current';

  // https://drive.google.com/file/d/1cdrsvc9mzF2hjalFwjWqxXYr2RXmr2Oa/view?usp=drive_link
  theta = 0;
  radius = 0;

  // https://quizlet.com/de/894105546/das-sonnensystem-flash-cards/
  constructor(public ms: MessageService,
              public globals: GlobalsService) {
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
    this.initCards();
  }

  addCard() {
    const card = new CardData();
    card.categories.push('Standard');
    if (GLOBALS.cardList.length === 0) {
      card.front = $localize`What do you want to know?`;
      card.back = $localize`Everything!`;
    } else {
      card.front = $localize`Question`;
      card.back = $localize`Answer`;
    }
    GLOBALS.cardList.push(card);
    this.cardIdx = GLOBALS.cardList.length - 1;
    this.cardConfig.extractCategories(GLOBALS.cardList);
    this.initCards();
  }

  clickPrev(evt: MouseEvent) {
    evt?.stopPropagation();
    this.cardIdx = Math.max(0, this.cardIdx - 1);
    //this.moveTrigger = 'prev';
  }

  clickNext(evt: MouseEvent) {
    evt?.stopPropagation();
    this.cardIdx = Math.min(GLOBALS.cardList.length - 1, this.cardIdx + 1);
//    this.moveTrigger = 'next';
  }

  initCards(): void {
    const cellCount = GLOBALS.cardList.length;
    const cellSize = window.innerWidth * 0.8;
    this.theta = 360 / cellCount;
    this.radius = Math.round((cellSize / 2) / Math.tan(Math.PI / cellCount));
  }

  styleForGroup(): any {
    const angle = this.theta * this.cardIdx * -1;
    const ret: any = {
      transform: `translateZ(${-this.radius}px)rotateY(${angle}deg)`
    };
    return ret;
  }

  styleForCard(idx: number): any {
    return {
      transform: `rotateY(${this.theta * idx}deg) translateZ(${this.radius}px)`
    };
  }

  clickDefault(): void {
    this.ms.confirm($localize`Reset all Questions / Answers to default and loose everything you entered?`)
      .subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          const list = [];
          for (const card of GLOBALS.getDefaultCards()) {
            list.push(CardData.fromJson(card));
          }
          GLOBALS.cardList.splice(0, GLOBALS.cardList.length);
          GLOBALS.cardList.push(...list);
          this.cardIdx = 0;
          this.initCards();
        }
      });
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowLeft':
        this.clickPrev(null);
        break;
      case 'ArrowRight':
        this.clickNext(null);
        break;
      default:
        console.log(event.code);
    }
  }
}
