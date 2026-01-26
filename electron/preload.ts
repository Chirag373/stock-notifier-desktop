import { contextBridge } from 'electron';

// Access to Node.js APIs in the renderer process
// Since contextIsolation is false in main.ts, we don't strictly need this for now,
// but it's here for structure.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions] || '')
    }
})
