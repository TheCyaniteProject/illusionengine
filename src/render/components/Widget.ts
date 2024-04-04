import ShadowDom from './WidgetShadowDom.html';
import StyleSheet from './WidgetStyle.raw.css';
import * as API from '@/render/Api';

export type WidgetAttributes = typeof Widget.observedAttributes[number];
export type AttributeChangeHandler = `on${Capitalize<WidgetAttributes>}Change`;

type WithAttributeChangeHandler = {
  [key in AttributeChangeHandler]: (oldValue: string, newValue: string) => void;
};

export class Widget extends HTMLElement implements WithAttributeChangeHandler {

  static readonly observedAttributes = ['widget', 'draggable'] as const;
  static readonly HTML_TAG = 'illusionengine-widget';
  static #registered = false;
  #shadow: ShadowRoot;
  #iframe: HTMLIFrameElement;
  onMessage: (event: MessageEvent) => void;

  //runs when element is created with createCompent()
  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'closed' });

    this.#shadow.innerHTML = ShadowDom;

    const css = new CSSStyleSheet();
    css.replaceSync(StyleSheet);
    this.#shadow.adoptedStyleSheets = [css];

    this.#iframe = this.#shadow.querySelector('iframe')!;
    this.onMessage = this.#onMessage.bind(this);
  }

  #onMessage(event: MessageEvent) {
    const { source } = event;
    if (source != this.#iframe.contentWindow) return;

    const { data: { method, args } } = event;

    if (typeof method != 'string')
      throw new TypeError(`Expected method to be string, got '${typeof method}'`);

    if (!(args instanceof Array))
      throw new TypeError(`Expected args to be array, got '${typeof args}'`);

    const apiMethod = API[method as keyof typeof API];

    if (typeof apiMethod != 'function') throw new Error(`Unknown method: ${method}`);

    apiMethod(...args as Parameters<typeof apiMethod>);
  }

  connectedCallback() {
    window.addEventListener('message', this.onMessage);
  }

  disconnectedCallback() {
    window.removeEventListener('message', this.onMessage);
  }

  static register() {
    if (!this.#registered) {
      window.customElements.define(this.HTML_TAG, this);
      this.#registered = true;
    }
  }

  static create(): Widget {
    const el = document.createElement(this.HTML_TAG) as Widget;
    return el;
  }

  attributeChangedCallback(name: WidgetAttributes, oldValue: string, newValue: string) {
    const handler = `on${name.replace(/^./, c => c.toLocaleUpperCase())}Change` as AttributeChangeHandler;

    if (!this[handler]) throw new Error(`No handler defined for attribute '${name}'`);

    this[handler](oldValue, newValue);
  }

  onWidgetChange(_oldValue: string, newValue: string) {
    this.#iframe.src = `./${newValue}/${newValue}.html`;
  }

  onDraggableChange(oldValue: string, newValue: string) {
    console.log({ oldValue, newValue });
  }

}

Widget.register();