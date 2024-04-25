import { writeWidgetJSON, readWidgetJSON, readAppdataJSON, writeAppdataJSON } from "@main/lib/JSON";
import { createOpenFilePrompt } from "@main/lib/util";
import { execFile } from 'child_process';

export const writeJson = async (widget: string, data: unknown) => {
  await writeWidgetJSON(widget, data);
};

export const readJson = (widget: string) => {
  return readWidgetJSON(widget);
};

export const startApp = async (widget: string, app: string) => {
  console.log("app requested");
  console.log(widget + " - " + app);

  const appdata = await readAppdataJSON();

  let appPath = appdata.widgets[widget]?.apps.find(({ name }) => name == app)?.path;
  if (!appPath) {
    const suggestions = Object.values(appdata.widgets)
      .map(v => v.apps)
      .flat()
      .filter(({ name }) => name.toLocaleLowerCase() == app.toLocaleLowerCase());

    if (!suggestions.length) {
      appPath = await createOpenFilePrompt();
    } else {
      //suggest suggestions with open file option
    }

    if (!appPath) return; //no app was selected

    appdata.widgets[widget] ??= { apps: [] };
    appdata.widgets[widget]!.apps.push({ name: app, path: appPath });
    console.log(appdata, app);
    
    writeAppdataJSON(appdata);
  }

  execFile(appPath);
};
