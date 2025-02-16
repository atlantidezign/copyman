const {app, BrowserWindow, ipcMain, dialog, nativeImage, nativeTheme, Tray, Menu, shell} = require('electron')
const path = require('path');
const fs = require('fs');

let inDebug = false;
if (process.argv.indexOf('--inDebug') > -1) { inDebug = true;}

nativeTheme.themeSource = 'system';

function createWindow() {
    const appIcon = nativeImage.createFromPath(path.join(__dirname, 'images/256x256.png'))
    const win = new BrowserWindow({
        width: 960,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Per semplicità in questo esempio; in produzione va gestito in modo più sicuro.
        },
        icon: appIcon
    });

    win.loadFile('index.html');

    ipcMain.on('re-render', () => {
        win.loadFile('index.html')
    })
}

app.whenReady().then(() => {
    createWindow();

    //tray
    const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'images/256x256.png'));
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
            {type: 'separator'},
            {
                label: 'Clear Filter',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-filter-clear')
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
            {type: 'separator'},
            {
                label: 'Copy Selected Items',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-copy-start')
                }
            }
            ,
            {type: 'separator'},
            {
                label: 'Save Settings',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-settings-save')
                }
            },
            {
                label: 'Load Saved Settings',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-settings-load')
                }
            },
            {
                label: 'Clean Saved Settings',
                click: () => {
                    event.sender.send('context-menu-command', 'menu-settings-clean')
                }
            },
            {type: 'separator'},
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
                    label: 'Usage',
                    click: () => {
                        let usageText = `You need to choose a *Source* folder and at least one *Destination* folder.  
Use the *Clear* buttons to remove the folder selections.

Within the *tree view*, you can *select* the items to copy (whether files or folders) using checkboxes.

You can navigate within the tree by *expanding* or *collapsing* branches.  
You can also use the two buttons for *Expand or Collapse All*.

To assist with selection, you can use the *Filters*.
- By clicking the *Set* button, it selects the items that contain the specified string while deselecting the others.
- By clicking the *Add* button, it adds the items that match, without altering the others.
- By clicking the *Remove* button, it removes any selected items that match from the selection.
- Using the *Clear* button, it removes the filter.  
  Additionally, you can use the two buttons for *Select or Deselect All*.

There are some options that affects copying and selecting behaviours.
- *Propagate* to choose if propagate selection of an item to parent and childen elements
- *Overwrite* to choose if overwrite or not files that already exist.

With the *Copy Selected Items* button, the files are copied from the Source to the Destinations.

Pay attention: Copy mode is strict on selection: only and exclusively the selected items will be copied. For example, if a folder is selected but only some of the files inside it are selected, copy only those.                    
`;
                        const options = {
                            title: 'Usage',
                            message: 'Usage',
                            detail: usageText
                        };

                        dialog.showMessageBox(null, options, (response, checkboxChecked) => {
                        });


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

    // Business: Gestione chiamate per selezionare una cartella (sia per la sorgente che per la destinazione)
    ipcMain.handle('select-folder', async (event, title) => {
        const result = await dialog.showOpenDialog({
            title: title,
            properties: ['openDirectory']
        });
        if (result.canceled === false && result.filePaths.length > 0) {
            return result.filePaths[0];
        }
        return null;
    });

    //launch
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

Menu.setApplicationMenu(null)
