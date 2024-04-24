import path from 'path';
import fs from 'fs/promises';
import { USER_DATA_PATH, WIDGET_DATA_PATH, WIDGET_SAVE_FILE } from '@main/config';

export async function writeWidgetJSON(widget: string, data: unknown) {
  // write json to file, probably safe

  const datapath = path.join(USER_DATA_PATH, WIDGET_DATA_PATH, widget);

  const jsondata = JSON.stringify(data, null, 2);
  await fs.mkdir(datapath, { recursive: true });
  await fs.writeFile(path.join(datapath, WIDGET_SAVE_FILE), jsondata);
}

export async function readWidgetJSON(widget: string) {
  const datapath = path.join(USER_DATA_PATH, WIDGET_DATA_PATH, widget, WIDGET_SAVE_FILE);

  //this is a bit iffy if the savefile was manually edited and is no longer
  //valid JSON. Maybe we can catch that in the future and throw an appropiate error
  //In general I think its fine to say -> cant read file == undefined
  const data = fs.readFile(datapath, {encoding: 'utf8'})
   .then(data => JSON.parse(data))
   .catch(() => undefined);

   return data;
}