import {Component, Inject, OnInit} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {FormControl, FormGroup} from '@angular/forms';
import {Editor, Toolbar, Validators} from 'ngx-editor';
import {CardData} from '@/_model/card-data';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';
import {ThemeService} from '@/_services/theme.service';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-card-popup',
  templateUrl: './card-popup.component.html',
  styleUrl: './card-popup.component.scss'
})
export class CardPopupComponent implements OnInit {
  closeData: CloseButtonData = {
    colorKey: 'card',
    closeAction: () => {
      return this.clickCancel(null);
    }
  };
  form = new FormGroup({
    edit: new FormControl('', Validators.required()),
    cardFace: new FormControl('front', Validators.required()),
  });

  cardIdx: number;
  orgCard: string;
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
  cardFace: string;

  constructor(public globals: GlobalsService,
              public ts: ThemeService,
              public ms: MessageService,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  get styleForCard(): any {
    return {
      backgroundColor: 'var(--mainBodyBack)',
      color: 'var(--mainBodyFore)',
    };
//    return GLOBALS.styleForCard(this.currentCard);
  }

  get currentCard(): CardData {
    return this.cardIdx == null ? null : GLOBALS.cardList[this.cardIdx];
  }

  get dataForEdit(): any {
    if (this.cardFace === 'front') {
      return {t: $localize`Question`, n: 'front', p: $localize`Question`};
    }
    return {t: $localize`Answer`, n: 'back', p: $localize`Answer`};
  }

  get hasEditor(): boolean {
    return this.cardFace === 'front' || this.cardFace === 'back';
  }

  get cardLabels(): string[] {
    return this.currentCard?.labels ?? [];
  }

  get configLabels(): string[] {
    const ret = GLOBALS.cardConfig.labels;
    return ret.filter(l => !this.cardLabels.includes(l));
  }

  ngOnInit() {
    this.cardIdx = this.data?.idx;
    this.cardFace = 'front';
    this.editor ??= new Editor();
    this.form.controls.cardFace.setValue(this.cardFace);
    this.form.controls.edit.setValue((this.currentCard as any)?.[this.cardFace]);
    this.orgCard = this.currentCard.asString;
    this.activateEdit();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  addLabel(evt: Event) {
    evt.stopPropagation();
    GLOBALS.editLabel(this.currentCard, null);
  }

  assignLabel(value: string) {
    this.currentCard.labels.push(value);
  }

  styleForChip(label: string): any {
    const color = {
      b: this.currentCard.colorBack ?? 'var(--mainHeadBack)',
      f: this.currentCard.colorFore ?? 'var(--mainHeadFore)'
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

  removeLabel(value: string) {
    const idx = this.currentCard.labels.indexOf(value);
    if (idx >= 0) {
      this.currentCard.labels.splice(idx, 1);
    }
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

  activateEdit(): void {
    setTimeout(() => {
      this.editor.commands
        .focus('start')
        .scrollIntoView()
        .exec();
    });
  }

  clickCancel(evt: MouseEvent): Observable<boolean> {
    evt?.stopPropagation();
    switch (this.cardFace) {
      case'front':
      case'back':
        (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value;
        break;
    }
    if (this.currentCard.asString !== this.orgCard) {
      this.ms.confirm($localize`Do you really want to discard the changes?`)
        .subscribe(result => {
          if (result?.btn === DialogResultButton.yes) {
            this.currentCard?.fillFromJson(JSON.parse(this.orgCard));
            GLOBALS.cardMode = 'view';
            GLOBALS.cardConfig.extractLabels(GLOBALS.cardList);
            this.dialog.closeAll();
          }
        });
      return of(false);
    } else {
      GLOBALS.cardMode = 'view';
    }
    return of(true);
  }

  clickSave(evt: MouseEvent) {
    evt.stopPropagation();
    if (this.currentCard != null) {
      switch (this.cardFace) {
        case 'front':
        case 'back':
          (this.currentCard as any)[this.cardFace] = this.form.controls.edit.value?.trim();
          break;
      }
    }
    GLOBALS.saveSharedData();
  }

  clickDelete(evt: MouseEvent) {
    evt.stopPropagation();
    this.ms.confirm($localize`Really delete this card?`).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        GLOBALS.cardList.splice(this.cardIdx, 1);
        GLOBALS.saveSharedData();
      }
    })
  }
}
