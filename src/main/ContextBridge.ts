import { writeWidgetJSON, readWidgetJSON } from "@main/lib/JSON";

export const writeJson = async (widget: string, data: unknown) => {
  await writeWidgetJSON(widget, data);
};

export const readJson = (widget: string) => {
  return readWidgetJSON(widget);
};

export const startApp = (widget: string, app:string) => {

}