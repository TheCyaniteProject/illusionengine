import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { execFile } from 'child_process';

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
            preload: path.join(__dirname, './preload.js'),
        }
    });

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
    const icon = nativeImage.createFromPath('C:/Users/thecy/Pictures/test.png');
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

const widget_dir = "/widgets/";
const appdata = "appdata.json";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function runexternalcommand(processid: string) {
    // check if processid has been asigned. If not, prompt the user to add a new process or select from list
    // Else, run the saved process.

    // read saved appdata

    try {
        const datapath = path.join(__dirname, appdata);

        const rawdata = await fs.readFile(datapath, 'utf8');
        const data = JSON.parse(rawdata);

        // check for process
        if ("widgets" in data) {
            if (processid in data["widgets"]) {
                run(data["widgets"][processid]);
                return;
            }
        }

        // no > new process prompt
        createPrompt(processid);

    } catch (err) {
        // new process prompt
        createPrompt(processid);
    }
}

function createPrompt(processid: string) {
    // call main.js to make prompt window

    // debug
    promptCallback(processid, "chipi.gif");
}

async function promptCallback(processid: string, value: string) {
    // creates 'appdata' file if it doesn't exist, also 'widgets' and 'processid' data vars, and then sets it's value
    try {
        const datapath = path.join(__dirname, appdata);
        if (existsSync(datapath)) {
            const rawdata = await fs.readFile(datapath, 'utf8');
            const data = JSON.parse(rawdata);

            data["widgets"][processid] = value;

            const jsondata = JSON.stringify(data);
            await fs.writeFile(datapath, jsondata);

            run(value);
        }
        else {
            const data = {};

            //@ts-expect-error untyped variable
            data["widgets"][processid] = value;

            const jsondata = JSON.stringify(data);
            await fs.writeFile(datapath, jsondata);

            run(value);
        }
    } catch (err) {
        // error
    }
}

ipcMain.on('call-process', (event, arg) => {
    console.log(arg + " process requested");

    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    run(arg); // replace with runexternalcommand
});

function run(process = 'Notepad.exe') {
    execFile(process);
}

ipcMain.on('write-json', (event, arg) => {
    console.log(arg + " requested to save .json");

    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    writeJSON(arg[0], arg[1]);
});

async function writeJSON(id: string, data: unknown) {
    // write json to file, probably safe

    const jsondata = JSON.stringify(data);
    await fs.writeFile(path.join(__dirname, widget_dir, id, 'savedata.json'), jsondata);
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
        const rawdata = await fs.readFile(path.join(__dirname, widget_dir, id, 'savedata.json'), 'utf8');
        const data = JSON.parse(rawdata);
        return data;
    } catch (err) {
        return {};
    }
}