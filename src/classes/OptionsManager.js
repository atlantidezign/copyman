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
        document.getElementById("resetOptions").addEventListener("click", async function () {
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to reset Options to defaults?');
            if (confirmation) {
                App.optionsManager.resetOptions();
                App.utils.writeMessage('Options have been reset to defaults.');
            }
        });
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
        } else {
            const saveOptions = {
                propagateSelections: model.propagateSelections,
                fileOverwrite: model.fileOverwrite,
                copyVerbose: model.copyVerbose,
                copyReport: model.copyReport,
                relationshipOR: model.relationshipOR,
                sortOrder: model.sortOrder,
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
        document.getElementById("sortOrderCombo").value = App.model.sortOrder;
    }

}

module.exports = OptionsManager;