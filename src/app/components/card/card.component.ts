import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {CardData} from '@/_model/card-data';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';
import {Editor, Toolbar, Validators} from 'ngx-editor';
import {FormControl, FormGroup} from '@angular/forms';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';
import {ThemeService} from '@/_services/theme.service';
import {CardPopupComponent} from '@/components/card-popup/card-popup.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit, OnDestroy {
  @Input()
  cardIdx: number;
  @Input()
  active = false;
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
  @Input()
  editWithoutColors = false;

  constructor(public ms: MessageService,
              public ts: ThemeService,
              public globals: GlobalsService) {
  }

  get cardFace(): string {
    return this.currentCard?.face;
  }

  set cardFace(value: string) {
    if (this.currentCard != null) {
      this.currentCard.face = value;
    }
  }

  get cardLabels(): string[] {
    return this.currentCard?.labels;
  }

  get configLabels(): string[] {
    const ret = GLOBALS.cardConfig.labels;
    return ret.filter(l => !this.cardLabels.includes(l));
  }

  get cardConfig() {
    return GLOBALS.cardConfig;
  }

  get currentCard(): CardData {
    return this.cardIdx == null ? null : GLOBALS.cardList[this.cardIdx];
  }

  get styleForCard(): any {
    if (GLOBALS.cardMode === 'edit' && this.editWithoutColors) {
      return {
        backgroundColor: 'white',
        color: 'black'
      };
    }
    return GLOBALS.styleForCard(this.currentCard);
  }

  get dataForEdit(): any {
    if (this.cardFace === 'front') {
      return {t: $localize`Question`, n: 'front', p: $localize`Question`};
    }
    return {t: $localize`Answer`, n: 'back', p: $localize`Answer`};
  }

  // make sure to destory the editor
  get hasEditor(): boolean {
    return this.cardFace === 'front' || this.cardFace === 'back';
  }

  get styleForForm(): any {
    const color = {
      b: this.currentCard.colorBack ?? 'white',
      f: this.currentCard.colorFore ?? 'black'
    };
    if (this.editWithoutColors) {
      color.b = 'white';
      color.f = 'black';
    }
    return {
      '--mat-standard-button-toggle-text-color': color.f,
      '--mat-standard-button-toggle-background-color': color.b,
      '--mat-standard-button-toggle-state-layer-color': color.f,
      '--mat-standard-button-toggle-selected-state-background-color': color.f,
      '--mat-standard-button-toggle-selected-state-text-color': color.b,
      '--mat-standard-button-toggle-divider-color': color.f,
      '--mdc-chip-elevated-container-color': 'red',
      '--mdc-chip-label-text-color': 'blue',
      '--mdc-chip-elevated-disabled-container-color': 'yellow',
    };
  }

  styleForChip(label: string): any {
    const color = {
      b: this.currentCard.colorBack ?? 'white',
      f: this.currentCard.colorFore ?? 'black'
    };
    if (GLOBALS.cardConfig.labelData[label] != null) {
      color.b = '#' + GLOBALS.cardConfig.labelData[label].back;
      color.f = '#' + GLOBALS.cardConfig.labelData[label].fore;
    }
    return {
      '--mdc-chip-elevated-container-color': color.f,
      '--mdc-chip-label-text-color': color.b,
      '--mdc-chip-elevated-disabled-container-color': 'yellow',
      '--mdc-chip-with-trailing-icon-trailing-icon-color': color.b
    };
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  isMode(check: string) {
    return GLOBALS.cardMode === check && this.currentCard != null;
  }

  clickSave(evt: MouseEvent) {
    if (this.currentCard != null) {
      switch (this.cardFace) {
        case 'front':
        case 'back':
          (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
          break;
      }
    }
    evt.stopPropagation();
    GLOBALS.cardMode = 'view';
    GLOBALS.saveSharedData();
  }

  clickCancel(evt: MouseEvent) {
    evt.stopPropagation();
    switch (this.cardFace) {
      case'front':
      case'back':
        (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
        break;
    }
    if (this.currentCard.asString !== JSON.stringify(this.orgCard)) {
      this.ms.confirm($localize`Do you really want to discard the changes?`)
        .subscribe(result => {
          if (result?.btn === DialogResultButton.yes) {
            this.currentCard?.fillFromJson(this.orgCard);
            GLOBALS.cardMode = 'view';
            this.cardConfig.extractLabels(GLOBALS.cardList);
          }
        });
    } else {
      this.currentCard?.fillFromJson(this.orgCard);
      GLOBALS.cardMode = 'view';
    }
  }

  clickEdit(evt: MouseEvent) {
    evt?.stopPropagation();
    this.ms.showPopup(CardPopupComponent, 'card', {idx: this.cardIdx});
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

  addLabel(evt: Event) {
    evt.stopPropagation();
    GLOBALS.editLabel(this.currentCard, null);
  }

  removeLabel(value: string) {
    const idx = this.currentCard.labels.indexOf(value);
    if (idx >= 0) {
      this.currentCard.labels.splice(idx, 1);
    }
  }

  assignLabel(value: string) {
    this.currentCard.labels.push(value);
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

  onCardFaceChange(_evt: any) {
    switch (this.cardFace) {
      case 'front':
      case 'back':
        (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
        break;
    }
    this.cardFace = this.form.controls.cardFace.value;
    switch (this.cardFace) {
      case 'front':
      case 'back':
        this.form.controls.edit.setValue((this.currentCard as any)[this.cardFace]);
        break;
    }
    this.activateEdit();
  }

  showColorDialog() {
    this.ts.currTheme.cardBodyBack = this.currentCard.colorBack ?? 'white';
    this.ts.currTheme.cardBodyFore = this.currentCard.colorFore ?? 'black';
    this.ms.showPopup(ColorCfgDialogComponent, 'colorcfgdialog',
      {colorKey: 'card'})
      .subscribe(_result => {
        this.currentCard.colorBack = this.ts.currTheme.cardBodyBack;
        this.currentCard.colorFore = this.ts.currTheme.cardBodyFore;
        GLOBALS.saveSharedData();
      });
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (GLOBALS.cardMode !== 'edit') {
      switch (event.code) {
        case 'Space':
        case 'ArrowUp':
        case 'ArrowDown':
          this.turnCard();
          break;
      }
    }
  }

  clickResult(evt: MouseEvent, value: string) {
    evt?.stopPropagation();
    switch (value) {
      case 'correct':
        break;
      case 'unsteady':
        break;
      case 'wrong':
        break;
    }
    this.cardFace = 'front';
  }
}
