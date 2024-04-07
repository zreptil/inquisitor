import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {lastValueFrom, throwError, timeout} from 'rxjs';
import {oauth2SyncType} from '@/_services/sync/oauth2pkce';
import {LangData} from '@/_model/lang-data';
import {SyncService} from '@/_services/sync/sync.service';
import {LanguageService} from '@/_services/language.service';
import {EnvironmentService} from '@/_services/environment.service';
import {MessageService} from '@/_services/message.service';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {CardData} from '@/_model/card-data';
import {CardConfig} from '@/_model/card-config';
import {ColorData} from '@/_model/color-data';
import {ColorDialogData} from '@/controls/color-picker/color-picker.component';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog/color-picker-dialog';
import {DialogResultButton, DialogType, IDialogDef} from '@/_model/dialog-data';
import {MatDialog} from '@angular/material/dialog';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

export let GLOBALS: GlobalsService;

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {
  version = '1.0';
  skipStorageClear = false;
  debugFlag = 'debug';
  debugActive = 'yes';
  isConfigured = false;
  dragPos: any = {};
  themeChanged = false;
  editColors = true;
  maxLogEntries = 20;
  storageVersion: string;
  currentPage: string;
  language: LangData;
  cardMode = 'view';
  _syncType: oauth2SyncType;
  oauth2AccessToken: string = null;
  ownTheme: any;
  themeList: any = {
    null: GlobalsService.msgThemeAuto,
    standard: GlobalsService.msgThemeStandard,
    xmas: GlobalsService.msgThemeXmas,
    own: GlobalsService.msgThemeOwn,
  }
  titles: any = {
    settings: $localize`Einstellungen`,
    dsgvo: $localize`Datenschutzerklärung`,
    help: $localize`Information`,
    impressum: $localize`Imprint`,
    welcome: $localize`Welcome to the Inquisition`,
    whatsnew: $localize`Once upon a time...`
  };
  filterCards: string[];
  private flags = '';

  constructor(public http: HttpClient,
              public sync: SyncService,
              public ls: LanguageService,
              public ms: MessageService,
              public env: EnvironmentService,
              public dialog: MatDialog) {
    GLOBALS = this;
    this.loadWebData();
    this.loadSharedData().then(_ => {
      this.currentPage = 'cardbox';
      if (Utils.isEmpty(this.storageVersion)) {
        this.ms.showPopup(WelcomeComponent, 'welcome', {}).subscribe(_result => {
          this.saveSharedData();
        });
      } else if (this.storageVersion !== this.version) {
        this.ms.showPopup(WhatsNewComponent, 'whatsnew', {});
      }
    });
  }

  static _msgThemeOwn = $localize`:theme selection - own|:Eigenes`;

  static get msgThemeOwn(): string {
    return GlobalsService._msgThemeOwn;
  }

  static set msgThemeOwn(value: string) {
    GlobalsService._msgThemeOwn = value;
  }

  static get msgThemeAuto(): string {
    return $localize`:theme selection - automatic|:Automatisch`;
  }

  static get msgThemeStandard(): string {
    return $localize`:theme selection - standard|:Standard`;
  }

  static get msgThemeXmas(): string {
    return $localize`:theme selection - christmas|:Weihnachten`;
  }

  _cardList: CardData[] = [];

  get cardList(): CardData[] {
    if (this.filterCards != null) {
      return this._cardList.filter(card => {
        for (const check of this.filterCards) {
          if (!card.labels.includes(check)) {
            return false;
          }
        }
        return true;
      });
    }
    return this._cardList;
  }

  _cardConfig = new CardConfig();

  get cardConfig(): CardConfig {
    return this._cardConfig;
  }

  _isDebug = false;

  get isDebug(): boolean {
    return this._isDebug && Log.mayDebug;
  }

  set isDebug(value: boolean) {
    if (!Log.mayDebug) {
      value = false;
    }
    this._isDebug = value;
  }

  get mayDebug(): boolean {
    return Log.mayDebug;
  }

  get mayEdit(): boolean {
    return this.may('edit');
  }

  get isAdmin(): boolean {
    return this.may('admin');
  }

  get runsLocal(): boolean {
    return window.location.href.indexOf('/localhost:') >= 0;
  }

  _isLocal = window.location.href.indexOf('/localhost:') >= 0;

  get isLocal(): boolean {
    return this._isLocal;
  }

  set isLocal(value: boolean) {
    this._isLocal = value;
  }

  get appTitle(): string {
    return document.querySelector('head>title').innerHTML;
  }

  get themeName(): string {
    return this.themeList[this._theme];
  }

  _theme: string;

  get theme(): string {
    let ret = this.baseThemeName(this._theme);
    if (ret === 'own') {
      return GlobalsService.msgThemeOwn;
    }
    return ret;
  }

  set theme(value: string) {
    if (this.themeList[value] != null) {
      this._theme = value;
    } else {
      this._theme = 'own';
      GlobalsService.msgThemeOwn = value;
    }
  }

  get themeKey(): string {
    if (Utils.isEmpty(this._theme)) {
      const ret = this.baseThemeName(this._theme);
      if (!Utils.isEmpty(ret)) {
        return ret;
      }
    }
    if (this.themeList[this._theme] != null) {
      return this._theme;
    }
    return 'own';
  }

  get defaultData(): any {
    return {
      's2': [{
        'f': '<p>Wie groß ist die <strong>Masse</strong> der <strong>Erde</strong>?</p>',
        'b': '<p><strong>5,97 Trilliarden Tonnen</strong></p><p>5,97 x 10^21 t<br>5,97 x 10^24 kg</p>',
        'l': ['Erde'],
        'cb': 'rgba(255,255,255,1)',
        'cf': 'rgba(0,0,0,1)'
      }, {
        'f': '<p>Wie groß ist die <strong>Masse </strong>der <strong>Sonne</strong>?</p>',
        'b': '<p><strong>1,98 Quadrilliarden Tonnen</strong></p><p>1,98 x 10^27 t<br>1,98 x 10^30 kg</p>',
        'l': ['Sonne'],
        'cb': 'rgba(255,255,255,1)',
        'cf': 'rgba(0,0,0,1)'
      }, {
        'f': '<p>Wie groß ist der <strong>Durchmesser</strong> der Erde?</p>',
        'b': '<p><strong>12.700 km</strong></p>',
        'l': ['Erde'],
        'cb': 'rgba(0,0,255,1)',
        'cf': 'rgba(255,255,255,1)'
      }, {
        'f': '<p>Wie groß ist der <strong>Durchmesser </strong>der <strong>Sonne</strong>?</p>',
        'b': '<p><strong>1.392.700 km</strong></p>',
        'l': ['Sonne'],
        'cb': 'rgba(255,255,0,1)',
        'cf': 'black'
      }, {
        'f': '<p>Wie groß ist der <strong>Durchmesser </strong>von <strong>Jupiter</strong>?</p>',
        'b': '<p><strong>140.000 km</strong></p>',
        'l': ['Universum']
      }, {
        'f': '<p>Wie groß ist die <strong>Masse </strong>von <strong>Jupiter</strong>?</p>',
        'b': '<p><strong>1,9 Quadrillionen Tonnen</strong></p><p>1,9 x 10^24 t<br>1,9 x 10^27 kg</p>',
        'l': ['Universum']
      }, {
        'f': '<p>Wie groß ist der <strong>Umfang</strong> der <strong>Erde</strong>?</p>',
        'b': '<p><strong>39.898 km</strong></p>',
        'l': ['Erde']
      }, {
        'f': '<p>Wie groß ist der <strong>Umfang </strong>der <strong>Sonne</strong>?</p>',
        'b': '<p><strong>4.375.296 km</strong></p>',
        'l': ['Sonne']
      }, {
        'f': '<p>Was ist eine <strong>Astronomische Einheit</strong> (AE)?</p>',
        'b': '<p>Der mittlere Abstand von der Erde zur Sonne<br>(149.600.000 km)</p>',
        'l': ['Universum']
      }, {'f': '<p>Wie groß ist der <strong>Neigungswinkel</strong> der Erdachse?</p>', 'b': '<p><strong>23,4 Grad</strong></p>', 'l': ['Erde']}, {
        'f': '<p>Wie schnell dreht sich die Erde?</p>',
        'b': '<p><strong>1.670 km/h (Äquator)</strong><br>1.000 km/h (Deutschland)<br>15 Grad/Std. (Winkelgeschwindigkeit)</p>',
        'l': ['Erde']
      }, {
        'f': '<p>Wie <strong>schnell </strong>bewegt sich die <strong>Erde </strong>um die <strong>Sonne</strong>?</p>',
        'b': '<p><strong>108.000 km/h</strong></p>',
        'l': ['Erde', 'Sonne']
      }, {
        'f': '<p>Wie <strong>schnell </strong>bewegt sich die Sonne um das <strong>Zentrum </strong>der <strong>Milchstraße</strong>?</p>',
        'b': '<p><strong>810.000 km/h</strong></p>',
        'l': ['Universum', 'Sonne']
      }, {
        'f': '<p>Wie <strong>schnell</strong> bewegt sich der <strong>Mond </strong>um die<strong> Erde</strong>?</p>',
        'b': '<p><strong>3.672 km/h</strong></p>',
        'l': ['Erde']
      }, {
        'f': '<p>Wie hoch ist die <strong>Lichtgeschwindigkeit</strong>?</p>',
        'b': '<p><strong>299.792.458 m/s</strong><br>299.792 km/s<br>1,08 Mrd. km/h</p>',
        'l': ['Universum']
      }, {
        'f': '<p>Welcher <strong>Stern </strong>ist der <strong>Erde </strong>am <strong>nächsten</strong>?</p>',
        'b': '<p><strong>Proxima Centauri</strong><br>4,24 Lichtjahre</p>',
        'l': ['Universum', 'Erde']
      }, {
        'f': '<p>Welche <strong>Galaxie </strong>ist der <strong>Erde </strong>am nächsten?</p>',
        'b': '<p><strong>Andromeda-Galaxie</strong><br>2,5 Mio. Lichtjahre</p>',
        'l': ['Universum', 'Erde']
      }, {
        'f': '<p>Wie schnell bewegt sich die <strong>Milchstraße </strong>durch das <strong>Universum</strong>?</p>',
        'b': '<p><strong>2 Mio. km/h</strong></p>',
        'l': ['Universum']
      }, {
        'f': '<p>Wie groß ist der <strong>Durchmesser </strong>der <strong>Milchstraße</strong>?</p>',
        'b': '<p><strong>105.000 Lichtjahre</strong></p>',
        'l': ['Universum']
      }, {
        'f': '<p>Wie <strong>dick </strong>ist die Scheibe der <strong>Milchstraße</strong>?</p>',
        'b': '<p><strong>3.000 Lichtjahre</strong></p>',
        'l': ['Universum']
      }, {
        'f': '<p>Wie <strong>groß </strong>ist das <strong>Universum</strong>?</p>',
        'b': '<p><strong>90 - 100 Mrd. Lichtjahre</strong></p>',
        'l': ['Universum']
      }, {
        'f': '<p><strong>Tiefster </strong>Punkt der <strong>Erde</strong>?</p>',
        'b': '<p><strong>Marianengraben</strong><br>11 km</p>',
        'l': ['Erde']
      }, {'f': '<p><strong>Höchster </strong>Punkt der <strong>Erde</strong>?</p>', 'b': '<p><strong>Mt. Everest</strong><br>8,8 km</p>', 'l': ['Erde']}],
      's3': {'l': ['Erde', 'Sonne', 'Universum'], 'lc': {'Erde': {'b': '0000ff', 'f': 'ffffff'}, 'Universum': {'b': 'e78080ff', 'f': '000000ff'}, 'Sonne': {'b': 'ffff00ff', 'f': '000000ff'}}}
    };
  }

  async loadSharedData(src?: any) {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('sharedData')) ?? {};
      for (const key of Object.keys(src ?? {})) {
        storage[key] = src[key];
      }
      this._cardList = [];
      const list = storage.s2 ?? [];
      if (list != null) {
        try {
          for (const entry of list) {
            this._cardList.push(CardData.fromJson(entry));
          }
        } catch (ex) {
          Log.devError(ex, `error when loading shared data (cardlist)`);
        }
      } else {
        //          saveStorage("mu", null);
      }
      this._cardConfig = new CardConfig();
      this._cardConfig.fillFromJson(storage.s3);
      this._cardConfig.extractLabels(this._cardList);
    } catch {
    }
    let syncData: any = await this.sync.downloadFile(this.env.settingsFilename);
    if (syncData != null) {
      try {
        if (+syncData.s0 > +storage.s0) {
          storage = syncData;
        }
      } catch {
      }
    }

    this.storageVersion = storage.s1;
    // validate values
  }

  saveSharedData(): void {
    const cardList = [];
    for (let i = 0; i < this._cardList.length; i++) {
      cardList.push(this._cardList[i].asJson);
    }

    const storage: any = {
      s0: Date.now(),
      s1: this.version,
      s2: cardList,
      s3: this.cardConfig.asJson
    };
    const data = JSON.stringify(storage);
    localStorage.setItem('sharedData', data);
    if (this.sync.hasSync) {
      this.sync.uploadFile(this.env.settingsFilename, data);
    }
  }

  loadWebData(): void {
    let storage: any = {};
    try {
      storage = JSON.parse(localStorage.getItem('webData')) ?? {};
    } catch {
    }

    const code = storage.w0 ?? 'en-GB';
    this.language = this.ls.languageList.find((lang) => lang.code === code);
    this._syncType = storage.w1 ?? oauth2SyncType.none;
    this.oauth2AccessToken = storage.w2;
    this.theme = storage.w3 ?? 'standard';

    // validate values
    if (this.oauth2AccessToken == null) {
      this._syncType = oauth2SyncType.none;
    }
    this.isConfigured = true;
  }

  saveWebData(): void {
    const storage: any = {
      w0: this.language.code ?? 'de_DE',
      w1: this._syncType,
      w2: this.oauth2AccessToken,
      w3: this.theme
    };
    localStorage.setItem('webData', JSON.stringify(storage));
  }

  async requestJson(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    return this.request(url, params).then(response => {
      return response?.body;
    });
  }

  async request(url: string, params?: { method?: string, options?: any, body?: any, showError?: boolean, asJson?: boolean, timeout?: number }) {
    params ??= {};
    params.method ??= 'get';
    params.showError ??= true;
    params.asJson ??= false;
    params.timeout ??= 1000;
    let response;
    const req = new HttpRequest(params.method, url,
      null,
      params.options);
    try {
      switch (params.method.toLowerCase()) {
        case 'post':
          response = await lastValueFrom(this.http.post(url, params.body, params.options).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
        default:
          response = await lastValueFrom(this.http.request(req).pipe(timeout({
            each: params.timeout,
            with: () => throwError(() => new CustomTimeoutError())
          })));
          break;
      }
    } catch (ex: any) {
      if (ex instanceof CustomTimeoutError) {
        response = $localize`There was no answer within ${params.timeout / 1000} seconds at ${url}`;
      } else if (ex?.messge != null) {
        response = ex.message;
      } else {
        response = ex;
      }
    }
    return params.asJson ? response.body : response;
  }

  baseThemeName(name: string): string {
    if (Utils.isEmpty(name)) {
      if (Utils.now.getMonth() === 11) {
        return 'xmas';
      } else {
        return 'standard';
      }
    }
    return name;
  }

  changeLabelColor(label: string, defColors: any) {
    const colors = GLOBALS.cardConfig.labelData[label] ?? defColors;
    const backColor = ColorData.fromString(colors.back);
    const foreColor = ColorData.fromString(colors.fore);
    backColor.title = 'Background';
    foreColor.title = 'Text';
    const data: ColorDialogData = {
      imageDataUrl: '',
      onDataChanged: null,
      onDialogEvent: null,
      colorIdx: 0,
      colorChange: null,
      maxFilesize: null,
      mixColors: null,
      modeList: ['hsl'],
      mode: 'hsl',
      action: 'open',
      colorList: [backColor, foreColor]
    };
    this.dialog.open(ColorPickerDialog,
      {
        data: data,
        panelClass: ['dialog-box', 'settings'],
        disableClose: true
      }).afterClosed().subscribe(response => {
      if (response?.btn === DialogResultButton.ok) {
        console.log('HURZ', data.colorList);
        GLOBALS.cardConfig.labelData[label] = {
          back: data.colorList[0].display_rgba,
          fore: data.colorList[1].display_rgba,
        };
      }
    });
  }

  editLabel(currentCard: CardData, label: string): void {
    const def: IDialogDef = {
      title: label == null ? $localize`Enter new Label` : $localize`Label ${label}`,
      type: DialogType.info,
      controls: [{type: 'input', title: null, id: 'name', value: label, autofocus: true}],
      buttons: [
        {title: $localize`Cancel`, icon: 'cancel', result: {btn: 'cancel'}},
        {title: $localize`Save`, icon: 'save', result: {btn: 'save'}, focus: true}]
    };
    this.ms.showDialog(def, $localize`Name of Label`).subscribe(result => {
      if (result?.btn === 'save') {
        if (label != null) {
          for (const card of GLOBALS.cardList) {
            card.labels = card.labels.map(l => {
              if (l === label) {
                return result.data.controls.name.value;
              }
              return l;
            });
          }
          GLOBALS.cardConfig.labelData[result.data.controls.name.value] = GLOBALS.cardConfig.labelData[label];
          delete GLOBALS.cardConfig.labelData[label];
        } else {
          const cat = result.data.controls.name.value;
          if (currentCard != null && !currentCard.labels.includes(cat)) {
            currentCard.labels.push(cat)
          }
        }
        this.cardConfig.extractLabels(GLOBALS.cardList);
      }
    });
  }

  private may(key: string): boolean {
    return this.flags.indexOf(`|${key}|`) >= 0;
  }
}
