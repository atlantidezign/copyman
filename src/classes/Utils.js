// Utils.js
class Utils {
    constructor() {
    }

    // Utils: messages
    messageTimeout = null;
    writeMessage(message) {
        if (this.messageTimeout) clearTimeout(this.messageTimeout);
        document.getElementById('status').textContent = message;
        if (App.model.mantainLogs) {
            App.model.logs.push(message);
        }
        this.messageTimeout = setTimeout(() => {
            document.getElementById('status').textContent = '';
        }, App.model.messageLife);
    }

    // Utils: check if 'child' is a subfolder of 'parent'
    isSubFolder(child, parent) {
        const relative = path.relative(parent, child);
        // if relative is ampty or starts with ".." or is absolute path, child not son of parent
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    // Utils: spinner
    toggleSpinner(spinnerActive) {
        const spinnerOverlay = document.getElementById('spinner-overlay');
        spinnerOverlay.style.display = spinnerActive ? 'flex' : 'none';
    }

    // Utils: alert and confirm wrapped on native dialogs trough ipcRender
    showAlert(message) {
        ipcRenderer.invoke("show-alert", message);
    }

    async showConfirmWithReturn(message) {
        const confirmation = await ipcRenderer.invoke('show-confirm', message);
        return confirmation;
    }

    // Utils: date and size formatting
    formatSizeForFilters(size) {
        if (typeof size !== 'number') {
            const convertedSize = Number(size);
            if (!isNaN(convertedSize)) {
                size = convertedSize;
            } else {
                size = 0;
            }
        }
        if (size == undefined || size == null) return "???";
        let formattedSize; //is yet in kb
        if (size < 1024) {
            formattedSize = (size).toFixed(2) + " Kb";
        } else {
            formattedSize = (size / (1024)).toFixed(2) + " Mb";
        }
        return formattedSize;
    }

    formatSizeForThree(size) {
        if (size == undefined || size == null) return "???";
        let formattedSize;
        if (size < 1024 * 1024) {
            formattedSize = (size / 1024).toFixed(2) + " Kb";
        } else if (size < 1024 * 1024 * 1024) {
            formattedSize = (size / (1024 * 1024)).toFixed(2) + " Mb";
        } else {
            formattedSize = (size / (1024 * 1024 * 1024)).toFixed(2) + " Gb";
        }

        return formattedSize;
    }

    formatDate(date) {
        if (date == undefined || date == null || (date.toString() === "Invalid Date")) return "???";
        if (!(date instanceof Date)) {
            // try to convert to date
            date = new Date(date);
        }
        // extract day mont and year from date
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() return 0 - 11 month
        const yyyy = date.getFullYear();

        // replaces placeholders as for App.model.dateFormat
        return App.model.dateFormat.replace('dd', dd).replace('mm', mm).replace('yyyy', yyyy);
    }

    dateToGetTime(dateToCheck) {
        //from dataset
        if (!dateToCheck || (dateToCheck.toString() === "Invalid Date")) return false;
        if (!(dateToCheck instanceof Date)) {
            dateToCheck = new Date(dateToCheck);
        }
        const datePoint = dateToCheck ? dateToCheck.getTime() : 0;
        return datePoint;
    }

    // Utils: overwrite mode to string
    formatOverwriteMode(fileOverwrite) {
        let enumToStr = '';
        switch (fileOverwrite) {
            case App.model.fileOverwriteEnum.always:
                enumToStr = '"Always"';
                break;
            case App.model.fileOverwriteEnum.never:
                enumToStr = '"Never"';
                break;
            case App.model.fileOverwriteEnum.if_different:
                enumToStr = '"If Different Size"';
                break;
            case App.model.fileOverwriteEnum.if_newer:
                enumToStr = '"If Newer"';
                break;
        }
        return enumToStr;
    }

    // Utils: delay for ui update
    async waitForUiUpdate(ms = 250) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = Utils;