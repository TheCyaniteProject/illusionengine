const API = (await import('@main/preload.ts')).API_NAME;
declare interface Window {
  [API]: typeof import('@main/preload').API;
}
