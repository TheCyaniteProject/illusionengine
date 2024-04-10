import { Widget } from "@/render/components/Widget";

export function startApp(widget: Widget, name: unknown) {
  if (typeof name != 'string')
    throw new TypeError(`Expected name to be string, got '${typeof name}'`);
}

export function resizeWidget(widget: Widget, x: unknown, y: unknown) {
  if (typeof x != 'number')
    throw new TypeError(`Expected x to be number, got '${typeof x}'`);

  if (typeof y != 'number')
    throw new TypeError(`Expected y to be number, got '${typeof y}'`);

  widget.iframe.width = x + 'px';
  widget.iframe.height = y + 'px';
}

export function setPositionMethod(widget: Widget, type: string) {
    widget.iframe.style.position = type;
}

export function setScreenPosition(widget: Widget, x: unknown, y: unknown) {
    if (typeof x != 'number')
        throw new TypeError(`Expected x to be number, got '${typeof x}'`);

    if (typeof y != 'number')
        throw new TypeError(`Expected y to be number, got '${typeof y}'`);
    widget.iframe.style.top = x + 'px';
    widget.iframe.style.left = y + 'px';
}

export function run(widget: Widget, processid: string) {
    window.illusion_engine.run(widget.getAttribute("widget")!, processid);
}