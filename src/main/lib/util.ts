import { dialog } from "electron";

export async function createOpenFilePrompt() {
  const value = await dialog.showOpenDialog({ properties: ['openFile'] });

  if (value.canceled) return undefined;

  return value.filePaths[0];
}