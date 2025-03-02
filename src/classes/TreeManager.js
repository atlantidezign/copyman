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
            App.treeManager.updateTree();
            App.utils.writeMessage('Source Folder reordered.');
        });
    }

    /**
     * Build file system tree array.
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

    // Tree rendering
    renderFileTree(treeData) {
        const container = document.getElementById('file-tree');
        container.innerHTML = '';
        const ul = document.createElement('ul');
        treeData.forEach(node => {
            const li = this.createTreeNode(node);
            if (li) {
                ul.appendChild(li);
            }
        });
        container.appendChild(ul);

        App.selectionListManager.updateListContent();
    }

    createTreeNode(node) {
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

            App.selectionListManager.updateListContent();
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
            labelExtrasSize.textContent = (node.size !== "" ? " " + node.size : "");
            label.appendChild(labelExtrasSize);
            labelContainer.appendChild(label);

            li.appendChild(labelContainer);

            // children list (collapsed)
            childUl = document.createElement('ul');
            childUl.style.display = 'none';

            if (node.children) {
                node.children.forEach(child => {
                    const childLi = App.treeManager.createTreeNode(child);
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
            labelExtrasSize.textContent = (node.size !== "" ? " " + node.size : "");
            label.appendChild(labelExtrasSize);
            labelContainer.appendChild(label);

            li.appendChild(labelContainer);
        }
        return li;
    }

    // Tree update
    updateTree() {
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        App.model.fileTreeData = this.buildFileTree(App.model.sourceFolder);
        this.renderFileTree(App.model.fileTreeData);
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }

    //Tree selections
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

    expandAncestors(element) {
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


}

module.exports = TreeManager;