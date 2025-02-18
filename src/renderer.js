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
        case 'menu-settings-save':
            saveSettings();
            break;
        case 'menu-settings-load':
            loadSettings()
            break;
        case 'menu-settings-clean':
            cleanSettings()
            break;
        case 'menu-help':
            showHelpModal()
            break;
    }
});
ipcRenderer.on('main-menu-command', (e, command) => {
    switch (command) {
        case 'menu-help':
            showHelpModal();
            break;
    }
});

//Help Modal
function initalizeModal() {
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
- TBD

#### Size
- TBD

### Options
The **options** panel affects copying and selecting behaviours.

#### Copying
- **Overwrite existing** to choose if overwrite (checked) or not (unchecked) files that already exist.

#### Selecting
- **Propagate Selection** to choose if propagate (checked) or not (unchecked) the selection/deselection click of an item to parent and childen elements.
- **Relationship OR** to choose the kind of relationship between filter groups, OR (checked) or AND (unchecked).

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
&copy;2025 Atlantide Design <a href="http://www.atlantide-design.it">www.atlantide-design.it</a> All rights reserved.`;
    document.getElementById('helpContentMD').innerHTML = marked.parse(markdown) + underDocs;
}
function showHelpModal() {
    document.getElementById('modalTrigger').click();
}
initalizeModal();

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

//User settings
let fileOverwrite = true;
let propagateSelections = true;
let relationshipOR = true;

//Settings actions
function saveSettings() {
    let settings = {
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
        filtersDatePlus:filtersDatePlus,
        filtersDateMinus:filtersDateMinus,
        filtersSizePlus:filtersSizePlus,
        filtersSizeMinus:filtersSizeMinus,
    }
    // Serializzazione dell'oggetto settings in formato JSON e salvataggio nel localStorage
    localStorage.setItem('settings', JSON.stringify(settings));
    writeMessage('Settings saved.');
}
function loadSettings() {
    writeMessage('Loading settings...');
    // Recupera le impostazioni salvate dal localStorage
    const settingsStr = localStorage.getItem('settings');
    if (!settingsStr) {
        writeMessage('No saved settings found.');
        return;
    }
    try {
        const settings = JSON.parse(settingsStr);
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

        writeMessage('Settings loaded.');
    } catch (error) {
        console.error("Error during settings loading:", error);
        writeMessage('Error during settings loading.');
    }
}
function cleanSettings() {
    showConfirm('Are you sure you want to clean saved settings?', cleanCallback);
    function cleanCallback() {
        localStorage.removeItem('settings');
        writeMessage('Settings cleaned.');
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
    const folder = await ipcRenderer.invoke('select-folder', 'Select destination folder', destinationFolders.length > 0? destinationFolders[destinationFolders.length-1] : "");
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
            let formattedSize;
            if (stats.size < 1024 * 1024) {
                formattedSize = (stats.size / 1024).toFixed(2) + " kb";
            } else {
                formattedSize = (stats.size / (1024 * 1024)).toFixed(2) + " mb";
            }

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
    document.getElementById('filterDateInput').value = "";
    document.getElementById('filterSizeInput').value = "";
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
    //TODO devo fare i filtri per Date e Size, su checkbox.modifiedRaw: Date, e checkbox.sizeRaw: number

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
    writeMessage('Removed filter "' + kind + oldFilter + '".');
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
//TODO ui handlers for Date
document.getElementById('clearDateFilter').addEventListener('click', () => {
    removeDateFilters();
});
function removeDateFilters() {
    //TODO
}
function removeSingleDateFilter() {
    //TODO
}
function renderDateFiltersList() {
    //TODO
}

//Filters Size
//TODO ui handlers for Size
document.getElementById('clearSizeFilter').addEventListener('click', () => {
    removeSizeFilters();
});
function removeSizeFilters() {
    //TODO
}
function removeSingleSizeFilter() {
    //TODO
}
function renderSizeFiltersList() {
    //TODO
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

//Settings
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

//Funzione per gli alert
function showAlert(message) {
    ipcRenderer.invoke("show-alert", message);
}
async function showConfirm(message, callback) {
    const confirmation = await ipcRenderer.invoke('show-confirm', message);
    if(confirmation) callback();
}