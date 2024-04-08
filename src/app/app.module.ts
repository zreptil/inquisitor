import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ColorPickerComponent} from '@/controls/color-picker/color-picker.component';
import {ColorPickerImageComponent} from '@/controls/color-picker/color-picker-image/color-picker-image.component';
import {ColorPickerMixerComponent} from '@/controls/color-picker/color-picker-mixer/color-picker-mixer.component';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {MainComponent} from '@/components/main/main.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from '@/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {LogComponent} from '@/components/log/log.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {ProgressComponent} from '@/components/progress/progress.component';
import {AutofocusDirective} from '@/_directives/autofocus.directive';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog/color-picker-dialog';
import {ColorCfgComponent} from '@/controls/color-cfg/color-cfg.component';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';
import {CloseButtonComponent} from '@/controls/close-button/close-button.component';
import {ColorPickerSliderComponent} from '@/controls/color-picker/color-picker-slider/color-picker-slider.component';
import {ColorPickerHslComponent} from '@/controls/color-picker/color-picker-hsl/color-picker-hsl.component';
import {CardBoxComponent} from '@/components/card-box/card-box.component';
import {CardComponent} from '@/components/card/card.component';
import {NgxEditorModule} from 'ngx-editor';
import {CardListComponent} from '@/components/card-list/card-list.component';
import {CardPopupComponent} from '@/components/card-popup/card-popup.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    AppComponent,
    DialogComponent,
    ColorPickerComponent,
    ColorPickerDialog,
    ColorPickerImageComponent,
    ColorPickerMixerComponent,
    ColorPickerBaseComponent,
    ColorPickerSliderComponent,
    ColorPickerHslComponent,
    ColorCfgComponent,
    ColorCfgDialogComponent,
    CloseButtonComponent,
    WhatsNewComponent,
    MainComponent,
    WelcomeComponent,
    ImpressumComponent,
    CardListComponent,
    CardBoxComponent,
    CardComponent,
    CardPopupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    DragDropModule,
    LogComponent,
    ProgressComponent,
    NgxEditorModule,
    ReactiveFormsModule,
    NgxEditorModule.forRoot({
      locals: {
        // menu
        bold: $localize`Bold`,
        italic: $localize`Italic`,
        code: $localize`Code`,
        blockquote: $localize`Blockquote`,
        underline: $localize`Underline`,
        strike: $localize`Strike`,
        bullet_list: $localize`Bullet List`,
        ordered_list: $localize`Ordered List`,
        heading: $localize`Heading`,
        h1: $localize`Header 1`,
        h2: $localize`Header 2`,
        h3: $localize`Header 3`,
        h4: $localize`Header 4`,
        h5: $localize`Header 5`,
        h6: $localize`Header 6`,
        align_left: $localize`Left Align`,
        align_center: $localize`Center Align`,
        align_right: $localize`Right Align`,
        align_justify: $localize`Justify`,
        text_color: $localize`Text Color`,
        background_color: $localize`Background Color`,

        // popups, forms, others...
        url: $localize`URL`,
        text: $localize`Text`,
        openInNewTab: $localize`Open in new tab`,
        insert: $localize`Insert`,
        altText: $localize`Alt Text`,
        title: $localize`Title`,
        remove: $localize`Remove`,
      }
    })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
