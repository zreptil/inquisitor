import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CardData} from '@/_model/card-data';
import {GLOBALS} from '@/_services/globals.service';
import {DialogResultButton, DialogType, IDialogDef} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';
import {Editor, Toolbar, Validators} from 'ngx-editor';
import {FormControl, FormGroup} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  animations: [
    trigger('flipState', [
      state('back', style({
        transform: 'rotateX(180deg)'
      })),
      state('front', style({
        transform: 'rotateX(0)'
      })),
      transition('front => back', animate('1000ms ease-out')),
      transition('back => front', animate('1000ms ease-in'))
    ])
  ]
})
export class CardComponent implements OnInit, OnDestroy {
  @Input()
  cardIdx: number;
  @Input()
  active = false;
  mode = 'view';
  @Input()
  cardFace = 'front';
  orgCard: any;
  editor: Editor;
  toolbar: Toolbar = [
    [{heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']}],
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['text_color', 'background_color'],
    // ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  form = new FormGroup({
    edit: new FormControl('', Validators.required()),
    cardFace: new FormControl('front', Validators.required()),
  });

  constructor(public ms: MessageService,
              public sanitizer: DomSanitizer) {
  }

  get cardConfig() {
    return GLOBALS.cardConfig;
  }

  get currentCard(): CardData {
    return this.cardIdx == null ? null : GLOBALS.cardList[this.cardIdx];
  }

  // make sure to destory the editor
  get dataForEdit(): any {
    if (this.cardFace === 'front') {
      return {t: $localize`Question`, n: 'front', p: $localize`Question`};
    }
    return {t: $localize`Answer`, n: 'back', p: $localize`Answer`};
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  isMode(check: string) {
    return this.mode === check && this.currentCard != null;
  }

  clickSave(evt: MouseEvent) {
    if (this.currentCard != null) {
      (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
    }
    evt.stopPropagation();
    this.mode = 'view';
    GLOBALS.saveSharedData();
  }

  clickCancel(evt: MouseEvent) {
    evt.stopPropagation();
    (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
    if (this.currentCard.asString !== JSON.stringify(this.orgCard)) {
      this.ms.confirm($localize`Do you really want to discard the changes?`)
        .subscribe(result => {
          if (result?.btn === DialogResultButton.yes) {
            this.currentCard?.fillFromJson(this.orgCard);
            this.mode = 'view';
          }
        });
    } else {
      this.currentCard?.fillFromJson(this.orgCard);
      this.mode = 'view';
    }
  }

  clickEdit(evt: MouseEvent) {
    evt?.stopPropagation();
    this.form.controls.edit.setValue((this.currentCard as any)?.[this.cardFace]);
    this.form.controls.cardFace.setValue(this.cardFace);
    this.orgCard = this.currentCard.asJson;
    this.mode = 'edit';
    this.activateEdit();
  }

  activateEdit(): void {
    setTimeout(() => {
      this.editor.commands
        .focus('start')
        .scrollIntoView()
        .exec();
    });
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

  cardText(cardClass: string): SafeHtml {
    switch (cardClass) {
      case 'front':
        return this.sanitizer.bypassSecurityTrustHtml(this.currentCard?.front);
      case 'back':
        return this.sanitizer.bypassSecurityTrustHtml(this.currentCard?.back);
    }
    return '???';
  }

  clickQuestion(evt: MouseEvent) {
    evt.stopPropagation();
  }

  clickAnswer(evt: MouseEvent) {
    evt.stopPropagation();
  }

  clickDelete(evt: MouseEvent) {
    evt.stopPropagation();
    this.ms.confirm($localize`This will delete the card. Are you sure?`).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        GLOBALS.cardList.splice(this.cardIdx, 1);
      }
    });
  }

  clickEditChange(evt: MouseEvent, type: string) {

  }

  onCardFaceChange(evt: any) {
    (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
    this.cardFace = this.form.controls.cardFace.value;
    this.form.controls.edit.setValue((this.currentCard as any)[this.cardFace]);
    this.activateEdit();
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'Space':
      case 'ArrowUp':
      case 'ArrowDown':
        this.turnCard();
        break;
    }
  }
}
