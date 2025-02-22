const {app, BrowserWindow, ipcMain, dialog, nativeImage, nativeTheme, Tray, Menu, shell} = require('electron')
const path = require('path');
const fs = require('fs');
const os = require('os');

let inDebug = false;
if (process.argv.indexOf('--inDebug') > -1) { inDebug = true;}

nativeTheme.themeSource = 'system';

function createWindow() {
    const appIcon = nativeImage.createFromPath(path.join(__dirname, 'images','256x256.png'))
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false // Per semplicità in questo esempio; in produzione va gestito in modo più sicuro.
        },
        icon: appIcon
    });

    win.loadFile('src/index.html');

    ipcMain.on('re-render', () => {
        win.loadFile('src/index.html')
    })
    return win;
}

app.whenReady().then(() => {
    let win = createWindow();

    //tray
    const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'images','256x256.png'));
    let tray = new Tray(trayIcon);
    const trayTemplate = [
        {
            label: 'Copyman',
            type: 'normal',
            click: () => {
                /* Later this will open the Main Window */
            }
        },
        {
            label: 'Quit',
            type: 'normal',
            click: () => app.quit()
        }
    ];
    const trayMenu = Menu.buildFromTemplate(trayTemplate);
    tray.setToolTip('Copyman');
    tray.setContextMenu(trayMenu);

    //context menu
    ipcMain.on('show-context-menu', (event) => {
        const contextTemplate = [
            {
                label: 'Select Source',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-source-select')
                }
            },
            {
                label: 'Clear Source',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-source-clear')
                }
            },
            {
                label: 'Add Destination',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-destinations-add')
                }
            },
            {
                label: 'Clear Destinations',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-destinations-clear')
                }
            },
            {
                label: 'Swap Source/Destination',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-source-swap')
                }
            },
            {type: 'separator'},
            {
                label: 'Copy Selected Items',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-copy-start')
                }
            },
            {type: 'separator'},
            {
                label: 'Clear Name Filters',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-filter-name-clear')
                }
            },
            {
                label: 'Clear Date Filters',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-filter-date-clear')
                }
            },
            {
                label: 'Clear Size Filters',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-filter-size-clear')
                }
            },
            {
                label: 'Clear All Filters',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-filter-all-clear')
                }
            },
            {type: 'separator'},
            {
                label: 'Select All',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-select-all')
                }
            },
            {
                label: 'Deselect All',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-deselect-all')
                }
            },
            {
                label: 'Expand All',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-expand-all')
                }
            },
            {
                label: 'Collapse All',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-collapse-all')
                }
            },
            {type: 'separator'},
            {
                label: 'Options',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-open-options')
                }
            },
            {
                label: 'Snapshots',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-open-snapshots')
                }
            },
            {type: 'separator'},
            {
                label: 'Help',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-help')
                }
            },
            {role: 'reload'}
        ]
        const menu = Menu.buildFromTemplate(contextTemplate)
        menu.popup({window: BrowserWindow.fromWebContents(event.sender)})
    })

    //Main menu
    const isMac = process.platform === 'darwin'
    const mainTemplate = [
        // { role: 'appMenu' }
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideOthers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }]
            : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [

                isMac ? {role: 'close'} : {role: 'quit'}
            ]
        },
        // { role: 'editMenu' }
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                ...(isMac
                    ? [
                        {type: 'separator'},
                        {role: 'front'},
                        {type: 'separator'},
                        {role: 'window'}
                    ]
                    : [
                        {role: 'close'}
                    ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        win.webContents.send('main-menu-command', 'menu-about')
                    }
                },{
                    label: 'Usage',
                    click: () => {
                        win.webContents.send('main-menu-command', 'menu-help')
                    }
                },
                {
                    label: 'Website',
                    click: async () => {
                        const {shell} = require('electron')
                        await shell.openExternal('https://www.atlantide-design.it/copyman')
                    }
                }
            ]
        },
        ...(inDebug
            ? [{
                label: "Dev",
                submenu: [
                    {role: 'toggleDevTools'}
                ]
            }]
            : [])
    ]
    const mainMenu = Menu.buildFromTemplate(mainTemplate)
    Menu.setApplicationMenu(mainMenu);

    // Business: dialog for selecting source/destination folder.
    ipcMain.handle('select-folder', async (event, title, lastPath) => {
        const result = await dialog.showOpenDialog({
            title: title,
            defaultPath: lastPath,
            properties: ['openDirectory']
        });
        if (result.canceled === false && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    // Business: dialog for load/save files
    ipcMain.handle('select-export-selection-file', async (event, dataToExport, kind) => {
        const pad = (number) => (number < 10 ? '0' + number : number);
        const now = new Date();
        const defaultFileName = `copyman_selection_export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.${kind}`;
        const options = {
            title: 'Export selection as JSON file',
            defaultPath: defaultFileName,
            buttonLabel: 'Export'
        };
        let useText = "";
        if (kind == 'json') {
            options.filters = [{ name: 'JSON', extensions: ['json'] }]
            useText = JSON.stringify(dataToExport, null, 2);
        } else if (kind == 'csv') {
            options.filters = [{ name: 'CSV', extensions: ['csv'] }]
            useText = createCsv(dataToExport);
        } else {
            useText = dataToExport;
        }
        const result = await dialog.showSaveDialog(options);
        if (!result.canceled && result.filePath) {
            try {
                fs.writeFileSync(result.filePath, useText);
            } catch (err) {
                return false
            }
            return true;
        }
        return false;
    });
    ipcMain.handle('select-import-snapshot-file', async (event, title, lastPath) => {
        const result = await dialog.showOpenDialog({
            title: title,
            defaultPath: lastPath,
            properties: ['openFile'],
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (result.canceled === false && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });
    ipcMain.handle('select-export-snapshot-file', async (event, dataToExport) => {
        const pad = (number) => (number < 10 ? '0' + number : number);
        const now = new Date();
        const defaultFileName = `copyman_snapshot_export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.json`;
        const options = {
            title: 'Export Snapshot as JSON file',
            defaultPath: defaultFileName,
            buttonLabel: 'Export',
            filters : [{ name: 'JSON', extensions: ['json'] }]
        };
        let useText = JSON.stringify(dataToExport, null, 2);
        const result = await dialog.showSaveDialog(options);
        if (!result.canceled && result.filePath) {
            try {
                fs.writeFileSync(result.filePath, useText);
            } catch (err) {
                return false
            }
            return true;
        }
        return false;
    });

    //Business: alert e confirm
    ipcMain.handle("show-alert", (e, message) => {
        dialog.showMessageBox(win, { title: "Copyman | Alert", message: message });
    });
    ipcMain.handle('show-confirm', async (event, title) => {
        const result = await dialog.showMessageBox(win, {
            'type': 'question',
            'title': 'Copyman | Confirmation',
            'message': title,
            'buttons': [
                'Yes',
                'No'
            ]
        })
        if (result.response === 0) {
            return true;
        } else {
            return false;
        }
    });

    //launch
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) { win = createWindow(); }
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

Menu.setApplicationMenu(null)

//utils
function createCsv(dataToExport) {
    if (!dataToExport || dataToExport.length === 0) {
        return '';
    }
    const headers = Object.keys(dataToExport[0]);
    function encloseInQuotes(text) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    function formatField(field) {
        if (field == null) {
            return '';
        }
        if (field instanceof Date) {
            return encloseInQuotes(field.toLocaleDateString());
        }
        if (field.indexOf(' GMT') >= 0) {
            return encloseInQuotes((new Date(field)).toLocaleDateString());
        }
        if (typeof field === 'string') {
            return encloseInQuotes(field);
        }
        const fieldString = field.toString();
        if (fieldString.includes(';') || fieldString.includes('"') || fieldString.includes('\n')) {
            return encloseInQuotes(fieldString);
        }
        return fieldString;
    }
    const csvRows = [];
    csvRows.push(headers.map(header => encloseInQuotes(header)).join(';'));
    dataToExport.forEach(item => {
        const row = headers.map(header => formatField(item[header])).join(';');
        csvRows.push(row);
    });
    return csvRows.join('\n');
}

