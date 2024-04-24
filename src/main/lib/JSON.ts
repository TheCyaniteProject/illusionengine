import path from 'path';
import fs from 'fs/promises';
import { APPDATA_JSON_PATH, USER_DATA_PATH, WIDGET_DATA_FOLDER, WIDGET_SAVE_FILE } from '@main/config';

export type Appdata = {
  widgets: {
    [widget:string]: {
      apps: { name: string, path: string; }[];
    };
  };
};

export function readAppdataJSON(): Promise<Appdata> {
  return fs.readFile(APPDATA_JSON_PATH, { encoding: 'utf8' })
    .then(data => JSON.parse(data) as Appdata)
    .catch(() => ({
      widgets: {
      },
    }));
}

export async function writeAppdataJSON(data: Appdata) {
  await fs.writeFile(APPDATA_JSON_PATH, JSON.stringify(data));
}

export async function writeWidgetJSON(widget: string, data: unknown) {
  // write json to file, probably safe
  const datapath = path.join(USER_DATA_PATH, WIDGET_DATA_FOLDER, widget);

  const jsondata = JSON.stringify(data, null, 2);
  await fs.mkdir(datapath, { recursive: true });
  await fs.writeFile(path.join(datapath, WIDGET_SAVE_FILE), jsondata);
}

export async function readWidgetJSON(widget: string) {
  const datapath = path.join(USER_DATA_PATH, WIDGET_DATA_FOLDER, widget, WIDGET_SAVE_FILE);

  //this is a bit iffy if the savefile was manually edited and is no longer
  //valid JSON. Maybe we can catch that in the future and throw an appropiate error
  //In general I think its fine to say -> cant read file == undefined
  const data = fs.readFile(datapath, { encoding: 'utf8' })
    .then(data => JSON.parse(data))
    .catch(() => undefined);

  return data;
}