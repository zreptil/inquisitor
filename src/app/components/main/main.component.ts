import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {LanguageService} from '@/_services/language.service';
import {LangData} from '@/_model/lang-data';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  closeData: CloseButtonData = {
    colorKey: 'main',
    showClose: false
  };

  constructor(public globals: GlobalsService,
              public ms: MessageService,
              public ls: LanguageService,
              public sync: SyncService) {
  }

  get classForHeader(): string[] {
    const ret = ['mat-elevation-z4'];
    if (GLOBALS.isDebug) {
      ret.push('debug');
    }
    return ret;
  }

  clickLocalTitle() {
    GLOBALS.isLocal = !GLOBALS.isLocal;
  }

  onClick(key: string) {
    switch (key) {
      case 'whatsnew':
        this.ms.showPopup(WhatsNewComponent, 'whatsnew', {});
        break;
      case 'impressum':
        this.ms.showPopup(ImpressumComponent, 'impressum', {});
        break;
      case 'welcome':
        this.ms.showPopup(WelcomeComponent, 'welcome', {});
        break;
    }
  }

  clickLanguage(value: LangData) {
    console.log(value);
    GLOBALS.language = value;
    GLOBALS.saveWebData();
    location.reload();
  }

  classForLanguage(item: LangData): string[] {
    const ret: string[] = ['language'];
    if (GLOBALS.language?.code === item.code) {
      ret.push('current');
    }
    return ret;
  }
}
