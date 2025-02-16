const {ipcRenderer} = require('electron');
const fs = require('fs');
const path = require('path');

// Live reload
(async () => {
    const watcher_html = fs.watch('./index.html');
    watcher_html.on('change', () => {
        ipcRenderer.send('re-render');
    });
    const watcher_css = fs.watch('./index.css');
    watcher_css.on('change', () => {
        ipcRenderer.send('re-render');
    });
})();

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
        case 'menu-filter-clear':
            document.getElementById('clearFilter').click();
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
    }
});


//Business logic
let clicksActive = true; //system: to disactivate clicks while copying
let fileTreeData = []; // system: Struttura dati per l'albero
let messageLife = 3000; //system: Vita messaggi prima della pulizia

//User folders
let sourceFolder = ''; // user choose: directory sorgente
let destinationFolders = []; // user choose: Inizializzazione dell'array per le directory di destinazione

//User filters
let filtersNamePlus = [];
let filtersNameMinus = [];

//User settings
let fileOverwrite = true;
let propagateSelections = true;

function saveSettings() {
    let settings = {
        //source and destinations folders
        sourceFolder: sourceFolder,
        destinationFolders: destinationFolders,
        //user settings (overwrite, propagate + nuovi)
        fileOverwrite: fileOverwrite,
        propagateSelections: propagateSelections,
        //filters (name + nuovi)
        filtersNamePlus: filtersNamePlus,
        filtersNameMinus: filtersNameMinus
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
        filtersNamePlus = settings.filtersNamePlus || [];
        filtersNameMinus = settings.filtersNameMinus || [];

        // Aggiorna la UI
        const fileOverwriteCheckbox = document.getElementById('overwriteChecked');
        if (fileOverwriteCheckbox) {
            fileOverwriteCheckbox.checked = fileOverwrite;
        }

        const propagateSelectionsCheckbox = document.getElementById('propagateChecked');
        if (propagateSelectionsCheckbox) {
            propagateSelectionsCheckbox.checked = propagateSelections;
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
    if (confirm('Are you sure you want to clean saved settings?')) {
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
    const folder = await ipcRenderer.invoke('select-folder', 'Select Source Folder');
    if (folder) {
        removeAllFilters();
        if (destinationFolders.includes(folder)) {
            alert("This folder is in the destination list.");
            return;
        }
        // Controlla che la cartella non sia una sottocartella di una qualsiasi delle cartelle già selezionate
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                alert("The source folder cannot be a subfolder of an already selected destination folder.");
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                alert("The source folder cannot be a parent folder of an already selected destination folder.");
                return;
            }
        }
        sourceFolder = folder;
        document.getElementById('sourcePath').textContent = folder;
        // Costruisce l'albero dei file
        fileTreeData = buildFileTree(sourceFolder);
        renderFileTree(fileTreeData);
        writeMessage('Source folder choosen.');
    }
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
    const folder = await ipcRenderer.invoke('select-folder', 'Select destination folder');
    if (folder) {
        // Controlla che la cartella non sia uguale a sourceFolder
        if (folder === sourceFolder) {
            alert("The destination folder cannot be the same as the source folder.");
            return;
        }
        // Check that the folder is not already present in the array
        if (destinationFolders.includes(folder)) {
            alert("This folder has already been added.");
            return;
        }

        // Controlla che la cartella non sia una sottocartella di sourceFolder
        if (sourceFolder && isSubFolder(folder, sourceFolder) && isSubFolder(sourceFolder, folder)) {
            alert("The destination folder cannot be a subfolder or a parent of source folder.");
            return;
        }

        // Controlla che la cartella non sia una sottocartella di una qualsiasi delle cartelle già selezionate
        for (const destFolder of destinationFolders) {
            if (isSubFolder(folder, destFolder)) {
                alert("The destination folder cannot be a subfolder of an already selected destination folder.");
                return;
            }
            if (isSubFolder(destFolder, folder)) {
                alert("The destination folder cannot be a parent folder of an already selected destination folder.");
                return;
            }
        }

        // Aggiungi la cartella all'array e aggiorna la lista in UI
        destinationFolders.push(folder);
        updateDestinationList();
    }
    writeMessage('Destination folder added.');
}
// Funzione per rimuovere una directory dall'array data la sua posizione
function removeDestination(index) {
    destinationFolders.splice(index, 1);
    updateDestinationList();
    writeMessage('Destination folder removed.');
}
// Funzione per rimuovere tutti gli elementi
function clearDestinations() {
    destinationFolders = [];
    updateDestinationList();
    writeMessage('All Destination folder removed.');
}

//Albero
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
                children: buildFileTree(fullPath, itemRelativePath)
            });
        } else {
            tree.push({
                name: item,
                path: itemRelativePath,
                type: 'file'
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
        labelContainer.appendChild(label);

        li.appendChild(labelContainer);
    }
    return li;
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
document.getElementById('setFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        alert("Please select a source folder first.");
        return;
    }
    const filterValue = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!filterValue) {
        alert("Please enter a string for filter.");
        return;
    }
    filtersNamePlus = [filterValue];
    filtersNameMinus = [];
    document.getElementById('filterInput').value = "";
    applyAllFilters();
});
document.getElementById('addMinusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        alert("Please select a source folder first.");
        return;
    }
    const filterValue = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!filterValue) {
        alert("Please enter a string for filter.");
        return;
    }
    if (filtersNameMinus.indexOf(filterValue) < 0 && filtersNamePlus.indexOf(filterValue) < 0) {
        filtersNameMinus.push(filterValue);
        document.getElementById('filterInput').value = "";
        applyAllFilters();
    } else {
        alert("This filter is already present.");
        writeMessage('Filter "' + filterValue +'" is already present.');
    }
});
document.getElementById('addPlusFilter').addEventListener('click', () => {
    if (!sourceFolder) {
        alert("Please select a source folder first.");
        return;
    }
    const filterValue = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!filterValue) {
        alert("Please enter a string for filter.");
        return;
    }
    if (filtersNameMinus.indexOf(filterValue) < 0 && filtersNamePlus.indexOf(filterValue) < 0) {
        filtersNamePlus.push(filterValue);
        document.getElementById('filterInput').value = "";
        applyAllFilters();
    } else {
        alert("This filter is already present.");
        writeMessage('Filter "' + filterValue +'" is already present.');
    }

});
document.getElementById('clearFilter').addEventListener('click', () => {
    removeAllFilters();
});
function removeAllFilters() {
    document.getElementById('filterInput').value = "";
    // Itera su tutti i checkbox dell'albero
    filtersNamePlus = [];
    filtersNameMinus = [];
    renderFiltersList();
    removeAllSelection();
    writeMessage('All filters removed.');
}
function removeAllSelection() {
    const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}
function applyAllFilters() {
    renderFiltersList();
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
    writeMessage('Filters updated.');
}
function renderFiltersList() {
    const listContainer = document.getElementById('filterList');
    listContainer.innerHTML = ''; // Svuota la lista esistente
    drawFiltersFor(filtersNamePlus, "+");
    drawFiltersFor(filtersNameMinus, "-");
    if (listContainer.innerHTML == '') listContainer.innerHTML = 'Filters list'
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
                removeSingleFilter(index, filterKind);
            });
            removeButton.style.cursor = 'pointer';
            listItemInner.appendChild(removeButton);
            listItem.appendChild(listItemInner);
            listContainer.appendChild(listItem);
        });
    }
}
function removeSingleFilter(index, kind) {
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

// Seleziona/Deseleziona tutti
document.getElementById('selectAll').addEventListener('click', () => {
    if (!sourceFolder) {
        alert("Please select a source folder first.");
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
        alert("Please select a source folder first.");
        return;
    }
    writeMessage('All items deselected.');
    removeAllFilters();
});

// Apri/chiudi tutti
document.getElementById('expandAll').addEventListener('click', () => {
    if (!sourceFolder) {
        alert("Please select a source folder first.");
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
        alert("Please select a source folder first.");
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
    writeMessage('Overwrite setting is now ' + fileOverwrite);
});
document.getElementById("propagateChecked").addEventListener("change", function () {
    propagateSelections = this.checked;
    writeMessage('Propagate setting is now ' + propagateSelections);
});

//Copia
// Funzione che gestisce la copia degli elementi selezionati
document.getElementById('copySelected').addEventListener('click', async () => {
    // Controlla che sia stata selezionata almeno la cartella di destinazione
    writeMessage('Checking for Copy...');
    if (destinationFolders.length === 0) {
        alert('Please select at least a Destination Folder!');
        writeMessage('Unable to start copying.');
        return;
    }
    if (!sourceFolder) {
        alert('Please select the Source Folder!');
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
        alert('No selected Items.\nPlease select at least one item.');
        writeMessage('Unable to start copying.');
        return;
    }
    if (destinationFolders.includes(sourceFolder)) {
        alert('Source and some Destination Folder are the same.\nPlease select different folders.');
        writeMessage('Unable to start copying.');
        return;
    }
    let destinations = destinationFolders.join(", ");
    writeMessage('Checking for Copy passed.');
    if (!confirm('Are you sure you want to copy ' + selectedPaths.length + ' items\nfrom ' + sourceFolder + '\nto ' + destinations + '?')) {
        return;
    }
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

