export function startApp(name: unknown) {
  if (typeof name != 'string')
    throw new TypeError(`Expected name to be string, got '${typeof name}'`);
}