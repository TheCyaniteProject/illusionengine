import { contextBridge, ipcRenderer } from "electron";

export const API_NAME = 'illusion_engine' as const;
export const API = {
    run(widget: string, processid: string) {
        return ipcRenderer.invoke("call-process", widget, processid);
    },
    write(widget: string, data: unknown) {
        return ipcRenderer.invoke("write-json", widget, data);
    },
    read(widget: string, id: string) {
        return ipcRenderer.invoke('fetch-reply', widget, id);
    },
} as const;

contextBridge.exposeInMainWorld(API_NAME, API);