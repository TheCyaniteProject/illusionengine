import { app } from 'electron';
import os from 'os';

export const USER_DATA_PATH = app.getPath("userData");
export const WIDGETS_PATH = "/widgets/";
export const WIDGET_DATA_PATH = "/widgetdata/";
export const WIDGET_SAVE_FILE = "savedata.json";
export const OS = os.platform();