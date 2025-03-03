// SelectionListManager.js
class SelectionListManager {
    constructor() {
    }

    init() {
        document.getElementById('listModalButtonSaveJson').addEventListener('click', this.saveListOfSelectedItemsToJson.bind(this));
        document.getElementById('listModalButtonSaveCsv').addEventListener('click', this.saveListOfSelectedItemsToCsv.bind(this));
    }

    // Update selection list ui
    updateListContent() {
        let selectedItems = this.getListOfSelectedItems();
        let htmlContent = '<table class="table table-striped">' +
            '<tr><th> </th><th>Path</th><th>Modified</th><th>Size</th></tr>';
        let totalSize = 0;
        let countFiles = 0;
        let countFolders = 0;
        selectedItems.forEach( (item) => {
            let date = new Date(item.fullModified)
            let dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            htmlContent += '<tr><td>' + (item.isDirectory === "1" ? '<i class="bi bi-folder2"></i>':'<i class="bi bi-file-earmark"></i>') + '</td><td>' + item.path + '</td><td>' + dateStr + '</td><td>' + item.size + '</td></tr>';
            totalSize += item.fullSize;
            if (item.isDirectory === "1") {
                countFolders++
            } else {
                countFiles++
            };
        })
        htmlContent += '</table>';
        document.getElementById('listContentMD').innerHTML = htmlContent;
        //document.getElementById('listFooterTotal').innerHTML = 'Selected: ' + selectedItems.length + " ["+countFiles+" files | "+countFolders+" folders] ("+App.utils.formatSizeForThree(totalSize)+")";
        document.getElementById('listFooterTotal').innerHTML = "Selected: " +countFiles+" files | "+countFolders+" folders ("+App.utils.formatSizeForThree(totalSize)+")";
    }

    // Generate selection list
    getListOfSelectedItems() {
        // select div #file-tree
        const fileTree = document.getElementById('file-tree');

        // select all checked checkboxes inside
        const checkedCheckboxes = fileTree.querySelectorAll('input[type="checkbox"]:checked');

        // map every checkbox to associated info
        const files = Array.from(checkedCheckboxes).map(checkbox => ({
            path: checkbox.dataset.filePath,
            fullPath: path.join(App.model.sourceFolder, checkbox.dataset.filePath),
            name: checkbox.dataset.nodeName,
            fullSize: Number(checkbox.dataset.nodeSize),
            size: App.utils.formatSizeForThree(Number(checkbox.dataset.nodeSize)),
            modified: checkbox.dataset.nodeModified,
            fullModified: Number(checkbox.dataset.nodeMS),
            isDirectory: checkbox.dataset.isDirectory
        }));

        return files;
    }

    // Export selection list
    saveListOfSelectedItemsToJson() {
        let dataToExport = this.getListOfSelectedItems();
        if (dataToExport.length > 0) {
            this.saveListOfSelectedItems("json", dataToExport);
        } else {
            App.utils.showAlert("No items to export.");
        }
    }
    saveListOfSelectedItemsToCsv() {
        let dataToExport = this.getListOfSelectedItems();
        if (dataToExport.length > 0) {
            this.saveListOfSelectedItems("csv", dataToExport);
        } else {
            App.utils.showAlert("No items to export.");
        }
    }
    async saveListOfSelectedItems(kind, dataToExport) {
        App.utils.writeMessage('Choose '+kind.toUpperCase()+' Export file.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const saved = await ipcRenderer.invoke('select-export-selection-file', dataToExport, kind);
        if (saved) {
            App.utils.writeMessage('Selection List '+kind.toUpperCase()+' exported successfully.');
        } else {
            App.utils.writeMessage('Selection List '+kind.toUpperCase()+' not exported.');
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }

    // Update selection stats
    updatetSelectionStats() {
        const fileTree = document.getElementById('file-tree');
        const checkedCheckboxes = fileTree.querySelectorAll('input[type="checkbox"]:checked');
        const selectedItems = Array.from(checkedCheckboxes).map(checkbox => ({
            fullSize: Number(checkbox.dataset.nodeSize),
            isDirectory: checkbox.dataset.isDirectory
        }));
        let selectionString = '';
        if (selectedItems.length > 0) {
            let totalSize = 0;
            let countFiles = 0;
            let countFolders = 0;
            selectedItems.forEach((item) => {
                totalSize += item.fullSize;
                if (item.isDirectory === "1") {
                    countFolders++
                } else {
                    countFiles++
                }
                ;
            })
            //selectionString += 'Selected: ' + selectedItems.length + " ["+countFiles+" files | "+countFolders+" folders] ("+App.utils.formatSizeForThree(totalSize)+")";
            selectionString = "Selected: " + countFiles+" files | "+countFolders+" folders ("+App.utils.formatSizeForThree(totalSize)+")";
        }
        document.getElementById('selectionStats').innerHTML = selectionString;
    }
}

module.exports = SelectionListManager;