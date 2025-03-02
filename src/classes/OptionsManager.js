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
                App.utils.writeMessage('Overwrite Existing setting is now ' + App.utils.formatOverwriteMode(App.model.fileOverwrite));
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
        document.getElementById("propagateChecked").addEventListener("change", function () {
            App.model.propagateSelections = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Propagate Selection setting is now ' + App.model.propagateSelections);
        });
        document.getElementById("relationshipORChecked").addEventListener("change", function () {
            App.model.relationshipOR = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Relationship OR setting is now ' + App.model.relationshipOR);
            App.filtersManager.applyAllFilters();
        });
        document.getElementById("mantainLogsChecked").addEventListener("change", function () {
            App.model.mantainLogs = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Mantain Logs setting is now ' + App.model.mantainLogs);
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
                App.optionsManager.exportLogs();
                App.utils.writeMessage('Logs have been exported to file.');
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
            model.fileOverwrite = options.fileOverwrite;
            model.copyVerbose = options.copyVerbose;
            model.copyReport = options.copyReport;
            model.relationshipOR = options.relationshipOR;
            model.sortOrder = options.sortOrder;
            model.mantainLogs = options.mantainLogs;
        } else {
            const saveOptions = {
                propagateSelections: model.propagateSelections,
                fileOverwrite: model.fileOverwrite,
                copyVerbose: model.copyVerbose,
                copyReport: model.copyReport,
                relationshipOR: model.relationshipOR,
                sortOrder: model.sortOrder,
                mantainLogs: model.mantainLogs,
            };
            localStorage.setItem('options', JSON.stringify(saveOptions));
        }
        this.updateOptionsUI();
    }
    saveOptions() {
        let model = App.model;
        const saveOptions = {
            propagateSelections: model.propagateSelections,
            fileOverwrite: model.fileOverwrite,
            copyVerbose: model.copyVerbose,
            copyReport: model.copyReport,
            relationshipOR: model.relationshipOR,
            sortOrder: model.sortOrder,
            mantainLogs: model.mantainLogs,
        };
        localStorage.setItem('options', JSON.stringify(saveOptions));
    }
    resetOptions() {
        let model = App.model;
        model.propagateSelections = model.propagateSelectionsDefault;
        model.fileOverwrite = model.fileOverwriteDefault;
        model.copyVerbose = model.copyVerboseDefault;
        model.copyReport = model.copyReportDefault;
        model.relationshipOR = model.relationshipORDefault;
        model.sortOrder = model.sortOrderDefault;
        model.mantainLogs = model.mantainLogsDefault;
        this.saveOptions();
        this.updateOptionsUI();
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
        document.getElementById("propagateChecked").checked = App.model.propagateSelections;
        document.getElementById("relationshipORChecked").checked = App.model.relationshipOR;
        document.getElementById("mantainLogsChecked").checked = App.model.mantainLogs;
        document.getElementById("sortOrderCombo").value = App.model.sortOrder;
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
}

module.exports = OptionsManager;