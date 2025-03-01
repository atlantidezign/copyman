// OptionsManager.js
class OptionsManager {
    constructor() {
    }
    init() {
        this.initializeOptions();

        //Options ui
        document.getElementById("overwriteChecked").addEventListener("change", function () {
            App.model.fileOverwrite = this.checked;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Overwrite Existing setting is now ' + App.model.fileOverwrite);
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
            model.propagateSelections = model.propagateSelections;
            model.fileOverwrite = model.fileOverwrite;
            model.copyVerbose = model.copyVerbose;
            model.copyReport = model.copyReport;
            model.relationshipOR = model.relationshipOR;
        } else {
            const saveOptions = {
                propagateSelections: model.propagateSelections,
                fileOverwrite: model.fileOverwrite,
                copyVerbose: model.copyVerbose,
                copyReport: model.copyReport,
                relationshipOR: model.relationshipOR,
            };
            localStorage.setItem('options', JSON.stringify(saveOptions));
        }
        this.updateOptionsUI();
    }
    saveOptions() {
        let model = App.model;
        const saveOptions = {
            propagateSelections: propagateSelections,
            fileOverwrite: fileOverwrite,
            copyVerbose: copyVerbose,
            copyReport: copyReport,
            relationshipOR: relationshipOR,
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
        this.saveOptions();
        this.updateOptionsUI();
        App.filtersManager.applyAllFilters();
    }
    updateOptionsUI() {
        document.getElementById("overwriteChecked").checked = App.model.fileOverwrite;
        document.getElementById("verboseChecked").checked = App.model.copyVerbose;
        document.getElementById("reportChecked").checked = App.model.copyReport;
        document.getElementById("propagateChecked").checked = App.model.propagateSelections;
        document.getElementById("relationshipORChecked").checked = App.model.relationshipOR;
    }

}

module.exports = OptionsManager;