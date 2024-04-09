import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CardData} from '@/_model/card-data';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {CardPopupComponent} from '@/components/card-popup/card-popup.component';

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})
export class CardListComponent {
  editCard: CardData;
  editCardIdx: number;
  cardFace = 'front';

  constructor(public globals: GlobalsService,
              public ms: MessageService) {
  }

  get classForScroll(): any {
    const ret: any = {};
    ret['--gridCols'] = `${GLOBALS.cardConfig.gridColumns}`;
    return ret;
  }

  clickLabelColor(evt: MouseEvent, label: string) {
    evt?.stopPropagation();
    GLOBALS.changeLabelColor(label, null);
  }

  classForCard(_card: CardData): string[] {
    return ['card'];
  }

  styleForCard(card: CardData) {
    if (card != null && GLOBALS.cardConfig.showListColors) {
      return GLOBALS.styleForCard(card);
    }
    return card == null ? {
      backgroundColor: 'var(--mainHeadBack)',
      color: 'var(--mainHeadFore)'
    } : {
      backgroundColor: 'white',
      color: 'black'
    };
  }

  clickColors(evt: MouseEvent) {
    evt?.stopPropagation();
    GLOBALS.cardConfig.showListColors = !GLOBALS.cardConfig.showListColors
    GLOBALS.saveSharedData();
  }

  clickCard(evt: MouseEvent, card: CardData, idx: number) {
    GLOBALS.cardMode = 'edit';
    // this.editCard = card;
    // this.editCardIdx = idx;
    this.ms.showPopup(CardPopupComponent, 'card', {idx: idx});
  }

  clickDefault(): void {
    this.ms.confirm($localize`Reset all Questions / Answers to default and loose everything you entered?`)
      .subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          GLOBALS.cardMode = 'view';
          GLOBALS.loadSharedData(GLOBALS.defaultData);
//          this.cardIdx = 0;
//          this.initCards();
        }
      });
  }

  addCard() {
    const card = new CardData();
    card.labels.push('Standard');
    if (GLOBALS.cardList.length === 0) {
      card.front = $localize`What do you want to know?`;
      card.back = $localize`Everything!`;
    } else {
      card.front = $localize`Question`;
      card.back = $localize`Answer`;
    }
    GLOBALS.cardList.push(card);
//    this.cardIdx = GLOBALS.cardList.length - 1;
    GLOBALS.cardConfig.extractLabels(GLOBALS.cardList);
//    this.initCards();
  }

  clickFace(evt: MouseEvent) {
    evt.stopPropagation();
    const faceList = ['front', 'back'];
    this.cardFace = faceList.find(face => face !== this.cardFace);
  }

  clickGridInc(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.cardConfig.gridColumns = Math.min(10, GLOBALS.cardConfig.gridColumns + 1);
    GLOBALS.saveSharedData();
  }

  clickGridDec(evt: MouseEvent) {
    evt.stopPropagation();
    GLOBALS.cardConfig.gridColumns = Math.max(1, GLOBALS.cardConfig.gridColumns - 1);
    GLOBALS.saveSharedData();
  }
}
