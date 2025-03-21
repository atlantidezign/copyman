// SysManager.js
class SysManager {
    constructor() {
    }

    init() {
        // Live reload //TODO remove for production build
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
                case 'menu-source-refresh':
                    document.getElementById('refreshSource').click();
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
                case 'menu-filter-diffs-clear':
                    document.getElementById('clearDiffsFilter').click();
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
                case 'menu-update':
                    App.sysManager.checkUpdate();
                    break;
            }
        });

        //Title
        document.addEventListener('DOMContentLoaded', () => {
            document.title += ` v${App.model.appVersion}`;
        });
    }

    async checkUpdate() {
        App.utils.writeMessage('Checking for updates...');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        let os = await App.utils.getOS();
        let currentVersion = App.model.appVersion;
        let onlineVersion = "";

        try {
            const response = await fetch("https://www.copyman.it/download/build.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            onlineVersion = data[os];

            if (compareVersions(onlineVersion, currentVersion) > 0) {
                App.utils.showAlert("An update v" +onlineVersion+ " is available for Copyman v"+currentVersion+".\nGo to Copyman Website to download it.");
                App.utils.writeMessage("New version available: v" +onlineVersion+ " | Current version: v"+currentVersion);
            } else {
                App.utils.showAlert("Copyman is up to date.");
                App.utils.writeMessage("Copyman is up to date.");
            }
        } catch (error) {
            console.error("Error while checking update:", error);
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);

        function compareVersions(v1, v2) {
            const parts1 = v1.split('.').map(Number);
            const parts2 = v2.split('.').map(Number);
            const maxLen = Math.max(parts1.length, parts2.length);

            for (let i = 0; i < maxLen; i++) {
                const num1 = parts1[i] || 0;
                const num2 = parts2[i] || 0;
                if (num1 > num2) {
                    return 1;
                } else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }

    }
}

module.exports = SysManager;