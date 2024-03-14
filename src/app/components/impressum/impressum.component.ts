import {Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {Observable, of} from 'rxjs';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss']
})
export class ImpressumComponent {
  closeData: CloseButtonData = {
    colorKey: 'impressum',
    closeAction: (): Observable<boolean> => {
      return of(true);
    }
  }

  constructor(public globals: GlobalsService) {
  }
}
