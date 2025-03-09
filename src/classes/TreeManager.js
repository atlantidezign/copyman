// TreeManager.js
class TreeManager {
    constructor() {
    }

    init() {
        // Tree Expand/Collapse all
        document.getElementById('expandAll').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }

            // expand all tree nodes and update icon to "▼"
            function expandAllFileTree()
            {
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
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

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
        // Sort
        document.getElementById('sortOrderCombo').addEventListener('change', (e) => {
            App.model.sortOrder = e.target.value;
            App.optionsManager.saveOptions();
            App.utils.writeMessage('Sort order setting is now ' + App.model.sortOrder);

            if (!App.model.sourceFolder) {
                App.utils.showAlert('Please select the Source Folder!');
                App.utils.writeMessage('Unable to reorder Source Folder.');
                return;
            }
            // rebuild tree
            App.treeManager.updateSourceTree();
            App.utils.writeMessage('Source Folder reordered.');
        });
    }

    // Public. Tree update
    updateSourceTree() {
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        App.model.fileTreeData = this.buildFileTree(App.model.sourceFolder);
        const container = document.getElementById('file-tree');
        this.renderFileTree(App.model.fileTreeData, container, true);
        this.alignDestinationTree();
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }
    renderDestinationTree() {
        if (App.model.splitScreen === true && App.model.destinationFolders.length > 0) {
            App.model.clicksActive = false;
            App.utils.toggleSpinner(!App.model.clicksActive);
            App.model.destTreeData = this.buildFileTree(App.model.destinationFolders[0]);
            const container = document.getElementById('dest-tree');
            this.renderFileTree(App.model.destTreeData, container, false);
            this.alignDestinationTree();
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
        }
    }
    alignDestinationTree() {
        //TODO SPLIT SCREEN  update opened etc as in source tree
    }

    // Inner - common. Tree rendering
    renderFileTree(treeData, container, isSource) {
        console.log("%%%%%%%%%%% renderFileTree", treeData, container, isSource);
        container.innerHTML = '';
        if (isSource) {
            container.innerHTML += '<div class="tree-folder-name">Source: <b>'+App.model.sourceFolder +'</b></div>';
        } else {
            container.innerHTML += '<div class="tree-folder-name">Destination #1: <b>'+App.model.destinationFolders[0] +'</b></div>';
        }
        const ul = document.createElement('ul');
        treeData.forEach(node => {
            const li = this.createTreeNode(node, isSource);
            if (li) {
                ul.appendChild(li);
            }
        });
        container.appendChild(ul);
    }
    createTreeNode(node, isSource) {
        const li = document.createElement('li');

        // toggle and label container
        const labelContainer = document.createElement('span');

        let childUl = null; // created if directory
        let checkbox = null;

        if (isSource) {
            // checkbox, for file or directory
            checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.filePath = node.path;
            checkbox.dataset.nodeName = node.name;
            checkbox.dataset.nodeSize = node.sizeRaw;
            checkbox.dataset.nodeModified = node.modifiedRaw;
            checkbox.dataset.nodeMS = node.modifiedMs;
            checkbox.dataset.isDirectory = (node.type === 'directory') ? "1" : "0";
            checkbox.classList.add('form-check-input');

            // listener for state change
            checkbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const currentLi = e.target.closest("li");
                // if node has children (is directory) propagate down
                if (currentLi.querySelector("ul")) {
                    if (App.model.propagateSelections) App.treeManager.propagateDown(currentLi, isChecked);
                }
                // if checkbox selected, update all parents too
                if (isChecked) {
                    if (App.model.propagateSelections) App.treeManager.propagateUp(currentLi);
                }
                // if unchecked, no on-parents propagation

                //update stats
                App.selectionListManager.updatetSelectionStats();
            });
        }
        if (node.type === 'directory') {
            // icon toggle (collapsed)
            const toggleIcon = document.createElement('span');
            toggleIcon.textContent = '▷';
            toggleIcon.style.cursor = 'pointer';
            toggleIcon.style.marginRight = '5px';
            labelContainer.appendChild(toggleIcon);

            // add checkbox
            if (isSource) labelContainer.appendChild(checkbox);

            // label
            const label = document.createElement('span');
            label.textContent = ' ' + node.name;
            const labelExtrasDate = document.createElement('span');
            labelExtrasDate.classList.add('label-extras-date');
            labelExtrasDate.textContent = node.modified;
            label.appendChild(labelExtrasDate);
            const labelExtrasSize = document.createElement('span');
            labelExtrasSize.classList.add('label-extras-size');
            labelExtrasSize.textContent = (node.size !== "" ? " " + node.size : "");
            label.appendChild(labelExtrasSize);
            labelContainer.appendChild(label);

            if (isSource) {
                if (App.model.clickOnNamesToSelect) {
                    labelContainer.style.cursor = 'pointer';
                }
                // Add an event listener on the labelContainer for the text spans:
                // This allows clicking on the label, date, or size to simulate a click on the checkbox.
                labelContainer.addEventListener('click', (e) => {
                    // Do nothing if the click is on the toggle icon or on the checkbox itself
                    if (e.target === toggleIcon || e.target === checkbox) return;
                    if (App.model.clickOnNamesToSelect) {
                        // Simulate a click on the checkbox
                        checkbox.click();
                        // Prevent further propagation if needed
                        e.stopPropagation();
                    }
                });
            }
            li.appendChild(labelContainer);

            // children list (collapsed)
            childUl = document.createElement('ul');
            childUl.style.display = 'none';

            if (node.children) {
                node.children.forEach(child => {
                    const childLi = App.treeManager.createTreeNode(child, isSource);
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
            if (isSource) labelContainer.appendChild(checkbox);

            // label
            const label = document.createElement('span');
            label.textContent = ' ' + node.name;
            const labelExtrasDate = document.createElement('span');
            labelExtrasDate.classList.add('label-extras-date');
            labelExtrasDate.textContent = node.modified;
            label.appendChild(labelExtrasDate);
            const labelExtrasSize = document.createElement('span');
            labelExtrasSize.classList.add('label-extras-size');
            labelExtrasSize.textContent = (node.size !== "" ? " " + node.size : "");
            label.appendChild(labelExtrasSize);
            labelContainer.appendChild(label);

            if (isSource) {
                // Add an event listener on the labelContainer for the text spans:
                // This allows clicking on the label, date, or size to simulate a click on the checkbox.
                if (App.model.clickOnNamesToSelect) {
                    labelContainer.style.cursor = 'pointer';
                }
                labelContainer.addEventListener('click', (e) => {
                    // Do nothing if the click is on the toggle icon or on the checkbox itself
                    if (e.target === checkbox) return;
                    if (App.model.clickOnNamesToSelect) {
                        // Simulate a click on the checkbox
                        checkbox.click();
                        // Prevent further propagation if needed
                        e.stopPropagation();
                    }
                });
            }

            li.appendChild(labelContainer);
        }
        return li;
    }

    /**
     * Inner - common. Build file system tree array.
     *
     * @param {string} dir - directory to scan.
     * @param {string} [relativePath=''] - relative path .
     * sortOrder: "alphabetical", "reverseAlphabetical", "sizeAsc", "sizeDesc", "dateAsc", "dateDesc", "extAsc", "extDesc".
     * @returns {Array} - Array of objects representing the tree.
     */
    buildFileTree(dir, relativePath = '') {
        let sortOrder = App.model.sortOrder; //
        if (!sortOrder) sortOrder = 'alphabetical';
        const tree = [];
        let items = fs.readdirSync(dir);
        // Temporary array needed for sorting
        let itemsData = items.map(item => {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            return {
                item,
                fullPath,
                stats,
                ext: stats.isFile() ? path.extname(item).toLowerCase() : ''
            };
        });
        // Sort depending on sortOrder
        switch (sortOrder) {
            case 'alphabetical':
                itemsData.sort((a, b) => a.item.localeCompare(b.item));
                break;
            case 'reverseAlphabetical':
                itemsData.sort((a, b) => b.item.localeCompare(a.item));
                break;
            case 'sizeAsc':
                itemsData.sort((a, b) => (a.stats.size || 0) - (b.stats.size || 0));
                break;
            case 'sizeDesc':
                itemsData.sort((a, b) => (b.stats.size || 0) - (a.stats.size || 0));
                break;
            case 'dateAsc':
                itemsData.sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);
                break;
            case 'dateDesc':
                itemsData.sort((a, b) => b.stats.mtimeMs - a.stats.mtimeMs);
                break;
            case 'extAsc':
                itemsData.sort((a, b) => a.ext.localeCompare(b.ext));
                break;
            case 'extDesc':
                itemsData.sort((a, b) => b.ext.localeCompare(a.ext));
                break;
            default:
                // default.
                itemsData.sort((a, b) => a.item.localeCompare(b.item));
                break;
        }

        // Tree render
        itemsData.forEach(data => {
            const { item, fullPath, stats } = data;
            const itemRelativePath = path.join(relativePath, item);
            if (stats.isDirectory()) {
                tree.push({
                    name: item,
                    path: itemRelativePath,
                    type: 'directory',
                    children: this.buildFileTree(fullPath, itemRelativePath),
                    modified: stats.mtime.toLocaleDateString(),
                    modifiedRaw: stats.mtime,
                    modifiedMs: stats.mtimeMs,
                    size: "",
                    sizeRaw: 0
                });
            } else {
                // check size for format: KB  if < 1MB, else MB
                let formattedSize = App.utils.formatSizeForThree(stats.size);
                tree.push({
                    name: item,
                    path: itemRelativePath,
                    type: 'file',
                    modified: stats.mtime.toLocaleDateString(),
                    modifiedRaw: stats.mtime,
                    modifiedMs: stats.mtimeMs,
                    size: formattedSize,
                    sizeRaw: stats.size
                });
            }
        });
        return tree;
    }

    // Inner - uses checkboxes. Tree selections
    propagateDown(li, isChecked) {
        // recursively select all checkbox of children
        const childCheckboxes = li.querySelectorAll("ul input[type='checkbox']");
        childCheckboxes.forEach(cb => {
            cb.checked = isChecked;
        });
    }
    propagateUp(li) {
        // find <li> parent
        const parentLi = li.parentElement.closest('li');
        if (parentLi) {
            const parentCheckbox = parentLi.querySelector("input[type='checkbox']");
            if (parentCheckbox) {
                parentCheckbox.checked = true;
                this.propagateUp(parentLi);
            }
        }
    }

    // Public - common. Tree expand
    expandAncestors(element) {
        let parent = element.parentElement;
        while (parent && parent.id !== 'file-tree' && parent.id !== 'dest-tree') {
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

}

module.exports = TreeManager;