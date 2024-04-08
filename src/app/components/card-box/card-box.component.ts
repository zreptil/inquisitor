import {Component, HostListener, OnInit} from '@angular/core';
import {CardData} from '@/_model/card-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';
import {MatChipListboxChange} from '@angular/material/chips';

// https://3dtransforms.desandro.com/carousel
@Component({
  selector: 'app-card-box',
  templateUrl: './card-box.component.html',
  styleUrl: './card-box.component.scss',
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
    return GLOBALS.cardMode === 'edit' ? false : this.cardIdx > 0;
  }

  get hasNextCard(): boolean {
    return GLOBALS.cardMode === 'edit' ? false : this.cardIdx < GLOBALS.cardList.length - 1;
  }

  get currCat(): string {
    return Utils.join(this.currentCard?.labels, ', ');
  }

  set currCat(value: string) {
    this.currentCard.labels.splice(0, this.currentCard.labels.length);
    this.currentCard.labels.push(...(value?.split(',') ?? []));
  }

  ngOnInit() {
    this.cardIdx = GLOBALS.cardList.length > 0 ? 0 : null;
    this.initCards();
  }

  clickPrev(evt: MouseEvent) {
    evt?.stopPropagation();
    this.resetAllFaces();
    this.cardIdx = Math.max(0, this.cardIdx - 1);
    //this.moveTrigger = 'prev';
  }

  clickNext(evt: MouseEvent) {
    evt?.stopPropagation();
    this.resetAllFaces();
    this.cardIdx = Math.min(GLOBALS.cardList.length - 1, this.cardIdx + 1);
//    this.moveTrigger = 'next';
  }

  resetAllFaces(): void {
    for (const card of GLOBALS.cardList) {
      card.face = 'front';
    }
  }

  initCards(): void {
    const cellCount = GLOBALS.cardList.length;
    const cellSize = window.innerWidth;
    this.theta = 360 / cellCount;
    this.radius = Math.round((cellSize / 2) / Math.tan(Math.PI / cellCount));
  }

  styleForGroup(): any {
    const angle = this.theta * this.cardIdx * -1;
    return {
      transform: `translateZ(${-this.radius}px)rotateY(${angle}deg)`
    };
  }

  styleForCard(idx: number): any {
    return {
      transform: `rotateY(${this.theta * idx}deg) translateZ(${this.radius}px)`
    };
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (GLOBALS.cardMode !== 'edit') {
      switch (event.code) {
        case 'ArrowLeft':
          this.clickPrev(null);
          break;
        case 'ArrowRight':
          this.clickNext(null);
          break;
      }
    }
  }

  onChangeLabels(evt: MatChipListboxChange) {
    GLOBALS.onChangeLabels(evt);
    this.cardIdx = 0;
  }

  clickLabelEdit(evt: MouseEvent, label: string) {
    evt?.stopPropagation();
    GLOBALS.editLabel(null, label);
  }
}
