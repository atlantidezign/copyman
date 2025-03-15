// OptionsManager.js
class OptionsManager {
    constructor() {
    }
    init() {
        this.initializeOptions();

        //Options ui
        const radioButtons = document.getElementsByName("overwriteChecked");
        Array.from(radioButtons).forEach(function(radio) {
            radio.addEventListener("change", function () {
                App.model.fileOverwrite = Number(this.value);
                App.optionsManager.saveOptions();
                App.utils.writeMessage('Copy Mode setting is now ' + App.utils.formatOverwriteMode(App.model.fileOverwrite));
            });
        });
        document.getElementById("verboseChecked").addEventListener("change", function () {
            App.model.copyVerbose = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Verbose Progress setting is now ' + App.model.copyVerbose);
        });
        document.getElementById("reportChecked").addEventListener("change", function () {
            App.model.copyReport = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Copying Report setting is now ' + App.model.copyReport);
        });
        document.getElementById("abortQueueChecked").addEventListener("change", function () {
            App.model.abortFullQueue = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Abort Queue setting is now ' + App.model.abortFullQueue);
        });
        document.getElementById("dontConfirmQueueChecked").addEventListener("change", function () {
            App.model.dontConfirmQueue = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Don\'t Confirm Queue setting is now ' + App.model.dontConfirmQueue);
        });
        document.getElementById("propagateChecked").addEventListener("change", function () {
            App.model.propagateSelections = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Propagate Selection setting is now ' + App.model.propagateSelections);
        });
        document.getElementById("clickOnNamesChecked").addEventListener("change", function () {
            App.model.clickOnNamesToSelect = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Click on Names for Selecting setting is now ' + App.model.clickOnNamesToSelect);
        });
        document.getElementById("relationshipORChecked").addEventListener("change", function () {
            App.model.relationshipOR = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Relationship OR setting is now ' + App.model.relationshipOR);
            App.filtersManager.applyAllFilters();
        });
        document.getElementById("maintainLogsChecked").addEventListener("change", function () {
            App.model.maintainLogs = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Maintain Logs setting is now ' + App.model.maintainLogs);
        });
        document.getElementById("splitScreenChecked").addEventListener("change", function () {
            App.model.splitScreen = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Split Screen setting is now ' + App.model.splitScreen);
            App.uiManager.updateSplitScreen();
        });
        document.getElementById("makeTreeDiffsChecked").addEventListener("change", function () {
            App.model.makeTreeDiffs = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Tree Diffs setting is now ' + App.model.makeTreeDiffs);
            App.treeManager.updateTreeDiffs();
        });
        document.getElementById("saveSelectionChecked").addEventListener("change", function () {
            App.model.saveSelection = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Selection List setting is now ' + App.model.saveSelection);
        });
        document.getElementById("zipLevelChecked").addEventListener("change", function () {
            App.model.zipLevel = this.value;
            document.getElementById("zipLevelCheckedValue").innerText = App.optionsManager.formatZipLevel();
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Zip Level setting is now ' + App.model.zipLevel);
        });
        document.getElementById("resetOptions").addEventListener("click", async function () {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to reset Options to defaults?');
            if (confirmation) {
                App.optionsManager.resetOptions();
                App.utils.writeMessage('Options have been reset to defaults.');
            }
        });
        document.getElementById("exportLogs").addEventListener("click", async function () {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to export Logs to File?');
            if (confirmation) {
                await App.optionsManager.exportLogs();
                App.utils.writeMessage('Logs have been exported to file.');
            }
        });
        document.getElementById("clearLogs").addEventListener("click", async function () {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to clear Logs in memory?');
            if (confirmation) {
                App.model.logs = [];
                App.utils.writeMessage('Logs have been cleared.');
            }
        });

        let now = new Date();
        App.utils.writeMessage('Welcome to Copyman v' + App.model.appVersion + '! ' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString() );
    }

    initializeOptions() {
        let model = App.model;
        const savedOptions = localStorage.getItem('options');
        if (savedOptions) {
            const options = JSON.parse(savedOptions);
            model.propagateSelections = options.propagateSelections;
            model.clickOnNamesToSelect = options.clickOnNamesToSelect;
            model.fileOverwrite = options.fileOverwrite;
            model.copyVerbose = options.copyVerbose;
            model.copyReport = options.copyReport;
            model.abortFullQueue = options.abortFullQueue;
            model.dontConfirmQueue = options.dontConfirmQueue;
            model.relationshipOR = options.relationshipOR;
            model.sortOrder = options.sortOrder;
            model.maintainLogs = options.maintainLogs;
            model.splitScreen = options.splitScreen;
            model.makeTreeDiffs = options.makeTreeDiffs;
            model.saveSelection = options.saveSelection;
            model.zipLevel = options.zipLevel;
        } else {
            const saveOptions = this.getOptionsItem();
            localStorage.setItem('options', JSON.stringify(saveOptions));
        }
        this.updateOptionsUI();
        App.uiManager.updateSplitScreen();
    }
    saveOptions() {
        const saveOptions = this.getOptionsItem()
        localStorage.setItem('options', JSON.stringify(saveOptions));
    }
    getOptionsItem() {
        let model = App.model;
        const saveOptions = {
            propagateSelections: model.propagateSelections,
            clickOnNamesToSelect: model.clickOnNamesToSelect,
            fileOverwrite: model.fileOverwrite,
            copyVerbose: model.copyVerbose,
            copyReport: model.copyReport,
            abortFullQueue: model.abortFullQueue,
            dontConfirmQueue: model.dontConfirmQueue,
            relationshipOR: model.relationshipOR,
            sortOrder: model.sortOrder,
            maintainLogs: model.maintainLogs,
            splitScreen: model.splitScreen,
            makeTreeDiffs: model.makeTreeDiffs,
            saveSelection: model.saveSelection,
            zipLevel: model.zipLevel,
        };
        return saveOptions;
    }
    resetOptions() {
        let model = App.model;
        model.propagateSelections = model.propagateSelectionsDefault;
        model.clickOnNamesToSelect = model.clickOnNamesToSelectDefault;
        model.fileOverwrite = model.fileOverwriteDefault;
        model.copyVerbose = model.copyVerboseDefault;
        model.copyReport = model.copyReportDefault;
        model.abortFullQueue = model.abortFullQueueDefault;
        model.dontConfirmQueue = model.dontConfirmQueueDefault;
        model.relationshipOR = model.relationshipORDefault;
        model.sortOrder = model.sortOrderDefault;
        model.maintainLogs = model.maintainLogsDefault;
        model.splitScreen = model.splitScreenDefault;
        model.makeTreeDiffs = model.makeTreeDiffsDefault;
        model.saveSelection = model.saveSelectionDefault;
        model.zipLevel = model.zipLevelDefault;
        this.saveOptions();
        this.updateOptionsUI();
        App.uiManager.updateSplitScreen();
        App.filtersManager.applyAllFilters();
    }
    updateOptionsUI() {
        const radioButtons = document.getElementsByName("overwriteChecked");
        const currentValue = App.model.fileOverwrite;
        Array.from(radioButtons).forEach(function(radio) {
            if (Number(radio.value) === currentValue) {
                radio.checked = true;
            }
        });
        document.getElementById("verboseChecked").checked = App.model.copyVerbose;
        document.getElementById("reportChecked").checked = App.model.copyReport;
        document.getElementById("abortQueueChecked").checked = App.model.abortFullQueue;
        document.getElementById("dontConfirmQueueChecked").checked = App.model.dontConfirmQueue;
        document.getElementById("propagateChecked").checked = App.model.propagateSelections;
        document.getElementById("clickOnNamesChecked").checked = App.model.clickOnNamesToSelect;
        document.getElementById("relationshipORChecked").checked = App.model.relationshipOR;
        document.getElementById("maintainLogsChecked").checked = App.model.maintainLogs;
        document.getElementById("splitScreenChecked").checked = App.model.splitScreen;
        document.getElementById("makeTreeDiffsChecked").checked = App.model.makeTreeDiffs;
        document.getElementById("saveSelectionChecked").checked = App.model.saveSelection;
        document.getElementById("sortOrderCombo").value = App.model.sortOrder;
        document.getElementById("zipLevelChecked").value = App.model.zipLevel;
        document.getElementById("zipLevelCheckedValue").innerText =  App.optionsManager.formatZipLevel();
    }

    async exportLogs() {
        if (App.model.logs.length === 0) {
            App.utils.writeMessage('No Logs to export.');
            return;
        }
        App.utils.writeMessage('Choose Log Export file.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const saved = await ipcRenderer.invoke('select-export-log-file', App.model.logs);
        if (saved) {
            App.utils.writeMessage('Logs exported successfully.');
        } else {
            App.utils.writeMessage('Logs not exported.');
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }

    formatZipLevel() {
        let outStr = App.model.zipLevel;
        if (App.model.zipLevel < 0) outStr = "Default";
        if (App.model.zipLevel == 0) outStr = App.model.zipLevel + " (None)";
        if (App.model.zipLevel > 0) outStr = App.model.zipLevel + " (Low)";
        if (App.model.zipLevel > 3) outStr = App.model.zipLevel + " (Med)";
        if (App.model.zipLevel > 6) outStr = App.model.zipLevel + " (High)";
        if (App.model.zipLevel > 8) outStr = App.model.zipLevel + " (Max)";
        return outStr;
    }
}

module.exports = OptionsManager;