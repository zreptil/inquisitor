import {Component, Input} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CardData} from '@/_model/card-data';
import {GLOBALS} from '@/_services/globals.service';
import {DialogType, IDialogDef} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  animations: [
    trigger('flipState', [
      state('back', style({
        transform: 'rotateX(179deg)'
      })),
      state('front', style({
        transform: 'rotateX(0)'
      })),
      transition('front => back', animate('1000ms ease-out')),
      transition('back => front', animate('1000ms ease-in'))
    ])
  ]
})
export class CardComponent {
  @Input()
  cardIdx: number;
  mode = 'view';
  cardFace = 'front';
  orgCard: any;

  constructor(public ms: MessageService) {
  }

  get cardConfig() {
    return GLOBALS.cardConfig;
  }

  get currentCard(): CardData {
    return this.cardIdx == null ? null : GLOBALS.cardList[this.cardIdx];
  }

  isMode(check: string) {
    return this.mode === check && this.currentCard != null;
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    this.cardFace = 'front';
    this.mode = 'view';
  }

  clickCancel(evt: MouseEvent) {
    evt.stopPropagation();
    this.currentCard?.fillFromJson(this.orgCard);
    this.cardFace = 'front';
    this.mode = 'view';
  }

  clickEdit(evt: MouseEvent) {
    evt?.stopPropagation();
    this.orgCard = this.currentCard.asJson;
    this.mode = 'edit';
  }

  turnCard() {
    this.cardFace = (this.cardFace === 'back') ? 'front' : 'back';
  }

  addCategory(evt: Event) {
    evt.stopPropagation();
    const def: IDialogDef = {
      title: $localize`Enter new category`,
      type: DialogType.info,
      controls: [{type: 'input', title: null, id: 'name', autofocus: true}],
      buttons: [
        {title: $localize`Cancel`, icon: 'cancel', result: {btn: 'cancel'}},
        {title: $localize`Save`, icon: 'save', result: {btn: 'save'}, focus: true}]
    };
    this.ms.showDialog(def, 'Name of category').subscribe(result => {
      if (result?.btn === 'save') {
        const cat = result.data.controls.name.value;
        if (!this.currentCard.categories.includes(cat)) {
          this.currentCard.categories.push(cat)
        }
        this.cardConfig.extractCategories(GLOBALS.cardList);
      }
    });
  }

  removeCategory(cat: string) {
    const idx = this.currentCard.categories.indexOf(cat);
    if (idx >= 0) {
      this.currentCard.categories.splice(idx, 1);
    }
  }

  cardText(cardClass: string): string {
    switch (cardClass) {
      case 'front':
        return this.currentCard?.question;
      case 'back':
        return this.currentCard?.answer;
    }
    return '???';
  }
}
