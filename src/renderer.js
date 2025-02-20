const {ipcRenderer, remote, shell} = require('electron');
const fs = require('fs');
const path = require('path');

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

//Help Modal
function initalizeHelpModal() {
    let markdown = `### Folders
You need to choose a **Source** folder and at least one **Destination** folder.  
Use the **Clear** buttons to remove the folder selections.

### Selection
Within the **tree view**, you can **select** the items to copy (whether files or folders) using checkboxes.

You can navigate within the tree by **expanding** or **collapsing** branches.  
You can also use the two buttons for **Expand or Collapse All**.

To select/unselect all items you can use the two buttons **Select All** and **Deselect All**.

### Filters
To assist with **selection**, you can use the **Filters**.
There are filters for file and folder **Name**, file and folder **Date** and file **Size**.

For each group, we have **Addictive** (+) filters, and **Subtractive** (-) filters.
**Addictive Filters** of each group are in **OR** condition. Eg. with 2 different strings for Addictives Name Filters, will be selected every item matches string1 or string2.
A **Substractive Filter** removes from selection every item matches, as a **NOT** condition.

**Relationship** between Addictive filters of different groups can be an **OR** or **AND** condition, according to options.
OR means that item is selected if **at least one** of the group conditions matches, AND means that **all** conditions must match.

#### Name
Accepts text string as input, as file/folder name substring.
- By clicking the **Set Name Filter** button, it selects the items that contain the specified string while deselecting the others.
- By clicking the **Add Addictive Name Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Name Filter** button, it removes any selected item that matches with the string.
- In the **Name Filters List** you can see all Name filters applyed and remove individual filters.
- Using the **Clear Name Filters** button, it removes the Name filters.  

#### Date
Accepts one or two dates as input, as file/folder date container range. If one date is null, it will be threaded as -infinity (start) or  +infinity (end).
- By clicking the **Set Date Filter** button, it selects the items with date inside the range while deselecting the others.
- By clicking the **Add Addictive Date Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Date Filter** button, it removes any selected item that matches with the date range.
- In the **Date Filters List** you can see all Date filters applyed and remove individual filters.
- Using the **Clear Date Filters** button, it removes the Date filters.

#### Size
Accepts one or two numbers (expressed in Kb) as input, as file/folder size container range. If one number is null, it will be threaded as 0 (start) or  1.000.000.000 (end).
- By clicking the **Set Size Filter** button, it selects the items with size inside the range while deselecting the others.
- By clicking the **Add Addictive Size Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Size Filter** button, it removes any selected item that matches with the size range.
- In the **Size (Kb) Filters List** you can see all Size filters applyed and remove individual filters.
- Using the **Clear Size Filters** button, it removes the Size filters.

### Actions
There is a panel with action buttons:
- **Swap** swaps Source and (first) Destination folders.
- **Options** Open Options panel.
- **Snapshots** Open Snapshots panel.
- **Help** Open Help panel.

### Options
The **options** panel affects copying and selecting behaviours.

#### Copying
- **Overwrite existing** to choose if overwrite (checked) or not (unchecked) files that already exist.

#### Selecting
- **Propagate Selection** to choose if propagate (checked) or not (unchecked) the selection/deselection click of an item to parent and childen elements.

#### Filtering
- **Relationship OR** to choose the kind of relationship between filter groups, OR (checked) or AND (unchecked).

### Snapshots
The **snapshot** panel manages snapshot (current configuration of folders, filters, and options) save/load/clear;
- **Save Shapshot** to save current snapshot, with a name.
- **Load Saved Shapshot** to load saved snapshot by selected name.
- **Clear Saved Shapshot** to remove saved snapshot by selected name.
- **Clear All Shapshots** to remove all saved snapshots.

### Copying
With the **Copy Selected Items** button, the files are copied from the Source to the Destinations.

**Pay attention:** Copy mode is *strict* on selection: 
only and exclusively the selected items will be copied. 
For example, if a folder is selected but only some of the files inside it are selected, only those will be copied.

### Menus
Trough the **contextual menu** (right click) you have shortcuts to the main features of the application.

The **main menu** contains generic actions, and the help.

There is also the **tray** icon and its minimal menu.
`;
    let underDocs = `
    <hr>
    Written by Alessandro Di Michele<br>
&copy;2025 Atlantide Design <a href="http://www.atlantide-design.it">www.atlantide-design.it</a> All rights reserved.<br>
<br>
Binaries download available on <a href="http://www.atlantide-design.it/copyman"><img src="images/80x80_1col_alt.svg" height="14" /> Copyman</a> website. <br>
Source code available on <a href="https://github.com/atlantidezign/copyman"><i class="bi bi-github"></i> GitHub</a>`;

    let aboutDocs = `
    <h3>Copyman</h3>
    <p>Select and copy files from one folder to multiple destinations while preserving the folder structure.</p>
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

//Shapshot Modal
function initializeSnapshotModal() {
    listSnapshots();
}

//Common for Modals
function initalizeModals() {
    initalizeHelpModal();
    initializeSnapshotModal();
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
    // Mantieni il descrittore originale per la proprietà "value"
    // Flag per evitare ricorsioni
    let updating1 = false;
    let updating2 = false;

// Mantieni il descrittore originale per la proprietà "value"
    const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

    Object.defineProperty(dateFrom, 'value', {
        get() {
            return originalDescriptor.get.call(this);
        },
        set(newValue) {
            // Se siamo già in aggiornamento, aggiorna semplicemente il valore senza dispatchare l'evento
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
            // Se siamo già in aggiornamento, aggiorna semplicemente il valore senza dispatchare l'evento
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
        // Estrae giorno, mese e anno dalla stringa in formato numerico
        const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
        const match = inputValue.match(regex);

        if (!match) {
            // Se il formato non corrisponde, restituisco il valore originale oppure gestisci l'errore come preferisci.
            return inputValue;
        }

        // In base al dateFormat indico quale gruppo rappresenta giorno e mese.
        let day, month, year;
        if (dateFormat === 'dd/mm/yyyy') {
            day   = parseInt(match[1], 10);
            month = parseInt(match[2], 10);
        } else if (dateFormat === 'mm/dd/yyyy') {
            month = parseInt(match[1], 10);
            day   = parseInt(match[2], 10);
        } else {
            // Se il formato non è riconosciuto, restituisco il valore originale.
            return inputValue;
        }
        const cleanYearStr = match[3].replace(/^0+/, '');
// Converte la stringa pulita in numero
        year = parseInt(cleanYearStr, 10);
        // Se l'anno è scritto con 2 cifre, assumiamo il secolo 2000+
        if (cleanYearStr.length < (dateFormat.match(/y/g) || []).length) {
            year += 2000;
        }

        // Corregge il mese se necessario: deve essere tra 1 e 12
        if (month < 1) {
            month = 1;
        }
        if (month > 12) {
            month = 12;
        }

        // Determina il numero massimo di giorni per il mese e l'anno specificati
        const maxDays = new Date(year, month, 0).getDate();
        if (day < 1) {
            day = 1;
        }
        if (day > maxDays) {
            day = maxDays;
        }

        // Formatta giorno e mese con due cifre
        const dayFormatted = day < 10 ? '0' + day : day.toString();
        const monthFormatted = month < 10 ? '0' + month : month.toString();

        // Ricompone la stringa di output basata sul formato originale
        let outputString;
        if (dateFormat === 'dd/mm/yyyy') {
            outputString = `${dayFormatted}/${monthFormatted}/${year}`;
        } else if (dateFormat === 'mm/dd/yyyy') {
            outputString = `${monthFormatted}/${dayFormatted}/${year}`;
        }

        return outputString;
    }


}

//start
initializeComponents();
initalizeModals();

//Business vars
let clicksActive = true; //system: to disactivate clicks while copying
let fileTreeData = []; // system: Struttura dati per l'albero
let messageLife = 3000; //system: Vita messaggi prima della pulizia

//User folders
let sourceFolder = ''; // user choose: directory sorgente
let destinationFolders = []; // user choose: Inizializzazione dell'array per le directory di destinazione

//User filters
let filtersNamePlus = []; //Array<string>
let filtersNameMinus = []; //Array<string>
let filtersDatePlus = []; //Array<{ from: Date, to: Date}>
let filtersDateMinus = []; //Array<{ from: Date, to: Date}>
let filtersSizePlus = []; //Array<{ from: number, to: number}>
let filtersSizeMinus = []; //Array<{ from: number, to: number}>

//User Options
let fileOverwrite = true;
let propagateSelections = true;
let relationshipOR = true;

//Snapshot actions
document.getElementById('saveSnapshot').addEventListener('click', saveSnapshot);
document.getElementById('loadSnapshot').addEventListener('click', loadSnapshot);
document.getElementById('cleanSnapshot').addEventListener('click', cleanSnapshot);
document.getElementById('cleanAllSnapshots').addEventListener('click', cleanAllSnapshots);

function listSnapshots() {
    let selectEl = document.getElementById('loadSnapshotInput');
    selectEl.innerHTML = '';
    let useSettings = [];
    const settingsStr = localStorage.getItem('settings');
    if (settingsStr) {
        useSettings = JSON.parse(settingsStr);
    }
    if (useSettings.length > 0) {
        useSettings.reverse();
        useSettings.forEach((element, index) => {
            //carica tutti nomi, fa elenco e lo append in selectEl e seleziona il primo
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
    const settingsStr = localStorage.getItem('settings');
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
    // Serializzazione dell'oggetto settings in formato JSON e salvataggio nel localStorage
    localStorage.setItem('settings', JSON.stringify(useSettings));
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
    // Recupera le impostazioni salvate dal localStorage
    let useSettings = [];
    const settingsStr = localStorage.getItem('settings');
    if (settingsStr) {
        useSettings = JSON.parse(settingsStr);
    }
    let settings = useSettings.find((setting) => setting.name === useName);
    if (!settings) {
        writeMessage('No saved Snapshot found with name "' + useName + '"');
        return;
    }
    try {
        removeAllFilters();
        // Aggiorna le variabili globali dell'applicazione
        sourceFolder = settings.sourceFolder || '';
        destinationFolders = settings.destinationFolders || [];
        fileOverwrite = (typeof settings.fileOverwrite === 'boolean') ? settings.fileOverwrite : false;
        propagateSelections = (typeof settings.propagateSelections === 'boolean') ? settings.propagateSelections : false;
        relationshipOR = (typeof settings.relationshipOR === 'boolean') ? settings.relationshipOR : false;
        filtersNamePlus = settings.filtersNamePlus || [];
        filtersNameMinus = settings.filtersNameMinus || [];
        filtersDatePlus = settings.filtersDatePlus || [];
        filtersDateMinus = settings.filtersDateMinus || [];
        filtersSizePlus = settings.filtersSizePlus || [];
        filtersSizeMinus = settings.filtersSizeMinus || [];

        // Aggiorna la UI
        const fileOverwriteCheckbox = document.getElementById('overwriteChecked');
        if (fileOverwriteCheckbox) {
            fileOverwriteCheckbox.checked = fileOverwrite;
        }

        const propagateSelectionsCheckbox = document.getElementById('propagateChecked');
        if (propagateSelectionsCheckbox) {
            propagateSelectionsCheckbox.checked = propagateSelections;
        }

        const relationshipORCheckbox = document.getElementById('relationshipORChecked');
        if (relationshipORCheckbox) {
            relationshipORCheckbox.checked = relationshipOR;
        }

        document.getElementById('sourcePath').textContent = sourceFolder;
        fileTreeData = buildFileTree(sourceFolder);
        renderFileTree(fileTreeData);

        updateDestinationList();

        applyAllFilters();

        writeMessage('Snapshot loaded.');
    } catch (error) {
        console.error("Error during Snapshot loading:", error);
        writeMessage('Error during Snapshot loading.');
    }
}

function cleanSnapshot() {
    let useName = document.getElementById('loadSnapshotInput').value.trim().toLowerCase();
    if (!useName) {
        showAlert('Please enter a name for Snapshot to remove.');
        return;
    }

    let useSettings = [];
    const settingsStr = localStorage.getItem('settings');
    if (settingsStr) {
        useSettings = JSON.parse(settingsStr);
    }

    const index = useSettings.findIndex(setting => setting.name === useName);
    if (index !== -1) {
        showConfirm('Are you sure you want to remove Saved Snapshot named ' + useName + '?', cleanCallback);
    } else {
        writeMessage(`No Snapshot with name "${useName}".`);
    }

    function cleanCallback() {
        useSettings.splice(index, 1);
        localStorage.setItem('settings', JSON.stringify(useSettings));
        listSnapshots();
        writeMessage(`Snapshot named "${useName}" removed.`);
    }
}

function cleanAllSnapshots() {
    showConfirm('Are you sure you want to Clean all saved Snapshots?', cleanCallback);

    function cleanCallback() {
        localStorage.removeItem('settings');
        listSnapshots();
        writeMessage('Snapshots cleaned.');
    }
}

//Generale click
document.addEventListener('click', function (event) {
    if (!clicksActive) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }
}, true);

// Selezione cartella sorgente
document.getElementById('selectSource').addEventListener('click', async () => {
    writeMessage('Choose Source folder.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const folder = await ipcRenderer.invoke('select-folder', 'Select Source Folder', sourceFolder);
    if (folder) {
        writeMessage('Scanning Source folder...');
        if (destinationFolders.includes(folder)) {
            showAlert("This folder is in the destination list.");
            return;
        }
        // Controlla che la cartella non sia una sottocartella di una qualsiasi delle cartelle già selezionate
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                showAlert("The source folder cannot be a subfolder of an already selected destination folder.");
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                showAlert("The source folder cannot be a parent folder of an already selected destination folder.");
                return;
            }
        }
        sourceFolder = folder;
        document.getElementById('sourcePath').textContent = folder;
        // Costruisce l'albero dei file
        fileTreeData = buildFileTree(sourceFolder);
        renderFileTree(fileTreeData);
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
    let oldsource = sourceFolder;
    sourceFolder = destinationFolders[0];
    destinationFolders[0] = oldsource;
    document.getElementById('sourcePath').textContent = sourceFolder;
    fileTreeData = buildFileTree(sourceFolder);
    renderFileTree(fileTreeData);
    updateDestinationList();
    applyAllFilters();
    writeMessage('Source / Destination Folders swapped.');
}

// Selezione cartelle destinazione
// Event listener per il pulsante "Aggiungi Destinazione"
document.getElementById('addDestination').addEventListener('click', addDestination);

// Event listener per il pulsante "Rimuovi Tutti"
document.getElementById('clearAllDestinations').addEventListener('click', clearDestinations);

//Destinazione
// Funzione per aggiornare la UI mostrando la lista attuale delle directory
function updateDestinationList() {
    const listContainer = document.getElementById('destinationList');
    listContainer.innerHTML = ''; // Svuota la lista esistente
    if (destinationFolders.length === 0) {
        listContainer.innerHTML = 'Add Destination Folder';
    } else {
        destinationFolders.forEach((folder, index) => {
            const listItem = document.createElement('span');
            listItem.classList.add('badge', 'text-bg-secondary', 'position-relative', 'me-2');
            listItem.textContent = folder;
            const listItemInner = document.createElement('span');
            listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
            // Bottone per rimuovere l'elemento singolarmente
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
}

// Funzione per aggiungere una directory
async function addDestination() {
    writeMessage('Choose a Destination folder.');
    clicksActive = false;
    toggleSpinner(!clicksActive);
    const folder = await ipcRenderer.invoke('select-folder', 'Select destination folder', destinationFolders.length > 0 ? destinationFolders[destinationFolders.length - 1] : "");
    if (folder) {
        // Controlla che la cartella non sia uguale a sourceFolder
        if (folder === sourceFolder) {
            showAlert("The destination folder cannot be the same as the source folder.");
            return;
        }
        // Check that the folder is not already present in the array
        if (destinationFolders.includes(folder)) {
            showAlert("This folder has already been added.");
            return;
        }

        // Controlla che la cartella non sia una sottocartella di sourceFolder
        if (sourceFolder && isSubFolder(folder, sourceFolder) && isSubFolder(sourceFolder, folder)) {
            showAlert("The destination folder cannot be a subfolder or a parent of source folder.");
            return;
        }

        // Controlla che la cartella non sia una sottocartella di una qualsiasi delle cartelle già selezionate
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                showAlert("The destination folder cannot be a subfolder of an already selected destination folder.");
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                showAlert("The destination folder cannot be a parent folder of an already selected destination folder.");
                return;
            }
        }

        // Aggiungi la cartella all'array e aggiorna la lista in UI
        destinationFolders.push(folder);
        updateDestinationList();
        writeMessage('Destination folder added.');
    } else {
        writeMessage('No Destination folder selected.');
    }
    clicksActive = true;
    toggleSpinner(!clicksActive);
}

// Funzione per rimuovere una directory dall'array destinazioni data la sua posizione
function removeDestination(index) {
    destinationFolders.splice(index, 1);
    updateDestinationList();
    writeMessage('Destination folder removed.');
}

// Funzione per rimuovere tutti gli elementi destinazione
function clearDestinations() {
    destinationFolders = [];
    updateDestinationList();
    writeMessage('All Destination folder removed.');
}

//Albero render
// Funzione ricorsiva per costruire la struttura dell'albero dei file
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
            // Calcola la dimensione formattata: in KB se < 1MB, altrimenti in MB
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

// Funzione per renderizzare l'albero in HTML mantenendo lo stato di espansione/collasso predefinito
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
}

// Funzione per creare un nodo (LI) dell'albero con checkbox e, se directory, toggle per espandi/collassa.
// Viene aggiunto un data attribute "nodeName" al checkbox per facilitare il filtraggio.
function createTreeNode(node) {
    const li = document.createElement('li');

    // Contenitore per il toggle e la label
    const labelContainer = document.createElement('span');

    let childUl = null; // verrà creato se il nodo è directory

    // Creiamo il checkbox e lo aggiungiamo sempre, sia per file che per directory
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.filePath = node.path;
    checkbox.dataset.nodeName = node.name;
    checkbox.dataset.nodeSize = node.sizeRaw;
    checkbox.dataset.nodeModified = node.modifiedRaw;
    checkbox.classList.add('form-check-input');

    // Aggiungiamo il listener per il cambio di stato
    checkbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const currentLi = e.target.closest("li");
        // Se il nodo ha figli (ovvero è una directory) propaga il cambiamento verso il basso
        if (currentLi.querySelector("ul")) {
            if (propagateSelections) propagateDown(currentLi, isChecked);
        }
        // Se il checkbox è selezionato, aggiorna anche tutti i genitori
        if (isChecked) {
            if (propagateSelections) propagateUp(currentLi);
        }
        // Se viene deselezionato non facciamo propagazione verso l'alto
    });

    if (node.type === 'directory') {
        // Creiamo l'icona di toggle (inizialmente collassato)
        const toggleIcon = document.createElement('span');
        toggleIcon.textContent = '▷';
        toggleIcon.style.cursor = 'pointer';
        toggleIcon.style.marginRight = '5px';
        labelContainer.appendChild(toggleIcon);

        // Aggiungiamo il checkbox alla label
        labelContainer.appendChild(checkbox);

        // Etichetta
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

        // Creazione della lista dei figli (inizialmente collassata)
        childUl = document.createElement('ul');
        childUl.style.display = 'none';

        if (node.children) {
            node.children.forEach(child => {
                const childLi = createTreeNode(child);
                if (childLi) childUl.appendChild(childLi);
            });
        }
        li.appendChild(childUl);

        // Listener per il toggle: al click espande o collassa il ramo
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
        // Nodo file: aggiungiamo un piccolo spacer per l'allineamento
        const spacer = document.createElement('span');
        spacer.textContent = '    ';
        labelContainer.appendChild(spacer);

        // Aggiungiamo il checkbox del file
        labelContainer.appendChild(checkbox);

        // Etichetta
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

//Albero selezione
// Funzione che si occupa della propagazione verso il basso
function propagateDown(li, isChecked) {
    // Seleziona tutti i checkbox dei nodi figli (ricorsivamente)
    const childCheckboxes = li.querySelectorAll("ul input[type='checkbox']");
    childCheckboxes.forEach(cb => {
        cb.checked = isChecked;
    });
}

// Funzione che si occupa della propagazione verso l'alto
function propagateUp(li) {
    // Trova il genitore più vicino che sia un <li> (ovvero la directory padre)
    const parentLi = li.parentElement.closest('li');
    if (parentLi) {
        const parentCheckbox = parentLi.querySelector("input[type='checkbox']");
        if (parentCheckbox) {
            parentCheckbox.checked = true;
            propagateUp(parentLi);
        }
    }
}

// Funzione per espandere il ramo (impostare display block) per tutti gli antenati del nodo passato
function expandAncestors(element) {
    let parent = element.parentElement;
    while (parent && parent.id !== 'file-tree') {
        if (parent.tagName.toLowerCase() === 'ul') {
            parent.style.display = 'block';
            // Se l'UL è figlio di un LI con toggle, cambia il toggle in "▼"
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

// Gestione dei filtri
// Il filtro seleziona (check) tutti i nodi che corrispondono al criterio; se il filtro è vuoto, deseleziona tutto.

//Filters common
function removeAllFilters() {
    document.getElementById('filterNameInput').value = "";
    resetDateUI();
    resetSizeUI();

    // Itera su tutti i checkbox dell'albero
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
        // Itera su tutti i checkbox dell'albero
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeName = checkbox.dataset.nodeName.toLowerCase();
            if (filterValue !== '' && nodeName.includes(filterValue.toLowerCase())) {
                checkbox.checked = true;
                // Espande i rami per rendere visibile il nodo selezionato
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
    
    //devo applicare i filtri per Date e Size, tenendo conto di relationshipOR true o false (AND)

    for (const filterValue of filtersDatePlus) {
        // Itera su tutti i checkbox dell'albero
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeDate = checkbox.dataset.nodeModified;
            if (dateSingleInsideARange(nodeDate, filterValue)) {
                if (relationshipOR) {
                    checkbox.checked = true;
                    // Espande i rami per rendere visibile il nodo selezionato
                    expandAncestors(checkbox);
                } else {
                    if (filtersNameMinus.length === 0 && filtersNamePlus.length === 0) {
                        checkbox.checked = true;
                        // Espande i rami per rendere visibile il nodo selezionato
                        expandAncestors(checkbox);
                    }
                    //accende se non esistevano i set di condizioni precedenti (nomi per date)
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
        // Itera su tutti i checkbox dell'albero
        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const nodeSize = checkbox.dataset.nodeSize;
            if (sizeSingleInsideARange(nodeSize, filterValue)) {
                if (relationshipOR) {
                    checkbox.checked = true;
                    // Espande i rami per rendere visibile il nodo selezionato
                    expandAncestors(checkbox);
                } else {
                    if (filtersNameMinus.length === 0 && filtersNamePlus.length === 0 && filterDateMinus.length === 0 && filtersDatePlus.length === 0 ) {
                        checkbox.checked = true;
                        // Espande i rami per rendere visibile il nodo selezionato
                        expandAncestors(checkbox);
                    }
                    //accende se non esistevano i set di condizioni precedenti (nomi e date per size)
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
    document.getElementById('filterNameInput').value = "";
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
        document.getElementById('filterNameInput').value = "";
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
        document.getElementById('filterNameInput').value = "";
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
    document.getElementById('filterNameInput').value = "";
    // Itera su tutti i checkbox dell'albero
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
    listContainer.innerHTML = ''; // Svuota la lista esistente
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
            // Bottone per rimuovere l'elemento singolarmente
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
    resetDateUI();
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
        resetDateUI();
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
        resetDateUI();
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

        // Verifica se l'intervallo da controllare è compreso nell'intervallo corrente
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

    // Verifica se l'intervallo da controllare è compreso nell'intervallo corrente
    if (originStart <= pickerPoint && pickerPoint <= originEnd) {
        isInside = true;
    }

    return isInside
}

function removeDateFilters() {
    resetDateUI();
    // Itera su tutti i checkbox dell'albero
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
    listContainer.innerHTML = ''; // Svuota la lista esistente
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
            // Bottone per rimuovere l'elemento singolarmente
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

function resetDateUI() {
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
    resetSizeUI();
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
        resetSizeUI();
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
        resetSizeUI();
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
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            sliderStart = limitRangeSliderValues[0];
        }
    }
    if (typeof sliderEnd !== 'number') {
        const convertedSize = Number(sliderEnd);
        if (!isNaN(convertedSize)) {
            sliderEnd = convertedSize;
        } else {
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            sliderEnd = limitRangeSliderValues[1];
        }
    }
    rangeOrigin.forEach(function (rangePresent) {
        // Imposta gli estremi dell'intervallo dell'origine:
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
                // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
                originStart = limitRangeSliderValues[0];
            }
        }
        if (typeof originEnd !== 'number') {
            const convertedSize = Number(originEnd);
            if (!isNaN(convertedSize)) {
                originEnd = convertedSize;
            } else {
                // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
                originEnd = limitRangeSliderValues[1];
            }
        }
        // Controllo se l'intervallo dello slider è contenuto nell'intervallo corrente
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
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            sliderPoint = limitRangeSliderValues[0];
        }
    }
    // Imposta gli estremi dell'intervallo dell'origine:
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
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            originStart = limitRangeSliderValues[0];
        }
    }
    if (typeof originEnd !== 'number') {
        const convertedSize = Number(originEnd);
        if (!isNaN(convertedSize)) {
            originEnd = convertedSize;
        } else {
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            originEnd = limitRangeSliderValues[1];
        }
    }

    // Controllo se l'intervallo dello slider è contenuto nell'intervallo corrente
    if (originStart <= sliderPoint && sliderPoint <= originEnd) {
        isInside = true;
    }
    return isInside
}

function removeSizeFilters() {
    resetSizeUI();
    // Itera su tutti i checkbox dell'albero
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
            // Bottone per rimuovere l'elemento singolarmente
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

function resetSizeUI() {
    rangeSlider.noUiSlider.set(initialRangeSliderValues)
}

// Seleziona/Deseleziona tutti
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

// Apri/chiudi tutti
document.getElementById('expandAll').addEventListener('click', () => {
    if (!sourceFolder) {
        showAlert("Please select a source folder first.");

        return;
    }

    // Funzione per espandere tutti i nodi dell'albero e aggiornare correttamente l'icona a "▼"
    function expandAllFileTree() {
        // Seleziona il contenitore principale dell'albero
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;

        // Seleziona tutti gli elementi UL annidati all'interno dell'albero
        const nestedLists = treeContainer.querySelectorAll('ul');

        nestedLists.forEach(ul => {
            // Espande il nodo
            ul.style.display = 'block';

            // Se l'UL è figlio di un LI che contiene l'icona di toggle, aggiorna l'icona
            const parentLi = ul.parentElement;
            if (parentLi && parentLi.firstElementChild && parentLi.firstElementChild.firstElementChild) {
                const toggleIcon = parentLi.firstElementChild.firstElementChild;
                // Se il contenuto dell'icona è "▷" o "▼", lo impostiamo a "▼" per indicare stato espanso
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
    // Funzione per collassare tutti i nodi dell'albero (eccetto il contenitore principale)
// e aggiornare correttamente l'icona a "▷"
    function collapseAllFileTree() {
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;

        // Seleziona tutti gli elementi UL all'interno dell'albero
        const allULs = treeContainer.querySelectorAll('ul');

        // Si assume che il primo UL sia il contenitore principale e lo lasciamo visibile
        allULs.forEach(ul => {
            if (ul.parentElement !== treeContainer) {
                ul.style.display = 'none';

                // Se il nodo UL ha un LI padre con toggle, aggiorniamo l'icona a "▷"
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

//Options
document.getElementById("overwriteChecked").addEventListener("change", function () {
    fileOverwrite = this.checked;
    writeMessage('Overwrite Existing setting is now ' + fileOverwrite);
});
document.getElementById("propagateChecked").addEventListener("change", function () {
    propagateSelections = this.checked;
    writeMessage('Propagate Selection setting is now ' + propagateSelections);
});
document.getElementById("relationshipORChecked").addEventListener("change", function () {
    relationshipOR = this.checked;
    writeMessage('Relationship OR setting is now ' + relationshipOR);
    applyAllFilters();
});

//Copia
// Funzione che gestisce la copia degli elementi selezionati
document.getElementById('copySelected').addEventListener('click', async () => {
    // Controlla che sia stata selezionata almeno la cartella di destinazione
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
    writeMessage('Asking for confirmation...');
    showConfirm('Are you sure you want to copy ' + selectedPaths.length + ' items\nfrom ' + sourceFolder + '\nto ' + destinations + '?', copyCallback);

    async function copyCallback() {
        writeMessage('Copy Started...');
        clicksActive = false;
        toggleSpinner(!clicksActive);
        // Copia per ogni elemento selezionato
        let indx = 1;
        for (const relPath of selectedPaths) {
            const sourceFullPath = path.join(sourceFolder, relPath);
            for (const destFolder of destinationFolders) {
                const destinationFullPath = path.join(destFolder, relPath);
                writeMessage('Copying [' + indx + '/' + selectedPaths.length + '] ' + sourceFullPath + ' to ' + destinationFullPath);
                try {
                    await copyRecursive(sourceFullPath, destinationFullPath);
                } catch (err) {
                    console.error('Error copying ', sourceFullPath, destinationFullPath, err);
                    writeMessage('Error copying ' + sourceFullPath + ' in ' + destinationFullPath);
                }
            }
            indx++;
        }
        clicksActive = true;
        toggleSpinner(!clicksActive);
        writeMessage('Copy Completed!');
    }
});

// Funzione ricorsiva per copiare file e directory
async function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, {recursive: true});
        }
        const items = fs.readdirSync(src);
        //for (const item of items) {
        //    await copyRecursive(path.join(src, item), path.join(dest, item));
        //}
    } else {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, {recursive: true});
        }
        if (!fileOverwrite) {
            if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

//Utils
// Funzione per messaggio
let messageTimeout = null;

function writeMessage(message) {
    if (messageTimeout) clearTimeout(messageTimeout);
    document.getElementById('status').textContent = message;
    messageTimeout = setTimeout(() => {
        document.getElementById('status').textContent = '';
    }, messageLife);
}

// Funzione helper per verificare se 'child' è una sottocartella di 'parent'
function isSubFolder(child, parent) {
    const relative = path.relative(parent, child);
    // Se relative è una stringa vuota oppure inizia con ".." o è una path assoluta, child non è una sottocartella di parent
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

// Funzione per attivare/disattivare lo spinner
function toggleSpinner(active) {
    const spinnerOverlay = document.getElementById('spinner-overlay');
    spinnerOverlay.style.display = active ? 'flex' : 'none';
}

//Funzione per gli alert e i confirm che wrappano su native dialogs tramite ipcRender
function showAlert(message) {
    ipcRenderer.invoke("show-alert", message);
}

async function showConfirm(message, callback) {
    const confirmation = await ipcRenderer.invoke('show-confirm', message);
    if (confirmation) callback();
}

//Funzione per format date e size
function formatSize(size) {
    if (typeof size !== 'number') {
        const convertedSize = Number(size);
        if (!isNaN(convertedSize)) {
            size = convertedSize;
        } else {
            // Gestisci il caso in cui la conversione non riesca, ad esempio impostando un valore di default
            size = 0;
        }
    }
    if (size == undefined || size == null) return "???";
    let formattedSize; //attenzione qui è espresso già in kb
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
        // Tenta di convertire ad una data
        date = new Date(date);
    }
    // Estrae giorno, mese e anno dalla data
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() restituisce il mese da 0 a 11
    const yyyy = date.getFullYear();

    // Sostituisce i placeholder nel formato fornito
    return dateFormat.replace('dd', dd).replace('mm', mm).replace('yyyy', yyyy);
}
