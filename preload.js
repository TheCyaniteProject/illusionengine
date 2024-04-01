const { contextBridge, ipcRenderer } = require("electron");

const API = {
    run(processid) {
        runexternalcommand(processid);
    },
    write(id, data) {
        writeJSON(id, data);
    },
    async read(id) {
        return await fetchJSON(id);
    }
}

contextBridge.exposeInMainWorld("illusion_engine", API);

function runexternalcommand(processid) {
    ipcRenderer.send("call-process", processid);
}

function writeJSON(id, data) {
    ipcRenderer.send("write-json", [id, data]);
}

const readresolvers = new Map();
ipcRenderer.on("fetch-reply", (_event, arg) => {
    readresolvers.get(arg[0])(arg[1]);
    readresolvers.delete(arg[0]);
});
function fetchJSON(id) {
    return new Promise((res) => {
        ipcRenderer.send("fetch-json", id);
        readresolvers.set(id, res);
    });
}
