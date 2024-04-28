import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron';
import path from 'path';
import * as ContextBridgeMethods from '@main/ContextBridge';

const createWindow = function () {
    const window = new BrowserWindow({
        fullscreen: true,
        resizable: false,
        movable: false,
        minimizable: false,
        transparent: true,
        // focusable: false,
        frame: false,
        // type: 'desktop',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    window.setFullScreen(true);
    // window.webContents.openDevTools();

    window.loadFile(path.join(__dirname, 'index.html'));

    const icon = nativeImage.createFromPath('./app.ico');
    const tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show Widgets', click: function () {
                window.setFocusable(true);
                window.show();
                window.setFocusable(false);
            }
        },
        {
            label: 'Reload Widgets', click: function () {
                window.reload();
            }
        },
        {
            label: 'DevTools', click: function () {
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

    return window;
};

app.disableHardwareAcceleration();

app.on('ready', () => {
    createWindow();
});

for (const channel in ContextBridgeMethods) {
    //@ts-expect-error TS fails to realize that channel is by definition a valid key for ContextBridgeMethods
    //we dont want to do anything with the event yet
    ipcMain.handle(channel, (_event, ...args) => ContextBridgeMethods[channel](...args));
}

ipcMain.on("init-context-bridge", (e) => {
    e.returnValue = Object.keys(ContextBridgeMethods);
});
