import { app } from 'electron';
import path from 'path';
import os from 'os';

export const USER_DATA_PATH = app.getPath("userData");
export const WIDGETS_FOLDER = "widgets";
export const WIDGET_DATA_FOLDER = "widgetdata";
export const WIDGET_SAVE_FILE = "savedata.json";
export const APPDATA_JSON_PATH = path.join(USER_DATA_PATH, "appdata.json");
export const OS = os.platform();