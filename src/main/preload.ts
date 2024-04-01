import { contextBridge, ipcRenderer } from "electron";

export const API = {
    run(processid: string) {
        runexternalcommand(processid);
    },
    write(id: string, data: unknown) {
        writeJSON(id, data);
    },
    async read(id: string) {
        return await fetchJSON(id);
    },
    newFunkyMethod(obj: { name: string, thingy: number; }) {
        return obj;
    }
} as const;

contextBridge.exposeInMainWorld("illusion_engine", API);

function runexternalcommand(processid: string) {
    ipcRenderer.send("call-process", processid);
}

function writeJSON(id: string, data: unknown) {
    ipcRenderer.send("write-json", [id, data]);
}

const readresolvers = new Map();
ipcRenderer.on("fetch-reply", (_event, arg) => {
    readresolvers.get(arg[0])(arg[1]);
    readresolvers.delete(arg[0]);
});
function fetchJSON(id: string) {
    return new Promise((res) => {
        ipcRenderer.send("fetch-json", id);
        readresolvers.set(id, res);
    });
}
