const {ipcRenderer, remote, shell} = require('electron');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

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
            showAboutModal();
            break;
        case 'menu-help':
            showHelpModal();
            break;
    }
});

//Title
document.addEventListener('DOMContentLoaded', () => {
    document.title += ` v${version}`;
});


//Modals
function initalizeHelpModal() {
    const usageFilePath = path.join(__dirname, '../docs/USAGE.md');
    let markdown = '';
    try {
        markdown = fs.readFileSync(usageFilePath, 'utf8');
    } catch (error) {
        console.error('Error reading USAGE.md:', error);
        writeMessage('Error reading USAGE.md.');
    }

    let underDocs = `
    <hr>
    Written by Alessandro Di Michele<br>
&copy;2025 Atlantide Design <a href="http://www.atlantide-design.it">www.atlantide-design.it</a> All rights reserved.<br>
<br>
Binaries download available on <a href="http://www.atlantide-design.it/copyman"><img src="images/logotype_indigo_alt.svg" alt="Copyman" title="Copyman" height="14"/></a> website <br>
Source code available on <a href="https://github.com/atlantidezign/copyman"><i class="bi bi-github"></i> GitHub</a>`;
    let aboutDocs = `
    <img src="images/logotype_white.svg" alt="Copyman" class="img-fluid" title="Copyman" width="300"/><br>
    v${version}
    <br>
    <br>
    <p>Select and copy items, at lightning speed, from one folder to multiple destinations while preserving the folder structure.</p>
    `;

    document.getElementById('helpContentMD').innerHTML = marked.parse(markdown) + underDocs;
    document.getElementById('aboutContentMD').innerHTML = aboutDocs + underDocs;
}
function showAboutModal() {
    document.getElementById('modalAboutTrigger').click();
}
function showHelpModal() {
    document.getElementById('modalHelpTrigger').click();
}
function showOptionsModal() {
    document.getElementById('modalOptionsTrigger').click();
}
function showSnapshotModal() {
    document.getElementById('modalSnapshotTrigger').click();
}
function initializeSnapshotModal() {
    listSnapshots();
}
function initalizeModals() {
    initalizeHelpModal();
    initializeSnapshotModal();
    updateListContent();
}

//Components
var rangePicker, rangeSlider;
var initialRangeSliderValues = [500000, 1000000];
var limitRangeSliderValues = [0, 1000000000];
var dateFormat = 'mm/dd/yyyy';
var localeLang = 'en';
function initializeComponents() {
    if (navigator.language && navigator.language.toLowerCase().startsWith('it')) {
        dateFormat = 'dd/mm/yyyy';
        localeLang = 'it';
    }

    const elem = document.querySelector('.input-daterange');
    rangePicker = new DateRangePicker(elem, {
        buttonClass: 'btn',
        allowOneSidedRange: true,
        enableOnReadonly: true,
        clearButton: true,
        todayButton: true,
        todayButtonMode: 0,
        todayHighlight: true,
        format: dateFormat,
        language: localeLang
    });

    rangeSlider = document.getElementById('slider-range');
    noUiSlider.create(rangeSlider, {
        start: initialRangeSliderValues,
        step: 1,
        range: {
            'min': [limitRangeSliderValues[0]],
            '25%': [1000],
            '75%': [1000000],
            'max': [limitRangeSliderValues[1]]
        },
        connect: true,
        tooltips: [true, true],
        behaviour: 'drag-smooth-steps-tap'
    });

    //date
    var dateFrom = document.getElementById('range-start');
    var dateTo = document.getElementById('range-end');
    // Flag to avoid recursions
    let updating1 = false;
    let updating2 = false;

    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(dateFrom, 'value', {
        get() {
            return originalDescriptor.get.call(this);
        },
        set(newValue) {
            // if updating, update with no dispatch
            if (updating1) {
                originalDescriptor.set.call(this, newValue);
                return;
            }

            updating1 = true;
            originalDescriptor.set.call(this, newValue);
            this.dispatchEvent(new Event('change', { bubbles: true }));
            updating1 = false;
        }
    });
    Object.defineProperty(dateTo, 'value', {
        get() {
            return originalDescriptor.get.call(this);
        },
        set(newValue) {
            // if updating, update with no dispatch
            if (updating2) {
                originalDescriptor.set.call(this, newValue);
                return;
            }

            updating2 = true;
            originalDescriptor.set.call(this, newValue);
            this.dispatchEvent(new Event('change', { bubbles: true }));
            updating2 = false;
        }
    });

    dateFrom.addEventListener('change', function (e) {
        let rawValue = this.value;
        const correctedValue = correctDateInput(rawValue, dateFormat);
        this.value = correctedValue;
    });
    dateTo.addEventListener('change', function (e) {
        let rawValue = this.value;
        const correctedValue = correctDateInput(rawValue, dateFormat);
        this.value = correctedValue;
    });

    //size
    var sliderFrom = document.getElementById('slider-from');
    var sliderTo = document.getElementById('slider-to');
    rangeSlider.noUiSlider.on('update', function (values, handle) {
        var value = values[handle];
        if (handle) {
            sliderTo.value = Number(value);
        } else {
            sliderFrom.value = Number(value);
        }
    });
    sliderFrom.addEventListener('change', function () {
        let rawValue = this.value;
        rangeSlider.noUiSlider.set([rawValue, null]);
    });

    sliderTo.addEventListener('change', function () {
        let rawValue = this.value;
        rangeSlider.noUiSlider.set([null, rawValue]);
    });
    function correctDateInput(inputValue, dateFormat) {
        // extracts day month and year from string, as numbers
        const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
        const match = inputValue.match(regex);

        if (!match) {
            // if format not corrispoindig, returns original.
            return inputValue;
        }

        // According to dateFormat detects month and day.
        let day, month, year;
        if (dateFormat === 'dd/mm/yyyy') {
            day   = parseInt(match[1], 10);
            month = parseInt(match[2], 10);
        } else if (dateFormat === 'mm/dd/yyyy') {
            month = parseInt(match[1], 10);
            day   = parseInt(match[2], 10);
        } else {
            // if not recognized returns original format.
            return inputValue;
        }
        const cleanYearStr = match[3].replace(/^0+/, '');
        year = parseInt(cleanYearStr, 10);
        // normalize year length
        if (cleanYearStr.length < (dateFormat.match(/y/g) || []).length) {
            year += 2000;
        }

        if (month < 1) {
            month = 1;
        }
        if (month > 12) {
            month = 12;
        }

        // computes max number of days for month and year
        const maxDays = new Date(year, month, 0).getDate();
        if (day < 1) {
            day = 1;
        }
        if (day > maxDays) {
            day = maxDays;
        }

        // day and month in 2 digits
        const dayFormatted = day < 10 ? '0' + day : day.toString();
        const monthFormatted = month < 10 ? '0' + month : month.toString();

        // recompose output string, as original format
        let outputString;
        if (dateFormat === 'dd/mm/yyyy') {
            outputString = `${dayFormatted}/${monthFormatted}/${year}`;
        } else if (dateFormat === 'mm/dd/yyyy') {
            outputString = `${monthFormatted}/${dayFormatted}/${year}`;
        }

        return outputString;
    }


}

//User Options Defaults
let fileOverwriteDefault = true;
let copyVerboseDefault = false;
let copyReportDefault = true;
let propagateSelectionsDefault = true;
let relationshipORDefault = true;
//User Options
let fileOverwrite = fileOverwriteDefault;
let copyVerbose = copyVerboseDefault;
let copyReport = copyReportDefault;
let propagateSelections = propagateSelectionsDefault;
let relationshipOR = relationshipORDefault;
function initializeOptions() {
    const savedOptions = localStorage.getItem('options');
    if (savedOptions) {
        const options = JSON.parse(savedOptions);
        propagateSelections = options.propagateSelections;
        fileOverwrite = options.fileOverwrite;
        copyVerbose = options.copyVerbose;
        copyReport = options.copyReport;
        relationshipOR = options.relationshipOR;
    } else {
        const saveOptions = {
            propagateSelections: propagateSelections,
            fileOverwrite: fileOverwrite,
            copyVerbose: copyVerbose,
            copyReport: copyReport,
            relationshipOR: relationshipOR,
        };
        localStorage.setItem('options', JSON.stringify(saveOptions));
    }
    updateOptionsUI();
}
function saveOptions() {
    const saveOptions = {
        propagateSelections: propagateSelections,
        fileOverwrite: fileOverwrite,
        copyVerbose: copyVerbose,
        copyReport: copyReport,
        relationshipOR: relationshipOR,
    };
    localStorage.setItem('options', JSON.stringify(saveOptions));
}
function resetOptions() {
    propagateSelections = propagateSelectionsDefault;
    fileOverwrite = fileOverwriteDefault;
    copyVerbose = copyVerboseDefault;
    copyReport = copyReportDefault;
    relationshipOR = relationshipORDefault;
    saveOptions();
    updateOptionsUI();
    applyAllFilters();
}
function updateOptionsUI() {
    document.getElementById("overwriteChecked").checked = fileOverwrite;
    document.getElementById("verboseChecked").checked = copyVerbose;
    document.getElementById("reportChecked").checked = copyReport;
    document.getElementById("propagateChecked").checked = propagateSelections;
    document.getElementById("relationshipORChecked").checked = relationshipOR;
}

//START
initializeOptions();
initializeComponents();
initalizeModals();

//Business vars
let clicksActive = true; //system: to disactivate clicks while copying
let fileTreeData = []; // system: tree data
let messageLife = 3000; //system: message life in ms before clean
let copyingReport = [];
let itemsCopied = [];
let itemsSkipped =[];
let itemsFailed = [];
let itemsTotal = 0;
let itemsProcessed = 0;

//User folders
let sourceFolder = ''; // user choose: source folder
let destinationFolders = []; // user choose: destinations folder

//User filters
let filtersNamePlus = []; //Array<string>
let filtersNameMinus = []; //Array<string>
let filtersDatePlus = []; //Array<{ from: Date, to: Date}>
let filtersDateMinus = []; //Array<{ from: Date, to: Date}>
let filtersSizePlus = []; //Array<{ from: number, to: number}>
let filtersSizeMinus = []; //Array<{ from: number, to: number}>

//Snapshot actions
document.getElementById('saveSnapshot').addEventListener('click', saveSnapshot);
document.getElementById('loadSnapshot').addEventListener('click', loadSnapshot);
document.getElementById('cleanSnapshot').addEventListener('click', cleanSnapshot);
document.getElementById('cleanAllSnapshots').addEventListener('click', cleanAllSnapshots);
document.getElementById('exportSnapshot').addEventListener('click', exportSnapshot);
document.getElementById('importSnapshot').addEventListener('click', importSnapshot);
function listSnapshots() {
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
function saveSnapshot() {
    let useName = document.getElementById('saveSnapshotInput').value.trim().toLowerCase();
    if (!useName) {
        showAlert('Please enter a name for Snapshot to save.');
        return;
    }
    document.getElementById('saveSnapshotInput').value = useName;

    if (sourceFolder === '' && destinationFolders.length === 0 && filtersDateMinus.length == 0 && filtersDatePlus.length === 0 &&
        filtersSizeMinus.length === 0 && filtersSizePlus.length === 0 && filtersNameMinus.length === 0 && filtersNamePlus.length === 0) {
        showAlert('Please enter some Folder/Filter to save.');
        return;
    }

    let useSettings = [];
    const settingsStr = localStorage.getItem('snapshots');
    if (settingsStr) {
        useSettings = JSON.parse(settingsStr);
    }

    const index = useSettings.findIndex(setting => setting.name === useName);
    if (index !== -1) {
        useSettings.splice(index, 1);
        writeMessage(`Old Snapshot named "${useName}" removed.`);
    }

    let newSettings = {
        name: useName,
        //source and destinations folders
        sourceFolder: sourceFolder,
        destinationFolders: destinationFolders,
        //user settings (overwrite, propagate + nuovi)
        fileOverwrite: fileOverwrite,
        copyVerbose: copyVerbose,
        copyReport: copyReport,
        propagateSelections: propagateSelections,
        relationshipOR: relationshipOR,
        //filters (name + nuovi)
        filtersNamePlus: filtersNamePlus,
        filtersNameMinus: filtersNameMinus,
        filtersDatePlus: filtersDatePlus,
        filtersDateMinus: filtersDateMinus,
        filtersSizePlus: filtersSizePlus,
        filtersSizeMinus: filtersSizeMinus,
    }
    useSettings.push(newSettings);
    // serialize and save in localStorage
    localStorage.setItem('snapshots', JSON.stringify(useSettings));
    listSnapshots();
    writeMessage('Snapshot saved.');
}
function loadSnapshot() {
    writeMessage('Loading Snapshot...');
    let useName = document.getElementById('loadSnapshotInput').value.trim().toLowerCase();
    if (!useName) {
        showAlert('Please enter a name for Snapshot to load.');
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
        writeMessage('No saved Snapshot found with name "' + useName + '"');
        return;
    }
    setFromSnapshot(settings);
}
function cleanSnapshot() {
    let useName = document.getElementById('loadSnapshotInput').value.trim().toLowerCase();
    if (!useName) {
        showAlert('Please enter a name for Snapshot to remove.');
        return;
    }

    let useSettings = [];
    const settingsStr = localStorage.getItem('snapshots');
    if (settingsStr) {
        useSettings = JSON.parse(settingsStr);
    }

    const index = useSettings.findIndex(setting => setting.name === useName);
    if (index !== -1) {
        showConfirmWithCallbacks('Are you sure you want to remove Saved Snapshot named ' + useName + '?', cleanCallback);
    } else {
        writeMessage(`No Snapshot with name "${useName}".`);
    }

    function cleanCallback() {
        useSettings.splice(index, 1);
        localStorage.setItem('snapshots', JSON.stringify(useSettings));
        listSnapshots();
        writeMessage(`Snapshot named "${useName}" removed.`);
    }
}
function cleanAllSnapshots() {
    showConfirmWithCallbacks('Are you sure you want to Clean all saved Snapshots?', cleanCallback);

    function cleanCallback() {
        localStorage.removeItem('snapshots');
        listSnapshots();
        writeMessage('Snapshots cleaned.');
    }
}
async function exportSnapshot() {
    let useName = document.getElementById('saveSnapshotInput').value.trim().toLowerCase();
    if (!useName) {
        showAlert('Please enter a name for Snapshot to export.');
        return;
    }
    document.getElementById('saveSnapshotInput').value = useName;

    if (sourceFolder === '' && destinationFolders.length === 0 && filtersDateMinus.length == 0 && filtersDatePlus.length === 0 &&
        filtersSizeMinus.length === 0 && filtersSizePlus.length === 0 && filtersNameMinus.length === 0 && filtersNamePlus.length === 0) {
        showAlert('Please enter some Folder/Filter to save.');
        return;
    }

    let newSettings = {
        name: useName,
        //source and destinations folders
        sourceFolder: sourceFolder,
        destinationFolders: destinationFolders,
        //user settings (overwrite, propagate + nuovi)
        fileOverwrite: fileOverwrite,
        copyVerbose: copyVerbose,
        copyReport: copyReport,
        propagateSelections: propagateSelections,
        relationshipOR: relationshipOR,
        //filters (name + nuovi)
        filtersNamePlus: filtersNamePlus,
        filtersNameMinus: filtersNameMinus,
        filtersDatePlus: filtersDatePlus,
        filtersDateMinus: filtersDateMinus,
        filtersSizePlus: filtersSizePlus,
        filtersSizeMinus: filtersSizeMinus,
    }

    writeMessage('Choose Snapshot JSON file for Export.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const saved = await ipcRenderer.invoke('select-export-snapshot-file', newSettings);
    if (saved) {
        writeMessage('Shapshot exported successfully.');
    } else {
        writeMessage('Shapshot not exported.');
    }
    clicksActive = true;
    toggleSpinner(!clicksActive);
}
async function importSnapshot() {
    writeMessage('Choose Snapshot JSON file for Import.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const filePath = await ipcRenderer.invoke('select-import-snapshot-file', 'Select Snapshot File to Import');
    if (!filePath) {
        showAlert('Nessun file selezionato per l\'import dello Snapshot.');
        clicksActive = true;
        toggleSpinner(!clicksActive);
        return;
    }

    let fileContent = '';
    try {
        fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`Errore nella lettura del file: ${error.message}`);
        writeMessage(`Errore nella lettura del file JSON dello Snapshot.`);
        clicksActive = true;
        toggleSpinner(!clicksActive);
        return;
    }

    let settings;
    try {
        settings = JSON.parse(fileContent);
        setFromSnapshot(settings);
        clicksActive = true;
        toggleSpinner(!clicksActive);
    } catch (error) {
        console.error(`Errore nel parsing del JSON: ${error.message}`);
        writeMessage(`Errore nel parsing del JSON dello Snapshot.`);
        clicksActive = true;
        toggleSpinner(!clicksActive);
        return;
    }
}
function setFromSnapshot(settings) {
    try {
        removeAllFilters();

        // update global app vars
        sourceFolder = settings.sourceFolder || '';
        destinationFolders = settings.destinationFolders || [];
        fileOverwrite = (typeof settings.fileOverwrite === 'boolean') ? settings.fileOverwrite : fileOverwriteDefault;
        copyVerbose = (typeof settings.copyVerbose === 'boolean') ? settings.copyVerbose : copyVerboseDefault;
        copyReport = (typeof settings.copyReport === 'boolean') ? settings.copyReport : copyReportDefault;
        propagateSelections = (typeof settings.propagateSelections === 'boolean') ? settings.propagateSelections : propagateSelectionsDefault;
        relationshipOR = (typeof settings.relationshipOR === 'boolean') ? settings.relationshipOR : relationshipORDefault;
        filtersNamePlus = settings.filtersNamePlus || [];
        filtersNameMinus = settings.filtersNameMinus || [];
        filtersDatePlus = settings.filtersDatePlus || [];
        filtersDateMinus = settings.filtersDateMinus || [];
        filtersSizePlus = settings.filtersSizePlus || [];
        filtersSizeMinus = settings.filtersSizeMinus || [];

        updateOptionsUI();

        document.getElementById('sourcePath').textContent = sourceFolder;
        updateTree();

        updateDestinationList();

        // update snaphot name
        document.getElementById('saveSnapshotInput').value = settings.name;

        applyAllFilters();

        writeMessage('Snapshot loaded.');
    } catch (error) {
        console.error("Error during Snapshot loading:", error);
        writeMessage('Error during Snapshot loading.');
    }
}

//General click
document.addEventListener('click', function (event) {
    if (!clicksActive) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}, true);

// Source folder
document.getElementById('selectSource').addEventListener('click', async () => {
    writeMessage('Choose Source folder.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const folder = await ipcRenderer.invoke('select-folder', 'Select Source Folder', sourceFolder);
    if (folder) {
        writeMessage('Scanning Source folder...');
        if (destinationFolders.includes(folder)) {
            showAlert("This folder is in the destination list.");
            clicksActive = true;
            toggleSpinner(!clicksActive);
            return;
        }
        // check folder is not a folder of something else already selected
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                showAlert("The source folder cannot be a subfolder of an already selected destination folder.");
                clicksActive = true;
                toggleSpinner(!clicksActive);
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                showAlert("The source folder cannot be a parent folder of an already selected destination folder.");
                clicksActive = true;
                toggleSpinner(!clicksActive);
                return;
            }
        }
        sourceFolder = folder;
        document.getElementById('sourcePath').textContent = folder;
        // build tree
        updateTree();
        writeMessage('Source Folder rendered.');
    } else {
        writeMessage('No Source folder selected.');
    }
    clicksActive = true;
    toggleSpinner(!clicksActive);
});
document.getElementById('clearSource').addEventListener('click', async () => {
    sourceFolder = '';
    removeAllFilters();
    document.getElementById('sourcePath').textContent = 'Select Source Folder';
    fileTreeData = [];
    const container = document.getElementById('file-tree');
    container.innerHTML = '';
    writeMessage('Source folder cleared.');
});
document.getElementById('buttonSwap').addEventListener('click', swapSourceAndDestination);
function swapSourceAndDestination() {
    if (!sourceFolder || destinationFolders.length == 0 ) {
        showAlert("Please select the Source Folder and a Destination Folder before swap.")
        return;
    }
    let oldsource = sourceFolder;
    sourceFolder = destinationFolders[0];
    destinationFolders[0] = oldsource;
    document.getElementById('sourcePath').textContent = sourceFolder;
    updateTree();
    updateDestinationList();
    applyAllFilters();
    writeMessage('Source / Destination Folders swapped.');
}

// Destination Folders
document.getElementById('addDestination').addEventListener('click', addDestination);
document.getElementById('clearAllDestinations').addEventListener('click', clearDestinations);
function updateDestinationList() {
    const listContainer = document.getElementById('destinationList');
    listContainer.innerHTML = ''; // empty list
    if (destinationFolders.length === 0) {
        listContainer.innerHTML = 'Add Destination Folder';
    } else {
        destinationFolders.forEach((folder, index) => {
            const listItem = document.createElement('span');
            listItem.classList.add('badge', 'text-bg-secondary', 'position-relative', 'me-2');
            listItem.title = folder;
            listItem.textContent = getLastTwoElements(folder);
            const listItemInner = document.createElement('span');
            listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
            // remove single item
            const removeButton = document.createElement('a');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => {
                removeDestination(index);
            });
            removeButton.style.cursor = 'pointer';
            listItemInner.appendChild(removeButton);
            listItem.appendChild(listItemInner);
            listContainer.appendChild(listItem);
        });
    }

    function getLastTwoElements(folderPath) {
        const normalizedPath = path.normalize(folderPath);
        const parts = normalizedPath.split(path.sep).filter(Boolean);
        if (parts.length <= 2) {
            return folderPath;
        }
        return '...' + path.sep + parts.slice(-2).join(path.sep);
    }

}
async function addDestination() {
    writeMessage('Choose a Destination folder.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const folder = await ipcRenderer.invoke('select-folder', 'Select destination folder', destinationFolders.length > 0 ? destinationFolders[destinationFolders.length - 1] : "");
    if (folder) {
        // check folder is different from sourceFolder
        if (folder === sourceFolder) {
            showAlert("The destination folder cannot be the same as the source folder.");
            clicksActive = true;
            toggleSpinner(!clicksActive);
            return;
        }
        // Check that the folder is not already present in the array
        if (destinationFolders.includes(folder)) {
            showAlert("This folder has already been added.");
            clicksActive = true;
            toggleSpinner(!clicksActive);
            return;
        }

        // chech folder is not inside sourceFolder
        if (sourceFolder && isSubFolder(folder, sourceFolder) && isSubFolder(sourceFolder, folder)) {
            showAlert("The destination folder cannot be a subfolder or a parent of source folder.");
            clicksActive = true;
            toggleSpinner(!clicksActive);
            return;
        }

        // check folder is not a folder of something else already selected
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                showAlert("The destination folder cannot be a subfolder of an already selected destination folder.");
                clicksActive = true;
                toggleSpinner(!clicksActive);
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                showAlert("The destination folder cannot be a parent folder of an already selected destination folder.");
                clicksActive = true;
                toggleSpinner(!clicksActive);
                return;
            }
        }

        // adds folder to array and updates ui
        destinationFolders.push(folder);
        updateDestinationList();
        writeMessage('Destination folder added.');
    } else {
        writeMessage('No Destination folder selected.');
    }
    clicksActive = true;
    toggleSpinner(!clicksActive);
}
function removeDestination(index) {
    destinationFolders.splice(index, 1);
    updateDestinationList();
    writeMessage('Destination folder removed.');
}
function clearDestinations() {
    destinationFolders = [];
    updateDestinationList();
    writeMessage('All Destination folder removed.');
}

//Tree render
function buildFileTree(dir, relativePath = '') {
    const tree = [];
    const items = fs.readdirSync(dir);
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            tree.push({
                name: item,
                path: itemRelativePath,
                type: 'directory',
                children: buildFileTree(fullPath, itemRelativePath),
                modified: stats.mtime.toLocaleDateString(),
                modifiedRaw: stats.mtime,
                size: "",
                sizeRaw: 0
            });
        } else {
            // check dimention for format: KB  if < 1MB, else MB
            let formattedSize = formatSizeForThree(stats.size);

            tree.push({
                name: item,
                path: itemRelativePath,
                type: 'file',
                modified: stats.mtime.toLocaleDateString(),
                modifiedRaw: stats.mtime,
                size: formattedSize,
                sizeRaw: stats.size
            });
        }
    });
    return tree;
}
function renderFileTree(treeData) {
    const container = document.getElementById('file-tree');
    container.innerHTML = '';
    const ul = document.createElement('ul');
    treeData.forEach(node => {
        const li = createTreeNode(node);
        if (li) {
            ul.appendChild(li);
        }
    });
    container.appendChild(ul);

    updateListContent();
}
function createTreeNode(node) {
    const li = document.createElement('li');

    // toggle and label container
    const labelContainer = document.createElement('span');

    let childUl = null; // created if directory

    // checkbox, for file or directory
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.filePath = node.path;
    checkbox.dataset.nodeName = node.name;
    checkbox.dataset.nodeSize = node.sizeRaw;
    checkbox.dataset.nodeModified = node.modifiedRaw;
    checkbox.dataset.isDirectory = (node.type === 'directory') ? "1":"0";
    checkbox.classList.add('form-check-input');

    // listener for state change
    checkbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const currentLi = e.target.closest("li");
        // if node has childrens (is directory) propagate down
        if (currentLi.querySelector("ul")) {
            if (propagateSelections) propagateDown(currentLi, isChecked);
        }
        // if checkbox selected, update all parents too
        if (isChecked) {
            if (propagateSelections) propagateUp(currentLi);
        }
        // if unchecked, no on-parents propagation

        updateListContent();
    });

    if (node.type === 'directory') {
        // icon toggle (collapsed)
        const toggleIcon = document.createElement('span');
        toggleIcon.textContent = '▷';
        toggleIcon.style.cursor = 'pointer';
        toggleIcon.style.marginRight = '5px';
        labelContainer.appendChild(toggleIcon);

        // add checkbox
        labelContainer.appendChild(checkbox);

        // label
        const label = document.createElement('span');
        label.textContent = ' ' + node.name;
        const labelExtrasDate = document.createElement('span');
        labelExtrasDate.classList.add('label-extras-date');
        labelExtrasDate.textContent = node.modified;
        label.appendChild(labelExtrasDate);
        const labelExtrasSize = document.createElement('span');
        labelExtrasSize.classList.add('label-extras-size');
        labelExtrasSize.textContent = (node.size != "" ? " " + node.size : "");
        label.appendChild(labelExtrasSize);
        labelContainer.appendChild(label);

        li.appendChild(labelContainer);

        // children list (collapsed)
        childUl = document.createElement('ul');
        childUl.style.display = 'none';

        if (node.children) {
            node.children.forEach(child => {
                const childLi = createTreeNode(child);
                if (childLi) childUl.appendChild(childLi);
            });
        }
        li.appendChild(childUl);

        // Listener for toggle: click to expand/collapse
        toggleIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (childUl.style.display === 'none') {
                childUl.style.display = 'block';
                toggleIcon.textContent = '▼';
            } else {
                childUl.style.display = 'none';
                toggleIcon.textContent = '▷';
            }
        });
    } else {
        // Node is file: spacer for align
        const spacer = document.createElement('span');
        spacer.textContent = '    ';
        labelContainer.appendChild(spacer);

        // checkbox for file
        labelContainer.appendChild(checkbox);

        // label
        const label = document.createElement('span');
        label.textContent = ' ' + node.name;
        const labelExtrasDate = document.createElement('span');
        labelExtrasDate.classList.add('label-extras-date');
        labelExtrasDate.textContent = node.modified;
        label.appendChild(labelExtrasDate);
        const labelExtrasSize = document.createElement('span');
        labelExtrasSize.classList.add('label-extras-size');
        labelExtrasSize.textContent = (node.size != "" ? " " + node.size : "");
        label.appendChild(labelExtrasSize);
        labelContainer.appendChild(label);

        li.appendChild(labelContainer);
    }
    return li;
}
function updateTree() {
    clicksActive = false;
    toggleSpinner(!clicksActive);
    fileTreeData = buildFileTree(sourceFolder);
    renderFileTree(fileTreeData);
    clicksActive = true;
    toggleSpinner(!clicksActive);
}

//Tree selections
function propagateDown(li, isChecked) {
    // recursively select all checkbox of children
    const childCheckboxes = li.querySelectorAll("ul input[type='checkbox']");
    childCheckboxes.forEach(cb => {
        cb.checked = isChecked;
    });
}
function propagateUp(li) {
    // find <li> parent
    const parentLi = li.parentElement.closest('li');
    if (parentLi) {
        const parentCheckbox = parentLi.querySelector("input[type='checkbox']");
        if (parentCheckbox) {
            parentCheckbox.checked = true;
            propagateUp(parentLi);
        }
    }
}
function expandAncestors(element) {
    let parent = element.parentElement;
    while (parent && parent.id !== 'file-tree') {
        if (parent.tagName.toLowerCase() === 'ul') {
            parent.style.display = 'block';
            // if UL is son of a LI with toggle, switch toggle to "▼"
            const li = parent.parentElement;
            if (li) {
                const toggleIcon = li.querySelector('span');
                if (toggleIcon && (toggleIcon.textContent === '▷' || toggleIcon.textContent === '▼')) {
                    toggleIcon.textContent = '▼';
                }
            }
        }
        parent = parent.parentElement;
    }
}

//Filters common
function removeAllFilters() {
    resetNameFilterUI();
    resetDateFilterUI();
    resetSizeFilterUI();

    // iterate all tree checkboxes
    filtersNamePlus = [];
    filtersNameMinus = [];
    filtersDatePlus = [];
    filtersDateMinus = [];
    filtersSizePlus = [];
    filtersSizeMinus = [];

    renderNameFiltersList();
    renderDateFiltersList();
    renderSizeFiltersList();

    removeAllSelection();
    writeMessage('All filters removed.');
}
function applyAllFilters() {
    renderNameFiltersList();
    renderDateFiltersList();
    renderSizeFiltersList();

    removeAllSelection();

    for (const filterValue of filtersNamePlus) {
        // iterate all tree checkboxes
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeName = checkbox.dataset.nodeName.toLowerCase();
            if (filterValue !== '' && nodeName.includes(filterValue.toLowerCase())) {
                checkbox.checked = true;
                // expand to selected child node
                expandAncestors(checkbox);
            }
        });
    }
    for (const filterValue of filtersNameMinus) {
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeName = checkbox.dataset.nodeName.toLowerCase();
            if (filterValue !== '' && nodeName.includes(filterValue.toLowerCase())) {
                checkbox.checked = false;
            }
        });
    }
    
    //apply filters for Date and Size, evalueting also relationshipOR true or false (AND)

    for (const filterValue of filtersDatePlus) {
        // iterate all tree checkboxes
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeDate = checkbox.dataset.nodeModified;
            if (dateSingleInsideARange(nodeDate, filterValue)) {
                if (relationshipOR) {
                    checkbox.checked = true;
                    // expand to selected node
                    expandAncestors(checkbox);
                } else {
                    if (filtersNameMinus.length === 0 && filtersNamePlus.length === 0) {
                        checkbox.checked = true;
                        // expand to selected node
                        expandAncestors(checkbox);
                    }
                    //on if no previous condition present (Name and Date)
                }
            } else {
                if (!relationshipOR) checkbox.checked = false;
            }
        });
    }
    for (const filterValue of filtersDateMinus) {
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeDate = checkbox.dataset.nodeModified;
            if (dateSingleInsideARange(nodeDate, filterValue)) {
                checkbox.checked = false;
            }
        });
    }

    for (const filterValue of filtersSizePlus) {
        // iterate all tree checkboxes
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeSize = checkbox.dataset.nodeSize;
            if (sizeSingleInsideARange(nodeSize, filterValue)) {
                if (relationshipOR) {
                    checkbox.checked = true;
                    // expand to selected
                    expandAncestors(checkbox);
                } else {
                    if (filtersNameMinus.length === 0 && filtersNamePlus.length === 0 && filterDateMinus.length === 0 && filtersDatePlus.length === 0 ) {
                        checkbox.checked = true;
                        // expand to selected
                        expandAncestors(checkbox);
                    }
                    //on if no previous condition exists (Name and Date for Size)
                }
            } else {
                if (!relationshipOR) checkbox.checked = false;
            }
        });
    }
    for (const filterValue of filtersSizeMinus) {
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeSize = checkbox.dataset.nodeSize;
            if (sizeSingleInsideARange(nodeSize, filterValue)) {
                checkbox.checked = false;
            }
        });
    }
    writeMessage('Filters updated.');
}
function removeAllSelection() {
    const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

//Filters Name
document.getElementById('setNameFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
    if (!filterValue) {
        showAlert("Please enter a string for filter.");
        return;
    }
    filtersNamePlus = [filterValue];
    filtersNameMinus = [];
    resetNameFilterUI();
    applyAllFilters();
});
document.getElementById('addNameMinusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
    if (!filterValue) {
        showAlert("Please enter a string for filter.");
        return;
    }
    if (filtersNameMinus.indexOf(filterValue) < 0 && filtersNamePlus.indexOf(filterValue) < 0) {
        filtersNameMinus.push(filterValue);
        resetNameFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + filterValue + '" is already present.');

    }
});
document.getElementById('addNamePlusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
    if (!filterValue) {
        showAlert("Please enter a string for filter.");

        return;
    }
    if (filtersNameMinus.indexOf(filterValue) < 0 && filtersNamePlus.indexOf(filterValue) < 0) {
        filtersNamePlus.push(filterValue);
        resetNameFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + filterValue + '" is already present.');

    }

});
document.getElementById('clearNameFilter').addEventListener('click', () => {
    removeNameFilters();
});
function removeNameFilters() {
    resetNameFilterUI();
    // iterate all tree checkboxes
    filtersNamePlus = [];
    filtersNameMinus = [];
    renderNameFiltersList();
    applyAllFilters();
    writeMessage('Name filters removed.');
}
function removeSingleNameFilter(index, kind) {
    let oldFilter = "";
    if (kind === "+") {
        oldFilter = filtersNamePlus[index];
        filtersNamePlus.splice(index, 1);
    }
    if (kind === "-") {
        oldFilter = filtersNameMinus[index];
        filtersNameMinus.splice(index, 1);
    }
    writeMessage('Removed Name filter "' + kind + oldFilter + '".');
    applyAllFilters();
}
function renderNameFiltersList() {
    const listContainer = document.getElementById('nameFilterList');
    listContainer.innerHTML = '';
    drawFiltersFor(filtersNamePlus, "+");
    drawFiltersFor(filtersNameMinus, "-");
    if (listContainer.innerHTML == '') listContainer.innerHTML = 'Name Filters list'

    function drawFiltersFor(arrayList, filterKind) {
        arrayList.forEach((filter, index) => {
            const listItem = document.createElement('span');
            listItem.classList.add('badge', 'text-bg-secondary', 'position-relative', 'me-2');
            if (filterKind === "+") listItem.classList.add('filter-plus');
            if (filterKind === "-") listItem.classList.add('filter-minus');
            listItem.textContent = filterKind + filter;
            const listItemInner = document.createElement('span');
            listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
            // remove single
            const removeButton = document.createElement('a');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => {
                removeSingleNameFilter(index, filterKind);
            });
            removeButton.style.cursor = 'pointer';
            listItemInner.appendChild(removeButton);
            listItem.appendChild(listItemInner);
            listContainer.appendChild(listItem);
        });
    }
}
function resetNameFilterUI() {
    document.getElementById('filterNameInput').value = "";
}

//Filters Date
document.getElementById('setDateFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }

    let rangePickerGet = rangePicker.getDates(); //Date
    let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
    let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
    if (!rangePickerStart && !rangePickerEnd) {
        showAlert("Please enter at least a date for filter.");
        return;
    }
    filtersDatePlus = [rangePickerGet];
    filtersDateMinus = [];
    resetDateFilterUI();
    applyAllFilters();
});
document.getElementById('addDateMinusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }
    let rangePickerGet = rangePicker.getDates(); //Date
    let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
    let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
    if (!rangePickerStart && !rangePickerEnd) {
        showAlert("Please enter at least a date for filter.");
        return;
    }
    if (!dateRangeInsideAnotherArrayOfRanges(rangePickerGet, filtersDateMinus) && !dateRangeInsideAnotherArrayOfRanges(rangePickerGet, filtersDatePlus)) {
        filtersDateMinus.push(rangePickerGet);
        resetDateFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + renderSingleDateFilter(rangePickerGet) + '" is already present.');
    }
});
document.getElementById('addDatePlusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }
    let rangePickerGet = rangePicker.getDates(); //Date
    let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
    let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
    if (!rangePickerStart && !rangePickerEnd) {
        showAlert("Please enter at least a date for filter.");
        return;
    }

    if (!dateRangeInsideAnotherArrayOfRanges(rangePickerGet, filtersDateMinus) && !dateRangeInsideAnotherArrayOfRanges(rangePickerGet, filtersDatePlus)) {
        filtersDatePlus.push(rangePickerGet);
        resetDateFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + renderSingleDateFilter(rangePickerGet) + '" is already present.');
    }
});
document.getElementById('clearDateFilter').addEventListener('click', () => {
    removeDateFilters();
});
function dateRangeInsideAnotherArrayOfRanges(rangeToCheck, rangeOrigin) {
    let isInside = false
    if (rangeToCheck[0] !== null && rangeToCheck[0] !== undefined && rangeToCheck[0] !== "undefined"  && (!(rangeToCheck[0] instanceof Date) || rangeToCheck[0].toString() === "Invalid Date")) {
        rangeToCheck[0] = new Date(rangeToCheck[0]);
    }
    if (rangeToCheck[1] !== null && rangeToCheck[1] !== undefined && rangeToCheck[1] !== "undefined" && (!(rangeToCheck[1] instanceof Date) || rangeToCheck[1].toString() === "Invalid Date")) {
        rangeToCheck[1] = new Date(rangeToCheck[1]);
    }
    const pickerStart = rangeToCheck[0] ? rangeToCheck[0].getTime() : 0;
    const pickerEnd = rangeToCheck[1] ? rangeToCheck[1].getTime() : 0;

    rangeOrigin.forEach(function (rangePresent) {
        if (rangePresent[0] !== null && rangePresent[0] !== undefined && rangePresent[0] !== "undefined"  && (!(rangePresent[0] instanceof Date) || rangePresent[0].toString() === "Invalid Date")) {
            rangePresent[0] = new Date(rangePresent[0]);
        }
        if (rangePresent[1] !== null && rangePresent[1] !== undefined && rangePresent[1] !== "undefined" && (!(rangePresent[1] instanceof Date) || rangePresent[1].toString() === "Invalid Date")) {
            rangePresent[1] = new Date(rangePresent[1]);
        }
        const originStart = rangePresent[0] ? rangePresent[0].getTime() : Number.NEGATIVE_INFINITY;
        const originEnd = rangePresent[1] ? rangePresent[1].getTime() : Number.POSITIVE_INFINITY;

        // verify if interval to check is inside current interval
        if (originStart <= pickerStart && pickerEnd <= originEnd) {
            isInside = true;
        }
    });

    return isInside
}
function dateSingleInsideARange(dateToCheck, rangePresent) {
    let isInside = false;
    if (!dateToCheck || (dateToCheck.toString() === "Invalid Date")) return false;
    if (!(dateToCheck instanceof Date)) {
        dateToCheck = new Date(dateToCheck);
    }
    if (rangePresent[0] !== null && rangePresent[0] !== undefined  && rangePresent[0] !== "undefined"  && (!(rangePresent[0] instanceof Date) || rangePresent[0].toString() === "Invalid Date")) {
        rangePresent[0] = new Date(rangePresent[0]);
    }
    if (rangePresent[1] !== null && rangePresent[1] !== undefined && rangePresent[1] !== "undefined" && (!(rangePresent[1] instanceof Date) || rangePresent[1].toString() === "Invalid Date")) {
        rangePresent[1] = new Date(rangePresent[1]);
    }
    const pickerPoint = dateToCheck ? dateToCheck.getTime() : 0;

    const originStart = rangePresent[0] ? rangePresent[0].getTime() : Number.NEGATIVE_INFINITY;
    const originEnd = rangePresent[1] ? rangePresent[1].getTime() : Number.POSITIVE_INFINITY;

    // verify if interval to check is inside current interval
    if (originStart <= pickerPoint && pickerPoint <= originEnd) {
        isInside = true;
    }

    return isInside
}
function removeDateFilters() {
    resetDateFilterUI();
    // iterate on all tree checkboxes
    filtersDatePlus = [];
    filtersDateMinus = [];
    renderDateFiltersList();
    applyAllFilters();
    writeMessage('Date filters removed.');
}
function removeSingleDateFilter(index, kind) {
    let oldFilter = "";
    if (kind === "+") {
        oldFilter = filtersDatePlus[index];
        filtersDatePlus.splice(index, 1);
    }
    if (kind === "-") {
        oldFilter = filtersDateMinus[index];
        filtersDateMinus.splice(index, 1);
    }
    writeMessage('Removed Date filter "' + kind + renderSingleDateFilter(oldFilter) + '".');
    applyAllFilters();
}
function renderSingleDateFilter(filter) {
    return formatDate(filter[0]) + "-" + formatDate(filter[1]);
}
function renderDateFiltersList() {
    const listContainer = document.getElementById('dateFilterList');
    listContainer.innerHTML = '';
    drawFiltersFor(filtersDatePlus, "+");
    drawFiltersFor(filtersDateMinus, "-");
    if (listContainer.innerHTML == '') listContainer.innerHTML = 'Date Filters list'

    function drawFiltersFor(arrayList, filterKind) {
        arrayList.forEach((filter, index) => {
            const listItem = document.createElement('span');
            listItem.classList.add('badge', 'text-bg-secondary', 'position-relative', 'me-2');
            if (filterKind === "+") listItem.classList.add('filter-plus');
            if (filterKind === "-") listItem.classList.add('filter-minus');
            listItem.textContent = filterKind + renderSingleDateFilter(filter);
            const listItemInner = document.createElement('span');
            listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
            // remove single item
            const removeButton = document.createElement('a');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => {
                removeSingleDateFilter(index, filterKind);
            });
            removeButton.style.cursor = 'pointer';
            listItemInner.appendChild(removeButton);
            listItem.appendChild(listItemInner);
            listContainer.appendChild(listItem);
        });
    }
}
function resetDateFilterUI() {
    rangePicker.setDates({clear: true}, {clear: true});
}

//Filters Size
document.getElementById('setSizeFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }

    let rangeSliderGet = rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
    let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : limitRangeSliderValues[0];
    let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : limitRangeSliderValues[1];
    if (rangeSliderStart == limitRangeSliderValues[0] && rangeSliderEnd == limitRangeSliderValues[1]) {
        showAlert("Please enter at least a size for filter.");
        return;
    }
    filtersSizePlus = [rangeSliderGet];
    filtersSizeMinus = [];
    resetSizeFilterUI();
    applyAllFilters();
});
document.getElementById('addSizeMinusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }
    let rangeSliderGet = rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
    let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : limitRangeSliderValues[0];
    let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : limitRangeSliderValues[1];
    if (rangeSliderStart == limitRangeSliderValues[0] && rangeSliderEnd == limitRangeSliderValues[1]) {
        showAlert("Please enter at least a size for filter.");
        return;
    }
    if (!sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, filtersSizeMinus) && !sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, filtersSizePlus)) {
        filtersSizeMinus.push(rangeSliderGet);
        resetSizeFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + renderSingleSizeFilter(rangeSliderGet) + '" is already present.');
    }
});
document.getElementById('addSizePlusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");
        return;
    }
    let rangeSliderGet = rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
    let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : limitRangeSliderValues[0];
    let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : limitRangeSliderValues[1];
    if (rangeSliderStart == limitRangeSliderValues[0] && rangeSliderEnd == limitRangeSliderValues[1]) {
        showAlert("Please enter at least a size for filter.");
        return;
    }
    if (!sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, filtersSizeMinus) && !sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, filtersSizePlus)) {
        filtersSizePlus.push(rangeSliderGet);
        resetSizeFilterUI();
        applyAllFilters();
    } else {
        showAlert("This filter is already present.");
        writeMessage('Filter "' + renderSingleSizeFilter(rangeSliderGet) + '" is already present.');
    }
});
document.getElementById('clearSizeFilter').addEventListener('click', () => {
    removeSizeFilters();
});
function sizeRangeInsideAnotherArrayOfRanges(rangeToCheck, rangeOrigin) {
    let isInside = false
    let sliderStart = (rangeToCheck[0] !== null && rangeToCheck[0] !== undefined)
        ? rangeToCheck[0]
        : limitRangeSliderValues[0];
    let sliderEnd = (rangeToCheck[1] !== null && rangeToCheck[1] !== undefined)
        ? rangeToCheck[1]
        : limitRangeSliderValues[1];
    if (typeof sliderStart !== 'number') {
        const convertedSize = Number(sliderStart);
        if (!isNaN(convertedSize)) {
            sliderStart = convertedSize;
        } else {
            sliderStart = limitRangeSliderValues[0];
        }
    }
    if (typeof sliderEnd !== 'number') {
        const convertedSize = Number(sliderEnd);
        if (!isNaN(convertedSize)) {
            sliderEnd = convertedSize;
        } else {
            sliderEnd = limitRangeSliderValues[1];
        }
    }
    rangeOrigin.forEach(function (rangePresent) {
        let originStart = (rangePresent[0] !== null && rangePresent[0] !== undefined)
            ? rangePresent[0]
            : limitRangeSliderValues[0];
        let originEnd = (rangePresent[1] !== null && rangePresent[1] !== undefined)
            ? rangePresent[1]
            : limitRangeSliderValues[1];
        if (typeof originStart !== 'number') {
            const convertedSize = Number(originStart);
            if (!isNaN(convertedSize)) {
                originStart = convertedSize;
            } else {
                originStart = limitRangeSliderValues[0];
            }
        }
        if (typeof originEnd !== 'number') {
            const convertedSize = Number(originEnd);
            if (!isNaN(convertedSize)) {
                originEnd = convertedSize;
            } else {
                originEnd = limitRangeSliderValues[1];
            }
        }
        if (originStart <= sliderStart && sliderEnd <= originEnd) {
            isInside = true;
        }
    });

    return isInside
}
function sizeSingleInsideARange(sizeToCheck, rangePresent) {
    let isInside = false
    if (!sizeToCheck) return false;

    let sliderPoint = (sizeToCheck !== null && sizeToCheck !== undefined)
        ? sizeToCheck / 1024  //attenzione sizeToCheck è in in bytes - dividere per 1024
        : limitRangeSliderValues[0];
    if (typeof sliderPoint !== 'number') {
        const convertedSize = Number(sliderPoint);
        if (!isNaN(convertedSize)) {
            sliderPoint = convertedSize;
        } else {
            sliderPoint = limitRangeSliderValues[0];
        }
    }
    let originStart = (rangePresent[0] !== null && rangePresent[0] !== undefined)
        ? rangePresent[0]
        : limitRangeSliderValues[0];
    let originEnd = (rangePresent[1] !== null && rangePresent[1] !== undefined)
        ? rangePresent[1]
        : limitRangeSliderValues[1];
    if (typeof originStart !== 'number') {
        const convertedSize = Number(originStart);
        if (!isNaN(convertedSize)) {
            originStart = convertedSize;
        } else {
            originStart = limitRangeSliderValues[0];
        }
    }
    if (typeof originEnd !== 'number') {
        const convertedSize = Number(originEnd);
        if (!isNaN(convertedSize)) {
            originEnd = convertedSize;
        } else {
            originEnd = limitRangeSliderValues[1];
        }
    }

    // checl if slider interval is inside current
    if (originStart <= sliderPoint && sliderPoint <= originEnd) {
        isInside = true;
    }
    return isInside
}
function removeSizeFilters() {
    resetSizeFilterUI();
    // iterate on all tree checkboxes
    filtersSizePlus = [];
    filtersSizeMinus = [];
    renderSizeFiltersList();
    applyAllFilters();
    writeMessage('Size filters removed.');
}
function removeSingleSizeFilter(index, kind) {
    let oldFilter = "";
    if (kind === "+") {
        oldFilter = filtersSizePlus[index];
        filtersSizePlus.splice(index, 1);
    }
    if (kind === "-") {
        oldFilter = filtersSizeMinus[index];
        filtersSizeMinus.splice(index, 1);
    }
    writeMessage('Removed Size filter "' + kind + renderSingleSizeFilter(oldFilter) + '".');
    applyAllFilters();
}
function renderSingleSizeFilter(filter) {
    return formatSize(filter[0]) + "-" + formatSize(filter[1]);
}
function renderSizeFiltersList() {
    const listContainer = document.getElementById('sizeFilterList');
    listContainer.innerHTML = ''; // Svuota la lista esistente
    drawFiltersFor(filtersSizePlus, "+");
    drawFiltersFor(filtersSizeMinus, "-");
    if (listContainer.innerHTML == '') listContainer.innerHTML = 'Size (Kb) Filters list'

    function drawFiltersFor(arrayList, filterKind) {
        arrayList.forEach((filter, index) => {
            const listItem = document.createElement('span');
            listItem.classList.add('badge', 'text-bg-secondary', 'position-relative', 'me-2');
            if (filterKind === "+") listItem.classList.add('filter-plus');
            if (filterKind === "-") listItem.classList.add('filter-minus');
            listItem.textContent = filterKind + renderSingleSizeFilter(filter);
            const listItemInner = document.createElement('span');
            listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
            // remove single item
            const removeButton = document.createElement('a');
            removeButton.textContent = 'X';
            removeButton.addEventListener('click', () => {
                removeSingleSizeFilter(index, filterKind);
            });
            removeButton.style.cursor = 'pointer';
            listItemInner.appendChild(removeButton);
            listItem.appendChild(listItemInner);
            listContainer.appendChild(listItem);
        });
    }
}
function resetSizeFilterUI() {
    rangeSlider.noUiSlider.set(initialRangeSliderValues)
}

// Select/Deselect all
document.getElementById('selectAll').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    removeAllFilters();
    const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    writeMessage('All items selected.');
});
document.getElementById('deselectAll').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    writeMessage('All items deselected.');
    removeAllFilters();
});

// Expand/Collapse all
document.getElementById('expandAll').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }

    // expand all tree nodes and update icon to "▼"
    function expandAllFileTree() {
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;

        const nestedLists = treeContainer.querySelectorAll('ul');

        nestedLists.forEach(ul => {
            // expands node
            ul.style.display = 'block';

            //  if UL is son of a LI with toggle icon, update icon
            const parentLi = ul.parentElement;
            if (parentLi && parentLi.firstElementChild && parentLi.firstElementChild.firstElementChild) {
                const toggleIcon = parentLi.firstElementChild.firstElementChild;
                // if icon is "▷" or "▼", set to "▼" because expanded
                if (toggleIcon.textContent.trim() === '▷' || toggleIcon.textContent.trim() === '▼') {
                    toggleIcon.textContent = '▼';
                }
            }
        });
    }

    expandAllFileTree()
});
document.getElementById('collapseAll').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }
    // collapse all tree nodes and update icons to "▷"
    function collapseAllFileTree() {
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;

        // select all UL in tree
        const allULs = treeContainer.querySelectorAll('ul');

        // root UL stay visible
        allULs.forEach(ul => {
            if (ul.parentElement !== treeContainer) {
                ul.style.display = 'none';

                // if UL has a parent LI with toggle, update icon to "▷"
                const parentLi = ul.parentElement;
                if (parentLi && parentLi.firstElementChild && parentLi.firstElementChild.firstElementChild) {
                    const toggleIcon = parentLi.firstElementChild.firstElementChild;
                    if (toggleIcon.textContent.trim() === '▷' || toggleIcon.textContent.trim() === '▼') {
                        toggleIcon.textContent = '▷';
                    }
                }
            }
        });
    }

    collapseAllFileTree();
});

//Options ui
document.getElementById("overwriteChecked").addEventListener("change", function () {
    fileOverwrite = this.checked;
    saveOptions();
    writeMessage('Overwrite Existing setting is now ' + fileOverwrite);
});
document.getElementById("verboseChecked").addEventListener("change", function () {
    copyVerbose = this.checked;
    saveOptions();
    writeMessage('Verbose Progress setting is now ' + copyVerbose);
});
document.getElementById("reportChecked").addEventListener("change", function () {
    copyReport = this.checked;
    saveOptions();
    writeMessage('Copying Report setting is now ' + copyReport);
});
document.getElementById("propagateChecked").addEventListener("change", function () {
    propagateSelections = this.checked;
    saveOptions();
    writeMessage('Propagate Selection setting is now ' + propagateSelections);
});
document.getElementById("relationshipORChecked").addEventListener("change", function () {
    relationshipOR = this.checked;
    saveOptions();
    writeMessage('Relationship OR setting is now ' + relationshipOR);
    applyAllFilters();
});
document.getElementById("resetOptions").addEventListener("click", function () {
    showConfirmWithCallbacks('Are you sure you want to reset Options to defaults?', resetCallback);
    function resetCallback() {
        resetOptions();
        writeMessage('Options have been reset to defaults.');
    }
});

//Copying
document.getElementById('copySelected').addEventListener('click', async () => {
    // check if at least a destination folder is selected, and if source folder selected
    writeMessage('Checking for Copy...');
    if (destinationFolders.length === 0) {
        showAlert('Please select at least a Destination Folder!');
        writeMessage('Unable to start copying.');
        return;
    }
    if (!sourceFolder) {
        showAlert('Please select the Source Folder!');
        writeMessage('Unable to start copying.');
        return;
    }
    const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
    const selectedPaths = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedPaths.push(checkbox.dataset.filePath);
        }
    });
    if (selectedPaths.length === 0) {
        showAlert('No selected Items.\nPlease select at least one item.');
        writeMessage('Unable to start copying.');
        return;
    }
    if (destinationFolders.includes(sourceFolder)) {
        showAlert('Source and some Destination Folder are the same.\nPlease select different folders.');
        writeMessage('Unable to start copying.');
        return;
    }
    let destinations = destinationFolders.join(", ");
    writeMessage('Asking for copying confirmation...');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    let confimResult = await showConfirmWithReturn('Are you sure you want to copy ' + selectedPaths.length + ' items\nfrom ' + sourceFolder + '\nto ' + destinations + '?');
    if (confimResult) {
        writeMessage('Copying Started...');
        setTimeout( ()=> {copyYesCallbackPost()}, 100);
        //copyYesCallbackPost();
    }
    else {
        writeMessage('Copying Aborted.');
        clicksActive = true;
        toggleSpinner(!clicksActive);
    }
    async function copyYesCallbackPost() {
        copyingReport = [];
        itemsCopied = [];
        itemsSkipped =[];
        itemsFailed = [];
        for (let i = 0; i < destinationFolders.length; i++) {
            itemsCopied.push(0);
            itemsSkipped.push(0);
            itemsFailed.push(0);
        }
        itemsProcessed = 0;
        itemsTotal = selectedPaths.length;
        openProgressModal();
        await executeCopy(selectedPaths);
        clicksActive = true;
        toggleSpinner(!clicksActive);
        openReportModal();
    }
});
async function executeCopy(selectedPaths) {
    let now1 = new Date();
    let startTime = now1.getTime();
    updateCopyingProgress('▷ ' + 'Copy started at: ' + now1.toLocaleTimeString(), true);
    // copy every selected item
    let fileIndex = 1;
    for (const relPath of selectedPaths) {
        const sourceFullPath = path.join(sourceFolder, relPath);
        let destIndex = 0;
        for (const destFolder of destinationFolders) {
            const destinationFullPath = path.join(destFolder, relPath);
            writeMessage('[' + fileIndex + '/' + selectedPaths.length + '] Copying ' + sourceFullPath + ' to ' + destinationFullPath);
            updateCopyingProgress('[' + fileIndex + '/' + selectedPaths.length + '] Copying ' + sourceFullPath + ' to ' + destinationFullPath, true)
            try {
                await copyRecursive(sourceFullPath, destinationFullPath, destIndex);
            } catch (err) {
                console.error('Error copying ', sourceFullPath, destinationFullPath, err);
                writeMessage('Error copying ' + sourceFullPath + ' in ' + destinationFullPath);
                itemsFailed[destIndex]++;
                updateCopyingProgress('Error copying ' + sourceFullPath + ' in ' + destinationFullPath, false);
            }
            if (copyVerbose) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            destIndex++;
        }
        itemsProcessed = fileIndex;
        fileIndex++;
    }
    let now2 = new Date();
    let endTime = now2.getTime();
    let elapsedTimeMS = (endTime - startTime);
    let elapsedTimeS = (elapsedTimeMS/1000).toFixed(2);
    updateCopyingProgress('▷ ' + 'Copy finished at: ' + now2.toLocaleTimeString() +'.<hr>Elapsed: ' + elapsedTimeS +'s (' + elapsedTimeMS +'ms)' , true);
    writeMessage('Copy Completed!');
}
async function copyRecursive(src, dest, destIndex) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, {recursive: true});

        }
        if (!fileOverwrite && fs.existsSync(dest)) {
            updateCopyingProgress('Folder ' + dest + ' already exists. Skipping...', false);
            writeMessage('Folder ' + dest + ' already exists. Skipping...');
            itemsSkipped[destIndex]++;
        } else {
            updateCopyingProgress('Folder ' + dest + ' copied.', false);
            writeMessage('Folder ' + dest + ' copied.');
            itemsCopied[destIndex]++;
        }
        //no! const items = fs.readdirSync(src);
        //no! for (const item of items) {
        //no!    await copyRecursive(path.join(src, item), path.join(dest, item));
        //no! }
    } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, {recursive: true});
        }
        if (!fileOverwrite) {
            if (!fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
                updateCopyingProgress('File ' + dest + ' copied.', false);
                writeMessage('File ' + dest + ' copied.');
                itemsCopied[destIndex]++;
            } else {
                updateCopyingProgress('File ' + dest + ' already exists. Skipping...', false);
                writeMessage('File ' + dest + ' already exists. Skipping...');
                itemsSkipped[destIndex]++;
            }
        } else {
            fs.copyFileSync(src, dest);
            updateCopyingProgress('File ' + dest + ' copied.', false);
            writeMessage('File ' + dest + ' copied.');
            itemsCopied[destIndex]++;
        }
    }
}

//Progress and Report
function openProgressModal() {
    if (copyVerbose) {
        document.getElementById('verboseProgress').classList.remove('hidden');
        document.getElementById('copyingReport').classList.add('hidden');
        document.querySelectorAll('.copyingClose').forEach( (el) => el.classList.add('hidden') );
        document.getElementById('verboseProgressMD').innerHTML = "";
        const modal = bootstrap.Modal.getOrCreateInstance('#copyingModal');
        modal.show();
    }
}
function openReportModal() {
    if (copyReport) {
        document.getElementById('verboseProgress').classList.add('hidden');
        document.getElementById('copyingReport').classList.remove('hidden');
        document.querySelectorAll('.copyingClose').forEach( (el) => el.classList.remove('hidden') );
        document.getElementById('copyingReportMD').innerHTML = '<h6>Report</h6>' + copyingReport.join("\n") + `<hr>
        Processed <b>${itemsProcessed}</b> of <b>${itemsTotal}</b> items, into <b>${destinationFolders.length}</b> Destination folders.<br>
        Copied: <b>${itemsCopied.toString()}</b>; Skipped: <b>${itemsSkipped.toString()}</b>; Failed: <b>${itemsFailed.toString()}</b>.
        `;
        setTimeout(function () {
            const modalBody = document.querySelector('#copyingModal .modal-body');
            modalBody.scrollTop = modalBody.scrollHeight;
        }, 100)
        const modal = bootstrap.Modal.getOrCreateInstance('#copyingModal');
        modal.show();
    }
}
function updateCopyingProgress(message, sep = false) {
    if (copyVerbose || copyReport) {
        let useClass = '';
        if (sep) useClass = ' class="verboseSep"';
        let useMessage = "<div"+useClass+">" + message +"</div>";
        if (copyVerbose) {
            if (sep) document.getElementById('verboseProgressMD').innerHTML = useMessage
            else document.getElementById('verboseProgressMD').innerHTML = useMessage + document.getElementById('verboseProgressMD').innerHTML ;
            const modalBody = document.querySelector('#copyingModal .modal-body');
            modalBody.scrollTop = 0;
        }
        copyingReport.push(useMessage);
    }
}

//Selection list
function updateListContent() {
    let selectedItems = getListOfSelectedItems();
    let htmlContent = '<table class="table table-striped">' +
        '<tr><th> </th><th>Path</th><th>Modified</th><th>Size</th></tr>';

    selectedItems.forEach( (item, index) => {
        htmlContent += '<tr><td>' + (item.isDirectory === "1" ? '<i class="bi bi-folder2"></i>':'<i class="bi bi-file"></i>') + '</td><td>' + item.path + '</td><td>' + item.modified + '</td><td>' + item.size + '</td></tr>';
    })
    htmlContent += '</table>';
    document.getElementById('listContentMD').innerHTML = htmlContent;
    document.getElementById('listFooterTotal').innerHTML = 'Selected: ' + selectedItems.length;
}
function getListOfSelectedItems() {
    // select div #file-tree
    const fileTree = document.getElementById('file-tree');

// select al checked checkboxes inside
    const checkedCheckboxes = fileTree.querySelectorAll('input[type="checkbox"]:checked');

// map every checkbox to associated info
    const files = Array.from(checkedCheckboxes).map(checkbox => ({
        path: checkbox.dataset.filePath,
        fullPath: path.join(sourceFolder, checkbox.dataset.filePath),
        name: checkbox.dataset.nodeName,
        fullSize: checkbox.dataset.nodeSize,
        size: formatSizeForThree(checkbox.dataset.nodeSize),
        modified: checkbox.dataset.nodeModified,
        isDirectory: checkbox.dataset.isDirectory
    }));

    return files;
}
document.getElementById('listModalButtonSaveJson').addEventListener('click', saveListOfSelectedItemsToJson);
document.getElementById('listModalButtonSaveCsv').addEventListener('click', saveListOfSelectedItemsToCsv);
function saveListOfSelectedItemsToJson() {
    let dataToExport = getListOfSelectedItems();
    if (dataToExport.length > 0) {
        saveListOfSelectedItems("json", dataToExport);
    } else {
        showAlert("No items to export.");
    }
}
function saveListOfSelectedItemsToCsv() {
    let dataToExport = getListOfSelectedItems();
    if (dataToExport.length > 0) {
        saveListOfSelectedItems("csv", dataToExport);
    } else {
        showAlert("No items to export.");
    }
}
async function saveListOfSelectedItems(kind, dataToExport) {
    writeMessage('Choose '+kind.toUpperCase()+' Export file.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const saved = await ipcRenderer.invoke('select-export-selection-file', dataToExport, kind);
    if (saved) {
        writeMessage('Selection List '+kind.toUpperCase()+' exported successfully.');
    } else {
        writeMessage('Selection List '+kind.toUpperCase()+' not exported.');
    }
    clicksActive = true;
    toggleSpinner(!clicksActive);
}

// Utils: messages
let messageTimeout = null;
function writeMessage(message) {
    if (messageTimeout) clearTimeout(messageTimeout);
    document.getElementById('status').textContent = message;
    messageTimeout = setTimeout(() => {
        document.getElementById('status').textContent = '';
    }, messageLife);
}

// Utils: check if 'child' is a subfolder of 'parent'
function isSubFolder(child, parent) {
    const relative = path.relative(parent, child);
    // if relative is ampty or starts with ".." or is absolute path, child not son of parent
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

// Utils: spinner
function toggleSpinner(spinnerActive) {
    const spinnerOverlay = document.getElementById('spinner-overlay');
    spinnerOverlay.style.display = spinnerActive ? 'flex' : 'none';
}

//Utils: alert and confirm wrapped on native dialogs trough ipcRender
function showAlert(message) {
    ipcRenderer.invoke("show-alert", message);
}
async function showConfirmWithCallbacks(message, yesCallback, notCallback, messageYes, messageNo) {
    const confirmation = await ipcRenderer.invoke('show-confirm', message);
    setTimeout(() => {
        if (confirmation) {
            if (messageYes) writeMessage(messageYes);
            if (yesCallback) yesCallback();
        }
        else {
            if (messageNo) writeMessage(messageNo);
            if (notCallback) notCallback();
        }
    }, 0);
}
async function showConfirmWithReturn(message) {
    const confirmation = await ipcRenderer.invoke('show-confirm', message);
    return confirmation;
}

//Utils: date and size formatting
function formatSize(size) {
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
function formatSizeForThree(size) {
    if (size == undefined || size == null) return "???";
    let formattedSize;
    if (size < 1024 * 1024) {
        formattedSize = (size / 1024).toFixed(2) + " Kb";
    } else {
        formattedSize = (size / (1024 * 1024)).toFixed(2) + " Mb";
    }
    return formattedSize;
}
function formatDate(date) {
    if (date == undefined || date == null || (date.toString() === "Invalid Date")) return "???";
    if (!(date instanceof Date)) {
        // try to convert to date
        date = new Date(date);
    }
    // extract day mont and year from date
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() return 0 - 11 month
    const yyyy = date.getFullYear();

    // replaces placeholders as for dateFormat
    return dateFormat.replace('dd', dd).replace('mm', mm).replace('yyyy', yyyy);
}

