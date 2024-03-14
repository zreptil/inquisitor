import {Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {SyncService} from '@/_services/sync/sync.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  constructor(public globals: GlobalsService,
              public ms: MessageService,
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
}
