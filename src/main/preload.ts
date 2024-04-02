import { contextBridge, ipcRenderer } from "electron";

export const API = {
    run(processid: string) {
        ipcRenderer.send("call-process", processid);
    },
    write(id: string, data: unknown) {
        ipcRenderer.send("write-json", [id, data]);
    },
    async read(id: string) {
        return await ipcRenderer.invoke('fetch-reply', id);
    },
} as const;

contextBridge.exposeInMainWorld("illusion_engine", API);