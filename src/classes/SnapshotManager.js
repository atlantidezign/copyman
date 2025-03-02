// SnapshotManager.js
class SnapshotManager {
    constructor() {
    }

    init() {
//Snapshot actions
        document.getElementById('saveSnapshot').addEventListener('click', this.saveSnapshot.bind(this));
        document.getElementById('loadSnapshot').addEventListener('click', this.loadSnapshot.bind(this));
        document.getElementById('cleanSnapshot').addEventListener('click', this.cleanSnapshot.bind(this));
        document.getElementById('cleanAllSnapshots').addEventListener('click', this.cleanAllSnapshots.bind(this));
        document.getElementById('exportSnapshot').addEventListener('click', this.exportSnapshot.bind(this));
        document.getElementById('importSnapshot').addEventListener('click', this.importSnapshot.bind(this));
    }

    listSnapshots() {
        let selectEl = document.getElementById('loadSnapshotInput');
        selectEl.innerHTML = '';
        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }
        if (useSettings.length > 0) {
            useSettings.reverse();
            useSettings.forEach((element, index) => {
                //load all names, append to selectEl and select frist one
                let name = element.name;
                let opt = document.createElement("option");
                opt.value = element.name;
                opt.text = element.name;
                if (index === 0) {
                    opt.selected = true;
                }
                selectEl.appendChild(opt);
            });
        }
    }
    async saveSnapshot() {
        let useName = document.getElementById('saveSnapshotInput').value.trim().toLowerCase();
        if (!useName) {
            App.utils.showAlert('Please enter a name for Snapshot to save.');
            return;
        }
        document.getElementById('saveSnapshotInput').value = useName;

        if (App.model.sourceFolder === '' && App.model.destinationFolders.length === 0 && App.model.filtersDateMinus.length == 0 && App.model.filtersDatePlus.length === 0 &&
            App.model.filtersSizeMinus.length === 0 && App.model.filtersSizePlus.length === 0 && App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0) {
            App.utils.showAlert('Please enter some Folder/Filter to save.');
            return;
        }

        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }

        const index = useSettings.findIndex(setting => setting.name === useName);
        if (index !== -1) {
            let confirmation = await App.utils.showConfirmWithReturn('A Snaphstot with name "' + useName + '" already exists. Do you want to overwrite it?');
            if (confirmation) {
                useSettings.splice(index, 1);
                App.utils.writeMessage(`Old Snapshot named "${useName}" removed.`);
            } else {
                App.utils.writeMessage('Snapshot "'+useName+'" not saved.');
                return;
            }
        }

        let newSettings = {
            name: useName,
            //source and destinations folders
            sourceFolder: App.model.sourceFolder,
            destinationFolders: App.model.destinationFolders,
            //user settings (overwrite, propagate + nuovi)
            fileOverwrite: App.model.fileOverwrite,
            copyVerbose: App.model.copyVerbose,
            copyReport: App.model.copyReport,
            propagateSelections: App.model.propagateSelections,
            relationshipOR: App.model.relationshipOR,
            //filters (name + nuovi)
            filtersNamePlus: App.model.filtersNamePlus,
            filtersNameMinus: App.model.filtersNameMinus,
            filtersDatePlus: App.model.filtersDatePlus,
            filtersDateMinus: App.model.filtersDateMinus,
            filtersSizePlus: App.model.filtersSizePlus,
            filtersSizeMinus: App.model.filtersSizeMinus,
        }
        useSettings.push(newSettings);
        // serialize and save in localStorage
        localStorage.setItem('snapshots', JSON.stringify(useSettings));
        this.listSnapshots();
        App.utils.writeMessage('Snapshot "'+useName+'" saved.');
    }
    loadSnapshot() {
        App.utils.writeMessage('Loading Snapshot...');
        let useName = document.getElementById('loadSnapshotInput').value.trim().toLowerCase();
        if (!useName) {
            App.utils.showAlert('Please enter a name for Snapshot to load.');
            return;
        }
        // get from localStorage
        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }
        let settings = useSettings.find((setting) => setting.name === useName);
        if (!settings) {
            App.utils.writeMessage('No saved Snapshot found with name "' + useName + '"');
            return;
        }
        this.setFromSnapshot(settings);
    }
    async cleanSnapshot() {
        let useName = document.getElementById('loadSnapshotInput').value.trim().toLowerCase();
        if (!useName) {
            App.utils.showAlert('Please enter a name for Snapshot to remove.');
            return;
        }

        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }

        const index = useSettings.findIndex(setting => setting.name === useName);
        if (index !== -1) {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to remove Saved Snapshot named ' + useName + '?');
            if (confirmation) {
                useSettings.splice(index, 1);
                localStorage.setItem('snapshots', JSON.stringify(useSettings));
                this.listSnapshots();
                App.utils.writeMessage(`Snapshot named "${useName}" removed.`);
            }
        } else {
            App.utils.writeMessage(`No Snapshot with name "${useName}".`);
        }
    }
    async cleanAllSnapshots() {
        let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to Clean all saved Snapshots?');
        if (confirmation) {
            localStorage.removeItem('snapshots');
            this.listSnapshots();
            App.utils.writeMessage('Snapshots cleaned.');
        }
    }
    async exportSnapshot() {
        let useName = document.getElementById('saveSnapshotInput').value.trim().toLowerCase();
        if (!useName) {
            App.utils.showAlert('Please enter a name for Snapshot to export.');
            return;
        }
        document.getElementById('saveSnapshotInput').value = useName;

        if (App.model.sourceFolder === '' && App.model.destinationFolders.length === 0 && App.model.filtersDateMinus.length == 0 && App.model.filtersDatePlus.length === 0 &&
            App.model.filtersSizeMinus.length === 0 && App.model.filtersSizePlus.length === 0 && App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0) {
            App.utils.showAlert('Please enter some Folder/Filter to save.');
            return;
        }

        let newSettings = {
            name: useName,
            //source and destinations folders
            sourceFolder: App.model.sourceFolder,
            destinationFolders: App.model.destinationFolders,
            //user settings (overwrite, propagate + nuovi)
            fileOverwrite: App.model.fileOverwrite,
            copyVerbose: App.model.copyVerbose,
            copyReport: App.model.copyReport,
            propagateSelections: App.model.propagateSelections,
            relationshipOR: App.model.relationshipOR,
            //filters (name + nuovi)
            filtersNamePlus: App.model.filtersNamePlus,
            filtersNameMinus: App.model.filtersNameMinus,
            filtersDatePlus: App.model.filtersDatePlus,
            filtersDateMinus: App.model.filtersDateMinus,
            filtersSizePlus: App.model.filtersSizePlus,
            filtersSizeMinus: App.model.filtersSizeMinus,
        }

        App.utils.writeMessage('Choose Snapshot JSON file for Export.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const saved = await ipcRenderer.invoke('select-export-snapshot-file', newSettings);
        if (saved) {
            App.utils.writeMessage('Shapshot exported successfully.');
        } else {
            App.utils.writeMessage('Shapshot not exported.');
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }
    async importSnapshot() {
        App.utils.writeMessage('Choose Snapshot JSON file for Import.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const filePath = await ipcRenderer.invoke('select-import-snapshot-file', 'Select Snapshot File to Import');
        if (!filePath) {
            App.utils.showAlert('Nessun file selezionato per l\'import dello Snapshot.');
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
            return;
        }

        let fileContent = '';
        try {
            fileContent = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`Error reading JSON Snapshot file ${filePath}: ${error.message}`);
            App.utils.writeMessage(`Error reading JSON Snapshot file.`);
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
            return;
        }

        let settings;
        try {
            settings = JSON.parse(fileContent);
            this.setFromSnapshot(settings);
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
        } catch (error) {
            console.error(`Error on JSON Snapshot file parsing: ${error.message}`);
            App.utils.writeMessage(`Error on JSON Snapshot file parsing.`);
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
            return;
        }
    }
    setFromSnapshot(settings) {
        try {
            App.filtersManager.removeAllFilters();

            // update global app vars
            App.model.sourceFolder = settings.sourceFolder || '';
            App.model.destinationFolders = settings.destinationFolders || [];
            App.model.fileOverwrite = (typeof settings.fileOverwrite === 'number') ? settings.fileOverwrite : App.model.fileOverwriteDefault;
            App.model.copyVerbose = (typeof settings.copyVerbose === 'boolean') ? settings.copyVerbose : App.model.copyVerboseDefault;
            App.model.copyReport = (typeof settings.copyReport === 'boolean') ? settings.copyReport : App.model.copyReportDefault;
            App.model.propagateSelections = (typeof settings.propagateSelections === 'boolean') ? settings.propagateSelections : App.model.propagateSelectionsDefault;
            App.model.relationshipOR = (typeof settings.relationshipOR === 'boolean') ? settings.relationshipOR : App.model.relationshipORDefault;
            App.model.filtersNamePlus = settings.filtersNamePlus || [];
            App.model.filtersNameMinus = settings.filtersNameMinus || [];
            App.model.filtersDatePlus = settings.filtersDatePlus || [];
            App.model.filtersDateMinus = settings.filtersDateMinus || [];
            App.model.filtersSizePlus = settings.filtersSizePlus || [];
            App.model.filtersSizeMinus = settings.filtersSizeMinus || [];

            App.optionsManager.updateOptionsUI();

            document.getElementById('sourcePath').textContent = App.model.sourceFolder;
            App.treeManager.updateTree();

            App.copyManager.updateDestinationList();

            // update snaphot name
            document.getElementById('saveSnapshotInput').value = settings.name;

            App.filtersManager.applyAllFilters();

            App.utils.writeMessage('Snapshot loaded.');
        } catch (error) {
            console.error("Error during loading of Snapshot "+settings.name+":", error);
            App.utils.writeMessage("Error during loading of Snapshot "+settings.name+".");
        }
    }
}

module.exports = SnapshotManager;