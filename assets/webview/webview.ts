import { TRUSTED_TARGET } from './constant';
import {
  EventHandlers,
  IMezonWebView,
  MezonEventHandler,
  MezonAppEvent,
  MezonWebViewEvent,
} from './types';
import {
  sessionStorageGet,
  sessionStorageSet,
  urlParseHashParams,
} from './utils';

export class MezonWebView implements IMezonWebView {
  private eventHandlers: EventHandlers<unknown> = {};
  private locationHash: string = '';
  private iFrameStyle: HTMLStyleElement;

  public initParams: Record<string, string | null> = {};
  public isIframe: boolean = false;

  constructor() {
    this.initData();
    this.initIframe();
  }

  //#region Public methods
  public postEvent<T>(
    eventType: string,
    eventData: T,
    callback: Function
  ): void {
    if (!callback) {
      callback = function () {};
    }
    console.log('[Mezon.WebView] > postEvent', eventType, eventData);

    if (this.isIframe) {
      try {
        const trustedTarget = TRUSTED_TARGET;
        window.parent.postMessage(
          JSON.stringify({ eventType: eventType, eventData: eventData }),
          trustedTarget
        );
        callback();
      } catch (e) {
        callback(e);
      }
    } else {
      callback({ notAvailable: true });
    }
  }

  public receiveEvent<T>(eventType: MezonAppEvent, eventData: T): void {
    console.log('[Mezon.WebView] < receiveEvent', eventType, eventData);
    this.callEventCallbacks<T>(
      eventType,
      function (callback: MezonEventHandler<T>) {
        callback(eventType, eventData);
      }
    );
  }

  public onEvent<T>(
    eventType: MezonAppEvent,
    callback: MezonEventHandler<T>
  ): void {
    if (!Array.isArray(this.eventHandlers[eventType])) {
      this.eventHandlers[eventType] = [];
    }
    const index = this.eventHandlers[eventType].indexOf(callback);
    if (index === -1) {
      this.eventHandlers[eventType].push(callback);
    }
  }

  public offEvent<T>(
    eventType: MezonAppEvent,
    callback: MezonEventHandler<T>
  ): void {
    if (!Array.isArray(this.eventHandlers[eventType])) {
      return;
    }
    const eventIndex = this.eventHandlers[eventType].indexOf(callback);
    if (eventIndex === -1) {
      return;
    }
    this.eventHandlers[eventType].splice(eventIndex, 1);
  }
  //#endregion

  //#region Private methods
  private initData(): void {
    this.locationHash = window.location.hash.toString();
    this.initParams = urlParseHashParams(this.locationHash);
    const storedParams = sessionStorageGet('initParams');
    if (storedParams) {
      for (var key in storedParams) {
        if (typeof this.initParams[key] === 'undefined') {
          this.initParams[key] = storedParams[key];
        }
      }
    }
    sessionStorageSet('initParams', this.initParams);
  }

  private initIframe(): void {
    try {
      const webview = this;
      this.isIframe = window.parent != null && window != window.parent;

      if (!this.isIframe) {
        return;
      }

      this.handleMessage();
      webview.iFrameStyle = document.createElement('style');
      document.head.appendChild(webview.iFrameStyle);
      try {
        window.parent.postMessage(
          JSON.stringify({
            eventType: MezonWebViewEvent.IframeReady,
            eventData: { reload_supported: true },
          }),
          '*'
        );
      } catch (e) {}
    } catch (e) {}
  }

  private handleMessage() {
    const webview = this;
    window.addEventListener('message', function (event: MessageEvent<string>) {
      if (event.source !== window.parent) return;
      let dataParsed: { eventType?: MezonAppEvent; eventData?: unknown } = {};
      try {
        dataParsed = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      if (!dataParsed || !dataParsed.eventType) {
        return;
      }
      switch (dataParsed.eventType) {
        case MezonAppEvent.SetCustomStyle:
          if (
            event.origin === TRUSTED_TARGET &&
            typeof dataParsed.eventData === 'string'
          ) {
            webview.iFrameStyle.innerHTML = dataParsed.eventData;
          }
          break;
        case MezonAppEvent.ReloadIframe:
          try {
            window.parent.postMessage(
              JSON.stringify({
                eventType: MezonWebViewEvent.IframeWillReloaded,
              }),
              '*'
            );
          } catch (e) {
            console.log('error', e);
          }
          location.reload();
          break;
        default:
          webview.receiveEvent(dataParsed.eventType, dataParsed.eventData);
          break;
      }
    });
  }

  private callEventCallbacks<T>(
    eventType: MezonAppEvent,
    func: (callback: MezonEventHandler<T>) => void
  ): void {
    const currentEventHandlers = this.eventHandlers[eventType];
    if (currentEventHandlers === undefined || !currentEventHandlers.length) {
      return;
    }
    for (var i = 0; i < currentEventHandlers.length; i++) {
      try {
        func(currentEventHandlers[i]);
      } catch (e) {
        console.error(e);
      }
    }
  }
  //#endregion
}
