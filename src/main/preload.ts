import { contextBridge, ipcRenderer } from "electron";
import type * as ContextBridgeMethods from '@main/ContextBridge';

export const API_NAME = 'illusion_engine' as const;

export const API = {
    ...(ipcRenderer.sendSync("init-context-bridge") as string[])
        .map(key => [key, (...args: any[]) => (console.log(args), ipcRenderer.invoke(key, ...args))])
        .reduce(
            (prev, [key, method]) => (prev[key as keyof typeof ContextBridgeMethods] = method, prev),
            {} as any
        ) as typeof ContextBridgeMethods
} as const;

contextBridge.exposeInMainWorld(API_NAME, API);