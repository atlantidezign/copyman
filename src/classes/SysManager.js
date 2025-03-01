// SysManager.js
class SysManager {
    constructor() {
    }

    init() {
        // Live reload
        (async () => {
            const watcher_html = fs.watch('./src/index.html');
            watcher_html.on('change', () => {
                ipcRenderer.send('re-render');
            });
            const watcher_css = fs.watch('./src/index.css');
            watcher_css.on('change', () => {
                ipcRenderer.send('re-render');
            });
        })();

        //Links
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'A' && target.href.startsWith('http')) {
                event.preventDefault();
                shell.openExternal(target.href);
            }
        });

        //Context menu
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            ipcRenderer.send('show-context-menu')
        })
        ipcRenderer.on('context-menu-command', (e, command) => {
            switch (command) {
                case 'menu-source-select':
                    document.getElementById('selectSource').click();
                    break;
                case 'menu-source-clear':
                    document.getElementById('clearSource').click();
                    break;
                case 'menu-destinations-add':
                    document.getElementById('addDestination').click();
                    break;
                case 'menu-destinations-clear':
                    document.getElementById('clearAllDestinations').click();
                    break;
                case 'menu-source-swap':
                    document.getElementById('buttonSwap').click();
                    break;
                case 'menu-filter-name-clear':
                    document.getElementById('clearNameFilter').click();
                    break;
                case 'menu-filter-date-clear':
                    document.getElementById('clearDateFilter').click();
                    break;
                case 'menu-filter-size-clear':
                    document.getElementById('clearSizeFilter').click();
                    break;
                case 'menu-filter-all-clear':
                    document.getElementById('deselectAll').click();
                    break;
                case 'menu-expand-all':
                    document.getElementById('expandAll').click();
                    break;
                case 'menu-collapse-all':
                    document.getElementById('collapseAll').click();
                    break;
                case 'menu-select-all':
                    document.getElementById('selectAll').click();
                    break;
                case 'menu-deselect-all':
                    document.getElementById('deselectAll').click();
                    break;
                case 'menu-copy-start':
                    document.getElementById('copySelected').click();
                    break;
                case 'menu-open-options':
                    document.getElementById('modalOptionsTrigger').click();
                    break;
                case 'menu-open-snapshots':
                    document.getElementById('modalSnapshotTrigger').click();
                    break;
                case 'menu-help':
                    document.getElementById('modalHelpTrigger').click();
                    break;
                case 'menu-about':
                    document.getElementById('modalAboutTrigger').click();
                    break;
            }
        });
        ipcRenderer.on('main-menu-command', (e, command) => {
            switch (command) {
                case 'menu-about':
                    document.getElementById('modalAboutTrigger').click();
                    break;
                case 'menu-help':
                    document.getElementById('modalHelpTrigger').click();
                    break;
            }
        });

        //Title
        document.addEventListener('DOMContentLoaded', () => {
            document.title += ` v${App.model.appVersion}`;
        });
    }

}

module.exports = SysManager;