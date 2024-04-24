import type { Widget } from "@render/components/Widget";

//Gross but it works ig x.x
const types = typeof (0 as unknown);
type Types = typeof types;
type TypeToType<T extends Types> =
  T extends "number" ? number :
  T extends "boolean" ? boolean :
  T extends "string" ? string :
  T extends "object" ? object :
  T extends "function" ? (...args: unknown[]) => unknown :
  T extends "symbol" ? symbol :
  T extends "undefined" ? undefined :
  T extends "bigint" ? bigint :
  never;


type ValidateDescriptor = {value: unknown, expected: Types; name: string; }[];
type Validated<T extends ValidateDescriptor> = {
  [index in keyof T]: TypeToType<T[index]['expected']>
};

/**
 * Since the API methods are called from 3rd party code arguments must be validated.
 * Example:
 * ```ts
 * const [x, y] = validateArguments([
 *  { name: 'x', value: args[0], expected: "number" },
 *  { name: 'y', value: args[1], expected: "number" },
 * ] as const);
 * ```
 * The `as const` is needed to provide positional information of the argument types
 * @returns Validated Argument Array
 */
function validateArguments<T extends ValidateDescriptor>(args: T): Validated<T> {
  for (const { value, name, expected } of args) {
    if (typeof value != expected) {
      throw new TypeError(`Expected ${name} to be ${expected}, got ${typeof value}`);
    }
  }

  return args.reduce((prev, { name, value }) => (prev[name] = value, prev), {} as any);
}

export function resizeWidget(widget: Widget, ...args: unknown[]) {
  const [x, y] = validateArguments([
    { name: 'x', value: args[0], expected: "number" },
    { name: 'y', value: args[1], expected: "number" },
  ] as const);

  widget.iframe.width = x + 'px';
  widget.iframe.height = y + 'px';
}

export function setPositionMethod(widget: Widget, ...args: unknown[]) {
  const [type] = validateArguments([
    { name: "type", value: args[0], expected: 'string' }
  ]);
  widget.iframe.style.position = type;
}

export function setScreenPosition(widget: Widget, ...args: unknown[]) {
  const [x, y] = validateArguments([
    { name: 'x', value: args[0], expected: "number" },
    { name: 'y', value: args[1], expected: "number" },
  ] as const);

  widget.iframe.style.top = x + 'px';
  widget.iframe.style.left = y + 'px';
}

export function startApp(widget: Widget, ...args: unknown[]) {
  const [app] = validateArguments([
    { name: 'app', value: args[0], expected: "string" },
  ] as const);

  window.illusion_engine.startApp(widget.getAttribute("widget")!, app);
}