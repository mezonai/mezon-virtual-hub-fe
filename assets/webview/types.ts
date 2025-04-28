declare global {
  interface Window {
    Mezon: {
      WebView?: IMezonWebView;
    };
  }
}

export enum MezonAppEvent {
  ThemeChanged = 'theme_changed',
  ViewPortChanged = 'viewport_changed',
  SetCustomStyle = 'set_custom_style',
  ReloadIframe = 'reload_iframe',
  CurrentUserInfo = 'CURRENT_USER_INFO',
  UserHashInfo = 'USER_HASH_INFO',
  Pong = "PONG",
  SendTokenSuccess = "SEND_TOKEN_RESPONSE_SUCCESS",
  SendTokenFail = "SEND_TOKEN_RESPONSE_FAILED"
}

export enum MezonWebViewEvent {
  IframeReady = 'iframe_ready',
  IframeWillReloaded = 'iframe_will_reload',
  SendBotID = 'SEND_BOT_ID',
  Ping = "PING",
  SendToken = "SEND_TOKEN"
}

export type MezonEventHandler<T> = (
  eventType: MezonAppEvent,
  eventData?: T
) => void;
export type EventHandlers<T> = Record<string, MezonEventHandler<T>[]>;
export type InitParams = Record<string, string | null>;

export interface IMezonWebView {
  initParams: InitParams;
  isIframe: boolean;
  onEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void;
  offEvent<T>(eventType: MezonAppEvent, callback: MezonEventHandler<T>): void;
  postEvent<T>(
    eventType: MezonWebViewEvent,
    eventData: T,
    callback: Function
  ): void;
  receiveEvent<T>(event: MezonAppEvent | null, eventData?: T): void;
}
