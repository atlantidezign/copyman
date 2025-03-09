// SnapshotManager.js
class SnapshotManager {
    constructor() {
    }

    init() {
        // Snapshot actions
        document.getElementById('saveSnapshot').addEventListener('click', this.saveSnapshot.bind(this));
        document.getElementById('loadSnapshot').addEventListener('click', this.loadSnapshot.bind(this));
        document.getElementById('cleanSnapshot').addEventListener('click', this.cleanSnapshot.bind(this));
        document.getElementById('cleanAllSnapshots').addEventListener('click', this.cleanAllSnapshots.bind(this));
        document.getElementById('exportSnapshot').addEventListener('click', this.exportSnapshot.bind(this));
        document.getElementById('importSnapshot').addEventListener('click', this.importSnapshot.bind(this));

        // Queue actions
        this.setupaddToQueue();
        this.setupclearQueue();
        this.setupexecuteQueue();
    }

    listSnapshots() {
        let selectEl = document.getElementById('loadSnapshotInput');
        selectEl.innerHTML = '';
        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }
        let snapshotsList = [];
        if (useSettings.length > 0) {
            useSettings.reverse();
            useSettings.forEach((element, index) => {
                //load all names, append to selectEl and select first one
                let name = element.name;
                let opt = document.createElement("option");
                opt.value = name;
                opt.text = name;
                if (index === 0) {
                    opt.selected = true;
                }
                selectEl.appendChild(opt);

                snapshotsList.push(element.name);
            });
        }
        this.listQueue(snapshotsList);
    }

    async saveSnapshot() {
        let useName = document.getElementById('saveSnapshotInput').value.trim().toLowerCase();
        if (!useName) {
            App.utils.showAlert('Please enter a name for Snapshot to save.');
            return;
        }
        document.getElementById('saveSnapshotInput').value = useName;

        if (App.model.sourceFolder === '' && App.model.destinationFolders.length === 0 && App.model.filtersDateMinus.length === 0 && App.model.filtersDatePlus.length === 0 &&
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
            let confirmation = await App.utils.showConfirmWithReturn('A Snapshot with name "' + useName + '" already exists. Do you want to overwrite it?');
            if (confirmation) {
                useSettings.splice(index, 1);
                App.utils.writeMessage(`Old Snapshot named "${useName}" removed.`);
            } else {
                App.utils.writeMessage('Snapshot "' + useName + '" not saved.');
                return;
            }
        }

        let newSettings = this.createSnapshotObject(useName);
        useSettings.push(newSettings);
        // serialize and save in localStorage
        localStorage.setItem('snapshots', JSON.stringify(useSettings));
        this.listSnapshots();
        App.utils.writeMessage('Snapshot "' + useName + '" saved.');
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

    createSnapshotObject(useName) {
        let newSettings = {
            name: useName,
            // source and destinations folders
            sourceFolder: App.model.sourceFolder,
            destinationFolders: App.model.destinationFolders,
            // user settings
            fileOverwrite: App.model.fileOverwrite,
            copyVerbose: App.model.copyVerbose,
            copyReport: App.model.copyReport,
            abortFullQueue: App.model.abortFullQueue,
            dontConfirmQueue: App.model.dontConfirmQueue,
            propagateSelections: App.model.propagateSelections,
            clickOnNamesToSelect: App.model.clickOnNamesToSelect,
            relationshipOR: App.model.relationshipOR,
            sortOrder: App.model.sortOrder,
            maintainLogs: App.model.maintainLogs,
            splitScreen: App.model.splitScreen,
            saveSelection: App.model.saveSelection,
            // filters
            filtersNamePlus: App.model.filtersNamePlus,
            filtersNameMinus: App.model.filtersNameMinus,
            filtersDatePlus: App.model.filtersDatePlus,
            filtersDateMinus: App.model.filtersDateMinus,
            filtersSizePlus: App.model.filtersSizePlus,
            filtersSizeMinus: App.model.filtersSizeMinus,
            // selection list
            selectionList: []
        }
        if (App.model.saveSelection) {
            newSettings.selectionList = App.snapshotManager.getListOfSelectedItemsForSnapshot();
        }
        return newSettings
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
            let queueText = '';
            if (App.model.queue.indexOf(useName) >= 0) { queueText = ' It will be removed also from Queue.'}
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to remove Saved Snapshot named ' + useName + '?' + queueText);
            if (confirmation) {
                useSettings.splice(index, 1);

                App.model.queue.splice(App.model.queue.indexOf(useName), 1);
                App.snapshotManager.saveQueue();

                localStorage.setItem('snapshots', JSON.stringify(useSettings));
                this.listSnapshots();
                App.utils.writeMessage(`Snapshot named "${useName}" removed.`);
            }
        } else {
            App.utils.writeMessage(`No Snapshot with name "${useName}".`);
        }
    }

    async cleanAllSnapshots() {
        let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to Clean all saved Snapshots? It will also clear the Queue.');
        if (confirmation) {
            App.model.queue = [];
            App.snapshotManager.saveQueue();
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

        if (App.model.sourceFolder === '' && App.model.destinationFolders.length === 0 && App.model.filtersDateMinus.length === 0 && App.model.filtersDatePlus.length === 0 &&
            App.model.filtersSizeMinus.length === 0 && App.model.filtersSizePlus.length === 0 && App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0) {
            App.utils.showAlert('Please enter some Folder/Filter to save.');
            return;
        }

        let newSettings = this.createSnapshotObject(useName);

        App.utils.writeMessage('Choose Snapshot JSON file for Export.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const saved = await ipcRenderer.invoke('select-export-snapshot-file', newSettings);
        if (saved) {
            App.utils.writeMessage('Snapshot exported successfully.');
        } else {
            App.utils.writeMessage('Snapshot not exported.');
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
            App.utils.showAlert('No file selected for Snapshot import.');
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
            App.model.abortFullQueue = (typeof settings.abortFullQueue === 'boolean') ? settings.abortFullQueue : App.model.abortFullQueueDefault;
            App.model.dontConfirmQueue = (typeof settings.dontConfirmQueue === 'boolean') ? settings.dontConfirmQueue : App.model.dontConfirmQueueDefault;
            App.model.propagateSelections = (typeof settings.propagateSelections === 'boolean') ? settings.propagateSelections : App.model.propagateSelectionsDefault;
            App.model.clickOnNamesToSelect = (typeof settings.clickOnNamesToSelect === 'boolean') ? settings.clickOnNamesToSelect : App.model.clickOnNamesToSelectDefault;
            App.model.relationshipOR = (typeof settings.relationshipOR === 'boolean') ? settings.relationshipOR : App.model.relationshipORDefault;
            App.model.maintainLogs = (typeof settings.maintainLogs === 'boolean') ? settings.maintainLogs : App.model.maintainLogsDefault;
            App.model.splitScreen = (typeof settings.splitScreen === 'boolean') ? settings.splitScreen : App.model.splitScreenDefault;
            App.model.saveSelection = (typeof settings.saveSelection === 'boolean') ? settings.saveSelection : App.model.saveSelectionDefault;
            App.model.sortOrder = (typeof settings.sortOrder === 'string') ? settings.sortOrder : App.model.sortOrderDefault;
            App.model.filtersNamePlus = settings.filtersNamePlus || [];
            App.model.filtersNameMinus = settings.filtersNameMinus || [];
            App.model.filtersDatePlus = settings.filtersDatePlus || [];
            App.model.filtersDateMinus = settings.filtersDateMinus || [];
            App.model.filtersSizePlus = settings.filtersSizePlus || [];
            App.model.filtersSizeMinus = settings.filtersSizeMinus || [];

            App.optionsManager.updateOptionsUI();
            App.uiManager.updateSplitScreen();

            document.getElementById('sourcePath').textContent = App.model.sourceFolder;
            App.treeManager.updateSourceTree();

            App.copyManager.updateDestinationList();

            // update snapshot name
            document.getElementById('saveSnapshotInput').value = settings.name;

            // apply filters
            App.filtersManager.applyAllFilters();

            //apply selection
            if (App.model.saveSelection && settings.selectionList && settings.selectionList.length > 0) {
                const fileTree = document.getElementById('file-tree');
                const allCheckboxes = fileTree.querySelectorAll('input[type="checkbox"]');
                allCheckboxes.forEach(checkbox => {
                    if (settings.selectionList.indexOf(checkbox.dataset.filePath) >= 0) {
                        checkbox.checked = true;
                    }
                });
            }

            //update stats
            App.selectionListManager.updatetSelectionStats();

            App.utils.writeMessage('Snapshot loaded.');
        } catch (error) {
            console.error("Error during loading of Snapshot " + settings.name + ":", error);
            App.utils.writeMessage("Error during loading of Snapshot " + settings.name + ".");
        }
    }

    getListOfSelectedItemsForSnapshot() {
        const fileTree = document.getElementById('file-tree');
        const checkedCheckboxes = fileTree.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkedCheckboxes).map(item => item.dataset.filePath);
    }

    // Queue
    listQueue(snapshotsList) {
        let selectEl = document.getElementById('queueSelect');
        selectEl.innerHTML = '';
        snapshotsList.forEach((element, index) => {
            let name = element;
            let opt = document.createElement("option");
            opt.value = name;
            opt.text = name;
            if (index === 0) {
                opt.selected = true;
            }
            selectEl.appendChild(opt);
        });
        this.loadQueue();
        this.renderQueue();
    }

    // Save the queue to localStorage
    saveQueue() {
        let queueName = "default"
        localStorage.setItem("queue", JSON.stringify([
                {
                    name: queueName,
                    items: App.model.queue
                }
            ]));
    }

    // Load the queue from localStorage
    loadQueue() {
        const storedQueue = localStorage.getItem("queue");
        if (storedQueue) {
            if (storedQueue.length > 0) {
                try {
                    let fullQueue = JSON.parse(storedQueue);
                    App.model.queue = fullQueue[0].items;
                } catch (e) {
                    console.error('Error parsing queue from localStorage', e);
                    App.utils.writeMessage(`Error on JSON Queue file parsing.`);
                    App.model.queue = [];
                    this.saveQueue();
                }
            } else {
                App.model.queue = [];
                this.saveQueue();
            }
        } else {
            App.model.queue = [];
            this.saveQueue();
        }
    }

    // Render the queue in the UI
    renderQueue() {
        const queueList = document.getElementById('queueList');
        queueList.innerHTML = '';
        if (App.model.queue.length === 0) {
            queueList.innerHTML = '<p>Queue is empty.</p>';
            return;
        }
        App.model.queue.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('queue-item');
            div.classList.add('input-group');

            // Create the text element
            const span = document.createElement('span');
            span.textContent = item;
            div.appendChild(span);

            // Create buttons: move up, move down, delete

            // Button to move the item up
            const btnUp = document.createElement('button');
            btnUp.classList.add('btn', 'btn-primary', 'btn-sm');
            btnUp.innerHTML = '<i class="bi bi-arrow-up-short"></i>';
            btnUp.addEventListener('click', () => {
                if (index > 0) {
                    // Swap with the previous element
                    [App.model.queue[index - 1], App.model.queue[index]] = [App.model.queue[index], App.model.queue[index - 1]];
                    App.snapshotManager.saveQueue();
                    App.snapshotManager.renderQueue();
                }
            });
            div.appendChild(btnUp);

            // Button to move the item down
            const btnDown = document.createElement('button');
            btnDown.classList.add('btn', 'btn-primary', 'btn-sm');
            btnDown.innerHTML = '<i class="bi bi-arrow-down-short"></i>';
            btnDown.addEventListener('click', () => {
                if (index < App.model.queue.length - 1) {
                    // Swap with the next element
                    [App.model.queue[index], App.model.queue[index + 1]] = [App.model.queue[index + 1], App.model.queue[index]];
                    App.snapshotManager.saveQueue();
                    App.snapshotManager.renderQueue();
                }
            });
            div.appendChild(btnDown);

            // Button to delete the item
            const btnDelete = document.createElement('button');
            btnDelete.classList.add('btn', 'btn-primary', 'btn-sm');
            btnDelete.innerHTML = '<i class="bi bi-trash"></i>';
            btnDelete.addEventListener('click', () => {
                App.model.queue.splice(index, 1);
                App.snapshotManager.saveQueue();
                App.snapshotManager.renderQueue();
            });
            div.appendChild(btnDelete);

            queueList.appendChild(div);
        });
    }

    // Handle addition of a new item (prevents duplicate items)
    setupaddToQueue() {
        const addToQueueBtn = document.getElementById('addToQueue');
        const selectElement = document.getElementById('queueSelect');

        addToQueueBtn.addEventListener('click', () => {
            const selectedValue = selectElement.value;
            // Check if the item is already in the queue
            if (App.model.queue.includes(selectedValue)) {
                App.utils.showAlert('This item has already been added.');
                return;
            }
            App.model.queue.push(selectedValue);
            App.snapshotManager.saveQueue();
            App.snapshotManager.renderQueue();
        });
    }

    // Handle clearing the entire queue
    setupclearQueue() {
        const clearQueueBtn = document.getElementById('clearQueue');
        clearQueueBtn.addEventListener('click', async () => {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to clear the queue?');
            if (confirmation) {
                App.model.queue = [];
                App.snapshotManager.saveQueue();
                App.snapshotManager.renderQueue();
            }
        });
    }

    // Handle executing queue
    setupexecuteQueue() {
        const executeQueueBtn = document.getElementById('executeQueue');
        executeQueueBtn.addEventListener('click', async () => {
            if (App.model.queue.length === 0) {
                App.utils.writeMessage('Queue is empty.');
                App.utils.showAlert('Queue is empty.');
                return;
            }
            let previewStr = '';
            if (App.model.isPreview) previewStr = '\nPreview Mode is active.'
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to execute the queue?'+previewStr);
            if (confirmation) {
                App.model.queueToExecute = JSON.parse(JSON.stringify(App.model.queue));

                // saves actual snapshot
                let useName = "preQueueSnapshot";
                App.model.preQueueSnapshot = this.createSnapshotObject(useName);

                App.model.isQueue = true;
                App.model.someCopyDone = 0;
                App.utils.writeMessage('Start executing queue..');

                const modal = bootstrap.Modal.getOrCreateInstance('#snapshotModal');
                modal.hide();

                App.snapshotManager.executeNextQueue();
            } else {
                App.utils.writeMessage('Queue execution cancelled.');
            }
        })
    }

    executeNextQueue() {
        let useName = App.model.queueToExecute[0];
        // get from localStorage
        let useSettings = [];
        const settingsStr = localStorage.getItem('snapshots');
        if (settingsStr) {
            useSettings = JSON.parse(settingsStr);
        }
        let settings = useSettings.find((setting) => setting.name === useName);
        if (!settings) {
            App.utils.writeMessage('Queue processing: No saved Snapshot found with name "' + useName + '"');
            if (App.model.queueToExecute.length > 0 ) {
                App.model.queueToExecute.shift();
                this.executeNextQueue();
            } else {
                App.copyManager.endCopying();
            }
            return;
        }

        if (!settings.sourceFolder || settings.destinationFolders.length === 0 || settings.selectionList.length === 0 || settings.destinationFolders.includes(settings.sourceFolder)) {
            App.utils.writeMessage('Queue processing: Snapshot with name "' + useName + '" is invalid.');
            if (App.model.queueToExecute.length > 0 ) {
                App.model.queueToExecute.shift();
                this.executeNextQueue();
            } else {
                App.copyManager.endCopying();
            }
            return;
        }

        App.utils.writeMessage('Queue processing: Executing Snapshot "' + useName + '"');
        this.setFromSnapshot(settings);

        // trigger start copy
        document.getElementById('copySelected').click();

    }
}

module.exports = SnapshotManager;