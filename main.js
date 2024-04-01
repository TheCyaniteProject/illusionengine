const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
var exec = require('child_process').execFile;

const MAIN_HTML = path.join('file://', __dirname, 'main.html');

let mainWindow

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

    window.loadURL(MAIN_HTML);

    return window;
};

app.disableHardwareAcceleration();

app.on('ready', () => {
    mainWindow = createWindow();
});

let tray;

app.whenReady().then(() => {
    const icon = nativeImage.createFromPath('C:/Users/thecy/Pictures/test.png');
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Widgets', click: function () {
                mainWindow.setFocusable(true);
                mainWindow.show();
                mainWindow.setFocusable(false);
            }
        },
        {
            label: 'Reload Widgets', click: function () {
                mainWindow.reload();
            }
        },
        {
            label: 'DevTools', click: function () {
                mainWindow.webContents.openDevTools()
            }
        },
        {
            label: 'Exit', click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('IllusionEngine');
    tray.setContextMenu(contextMenu);

});

var widget_dir = "/widgets/";
var appdata = "appdata.json";

function runexternalcommand(processid) {
    // check if processid has been asigned. If not, prompt the user to add a new process or select from list
    // Else, run the saved process.

    // read saved appdata

    try {
        const datapath = path.join(__dirname, appdata);

        let rawdata = fs.readFileSync(datapath);
        let data = JSON.parse(rawdata);

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

function createPrompt(processid) {
    // call main.js to make prompt window

    // debug
    promptCallback(processid, "chipi.gif");
}

function promptCallback(processid, value) {
    // creates 'appdata' file if it doesn't exist, also 'widgets' and 'processid' data vars, and then sets it's value
    try {
        var datapath = path.join(__dirname, appdata);
        if (fs.existsSync(datapath)) {
            let rawdata = fs.readFileSync(datapath);
            let data = JSON.parse(rawdata);

            data["widgets"][processid] = value;

            let jsondata = JSON.stringify(data);
            fs.writeFileSync(datapath, jsondata);

            run(value);
        }
        else {
            let data = {};

            data["widgets"][processid] = value;

            let jsondata = JSON.stringify(data);
            fs.writeFileSync(datapath, jsondata);

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

function run(process) {
    exec('Notepad.exe');
}

ipcMain.on('write-json', (event, arg) => {
    console.log(arg + " requested to save .json");

    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    writeJSON(arg[0], arg[1]);
});

function writeJSON(id, data) {
    // write json to file, probably safe

    let jsondata = JSON.stringify(data);
    fs.writeFileSync(path.join(__dirname, widget_dir, id, 'savedata.json'), jsondata);
}

ipcMain.on('fetch-json', (event, arg) => {
    console.log(arg + " requested saved .json");

    // works like `send`, but returning a message back
    // to the renderer that sent the original message
    const value = fetchJSON(arg);
    event.reply('fetch-reply', [arg, value]);
});

function fetchJSON(id) {
    // get json from file
    try {
        let rawdata = fs.readFileSync(path.join(__dirname, widget_dir, id, 'savedata.json'));
        let data = JSON.parse(rawdata);
        return data;
    } catch (err) {
        return { };
    }
}