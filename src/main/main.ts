import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';

const widget_dir = "/widgets/";
const widgetdata_dir = "/widgetdata/";
const appdata = "appdata.json";

const createWindow = function () {
    const window = new BrowserWindow({
        fullscreen: true,
        resizable: false,
        movable: false,
        minimizable: true,
        transparent: true,
        focusable: true,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    window.webContents.openDevTools()

    if (process.env.DEV == 'true') {
        window.loadURL('http://127.0.0.1:3000');
    }
    else {
        window.loadFile(path.join(__dirname, 'index.html'));
    }

    return window;
};

app.disableHardwareAcceleration();

app.on('ready', () => {
    createWindow();
});

app.whenReady().then(() => {
    const icon = nativeImage.createFromPath('./app.ico');
    const tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Widgets', click: function () {
                const window = BrowserWindow.getAllWindows()[0];
                window.setFocusable(true);
                window.show();
                // window.setFocusable(false);
            }
        },
        {
            label: 'Reload Widgets', click: function () {
                const window = BrowserWindow.getAllWindows()[0];
                window.reload();
            }
        },
        {
            label: 'DevTools', click: function () {
                const window = BrowserWindow.getAllWindows()[0];
                window.webContents.openDevTools();
            }
        },
        {
            label: 'Exit', click: function () {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('IllusionEngine');
    tray.setContextMenu(contextMenu);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function runexternalcommand(widgetid: string, processid: string) {
    // check if processid has been asigned. If not, prompt the user to add a new process or select from list
    // Else, run the saved process.

    // read saved appdata

    try {
        const datapath = path.join(app.getPath("userData"), appdata);

        const rawdata = await fs.readFile(datapath, 'utf8');
        const data = JSON.parse(rawdata);

        // check for process
        if ("widgets" in data) {
            if (widgetid in data["widgets"]) {
                if (processid in data["widgets"][widgetid]) {
                    console.log("Has data");
                    run(data["widgets"][widgetid][processid]);
                    return;
                }
            }
        }
        console.log("No data");
        // no > new process prompt
        createPrompt(widgetid, processid);

    } catch (err) {
        // new process prompt
        createPrompt(widgetid, processid);
    }
}

async function createPrompt(widgetid: string, processid: string) {

    const value = (await dialog.showOpenDialog({ properties: ['openFile'] })).filePaths[0];

    // creates 'appdata' file if it doesn't exist, also 'widgets' and 'processid' data vars, and then sets it's value
    const datapath = path.join(app.getPath("userData"), appdata);
    let data = { widgets: { [widgetid]: { [processid]: value } } };
    try {
        const rawdata = await fs.readFile(datapath, 'utf8');
        data = JSON.parse(rawdata);

        data["widgets"] ??= {}
        data["widgets"][widgetid] ??= {}
        data["widgets"][widgetid][processid] = value;
    } catch (err) {
        console.log(err)
    }

    const jsondata = JSON.stringify(data, null, 2);
    await fs.writeFile(datapath, jsondata);

    run(value);
}

ipcMain.on('call-process', (event, arg) => {
    console.log(arg + " process requested");
    console.log(arg[0]+" - "+ arg[1])
    runexternalcommand(arg[0], arg[1]);
});

// debug - remove after contextBridge is replaced
app.on('ready', () => {
    //runexternalcommand("testid1");
    //writeJSON("testwidget", { foo: "bar", foo2: [ "data" ] });
    console.log(getWidgetLoadData());
});

function run(process: string) {
    console.log("exec: " + process);
    execFile(path.join(process));
}

ipcMain.on('write-json', (event, arg) => {
    console.log(arg + " requested to save .json");
    // [ eventid, jsondata]
    writeJSON(arg[0], arg[1]);
});

async function writeJSON(id: string, data: unknown) {
    // write json to file, probably safe

    const datapath = path.join(app.getPath("userData"), widgetdata_dir, id);

    const jsondata = JSON.stringify(data, null, 2);
    await fs.mkdir(datapath, { recursive: true });
    await fs.writeFile(path.join(datapath, 'savedata.json'), jsondata);
}

ipcMain.on('fetch-json', (event, arg) => {
    console.log(arg + " requested saved .json");

    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    const value = fetchJSON(arg);
    event.reply('fetch-reply', [arg, value]);
});

async function fetchJSON(id: string) {
    // get json from file
    try {
        const rawdata = await fs.readFile(path.join(app.getPath("userData"), widgetdata_dir, id, 'savedata.json'), 'utf8');
        const data = JSON.parse(rawdata);
        return data;
    } catch (err) {
        return {};
    }
}

const getDirectories = async (source: string) =>
    (await fs.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

async function getWidgetLoadData() {
    const datalist = [];

    const dirs = await getDirectories(path.join(app.getPath("userData"), widget_dir))
    for (let i = 0; i < dirs.length; i++) {
        try {
            const datapath = path.join(app.getPath("userData"), widget_dir, dirs[i], 'widget.json');
            const rawdata = await fs.readFile(datapath, 'utf8');

            datalist.push({
                key: dirs[i],
                value: JSON.parse(rawdata)
            });
        } catch (err) {
            console.log(err);
        }
    }

    return datalist;
}