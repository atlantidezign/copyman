// TreeManager.js
class TreeManager {
    constructor() {
    }
    realignSelectionAfterDiffsTimeout = null;
    diffed = false;

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

            expandAllFileTree();

            //update secondary tree
            App.treeManager.alignDestinationTree();
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

            //update secondary tree
            App.treeManager.alignDestinationTree();
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
            App.treeManager.updateSourceTree(true);
            App.utils.writeMessage('Source Folder reordered.');
        });
    }

    // Public. Tree updates
    updateSourceTree(direct) {
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const container = document.getElementById('file-tree');
        let doOther = false;
        if (direct) {
            let useName = "preDiffsSnapshot";
            App.model.preDiffsSnapshot = App.snapshotManager.createSnapshotObject(useName);
            App.model.sourceTreeData = this.buildFileTree(App.model.sourceFolder);
        }
        if (direct && App.model.makeTreeDiffs === true && App.model.splitScreen === true) {
            this.computeTreeDiffs( App.model.sourceTreeData, null );
            doOther = true;
        }
        this.renderFileTree(App.model.sourceTreeData, container, true);

        clearTimeout(this.realignSelectionAfterDiffsTimeout);
        this.realignSelectionAfterDiffs(direct);

        if (doOther) this.updateDestinationTree(false)
        this.alignDestinationTree();
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }
    updateDestinationTree(direct) {
        if (App.model.splitScreen === true && App.model.destinationFolders.length > 0) {
            App.model.clicksActive = false;
            App.utils.toggleSpinner(!App.model.clicksActive);
            const container = document.getElementById('dest-tree');
            let doOther = false;
            if (direct) App.model.destTreeData = this.buildFileTree(App.model.destinationFolders[0]);
            if (direct && App.model.makeTreeDiffs === true && App.model.splitScreen === true) {
                this.computeTreeDiffs( null, App.model.destTreeData );
                doOther = true;
            }
            this.renderFileTree(App.model.destTreeData, container, false);
            if (doOther) this.updateSourceTree(false)
            this.alignDestinationTree();
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
        }
    }
    alignDestinationTree() {
        if (App.model.splitScreen === true) {
            //if source tree and dest tree are both rendered: align open/close from source branch to same name dest branch, also align selection/deselection checkboxes from source
            const sourceTree = document.getElementById('file-tree');
            const destinationTree = document.getElementById('dest-tree');
            if (!sourceTree || !destinationTree) {
                return;
            }
            if (sourceTree.innerHTML === "" || destinationTree.innerHTML === "") {
                return;
            }
            const sourceTreeUL = document.getElementById('file-tree').querySelector('ul');
            const destinationTreeUL = document.getElementById('dest-tree').querySelector('ul');
            if (!sourceTreeUL || !destinationTreeUL) {
                return;
            }
            // Start recursive sync from the top UL level
            syncTreeNodes(sourceTreeUL, destinationTreeUL);
        }

        function syncTreeNodes(sourceParent, destParent) {
            const sourceLis = Array.from(sourceParent.children).filter(el => el.tagName.toUpperCase() === 'LI');
            const destLis = Array.from(destParent.children).filter(el => el.tagName.toUpperCase() === 'LI');
            sourceLis.forEach(sourceLi => {
                const sourceCheckbox = sourceLi.querySelector('input[type="checkbox"]');
                if (!sourceCheckbox) return;
                const filePath = sourceCheckbox.dataset.filePath;
                // find corresponding node using filePath
                const destLi = destLis.find(li => {
                    const checkbox = li.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        const destFilePath = checkbox.dataset.filePath;
                        if (destFilePath === filePath) {
                            return true;
                        }
                    }
                    return false;
                });

                if (destLi) {
                    const destCheckbox = destLi.querySelector('input[type="checkbox"]');
                    if (destCheckbox) {
                        destCheckbox.checked = sourceCheckbox.checked;
                    }
                    // if node is directory, sync also open/close state
                    if (sourceCheckbox.dataset.isDirectory === "1") {
                        const sourceChildUl = sourceLi.querySelector('ul');
                        const destChildUl = destLi.querySelector('ul');
                        if (sourceChildUl && destChildUl) {
                            const computedStyle = window.getComputedStyle(sourceChildUl);
                            const isOpen = computedStyle.display !== 'none';
                            destChildUl.style.display = isOpen ? 'block' : 'none';
                            // update toggle icon
                            const destToggleIcon = destLi.querySelector('span span:first-child');
                            if (destToggleIcon) {
                                destToggleIcon.textContent = isOpen ? '▼' : '▷';
                            }
                            // recursively for children
                            syncTreeNodes(sourceChildUl, destChildUl);
                        }
                    }
                }
            });
        }
    }
    alignSourceTree() {
        if (App.model.splitScreen === true) {
            //if source tree and dest tree are both rendered: align open/close from dest branch to same name source branch
            const sourceTree = document.getElementById('file-tree');
            const destinationTree = document.getElementById('dest-tree');
            if (!sourceTree || !destinationTree) {
                return;
            }
            if (sourceTree.innerHTML === "" || destinationTree.innerHTML === "") {
                return;
            }
            const sourceTreeUL = document.getElementById('file-tree').querySelector('ul');
            const destinationTreeUL = document.getElementById('dest-tree').querySelector('ul');
            if (!sourceTreeUL || !destinationTreeUL) {
                return;
            }
            // Start recursive sync from the top UL level
            syncTreeNodes(destinationTreeUL, sourceTreeUL);
        }

        function syncTreeNodes(sourceParent, destParent) {
            const sourceLis = Array.from(sourceParent.children).filter(el => el.tagName.toUpperCase() === 'LI');
            const destLis = Array.from(destParent.children).filter(el => el.tagName.toUpperCase() === 'LI');
            sourceLis.forEach(sourceLi => {
                const sourceCheckbox = sourceLi.querySelector('input[type="checkbox"]');
                if (!sourceCheckbox) return;
                const filePath = sourceCheckbox.dataset.filePath;
                // find corresponding node using filePath
                const destLi = destLis.find(li => {
                    const checkbox = li.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        const destFilePath = checkbox.dataset.filePath;
                        if (destFilePath === filePath) {
                            return true;
                        }
                    }
                    return false;
                });

                if (destLi) {
                    // if node is directory, sync also open/close state
                    if (sourceCheckbox.dataset.isDirectory === "1") {
                        const sourceChildUl = sourceLi.querySelector('ul');
                        const destChildUl = destLi.querySelector('ul');
                        if (sourceChildUl && destChildUl) {
                            const computedStyle = window.getComputedStyle(sourceChildUl);
                            const isOpen = computedStyle.display !== 'none';
                            destChildUl.style.display = isOpen ? 'block' : 'none';
                            // update toggle icon
                            const destToggleIcon = destLi.querySelector('span span:first-child');
                            if (destToggleIcon) {
                                destToggleIcon.textContent = isOpen ? '▼' : '▷';
                            }
                            // recursively for children
                            syncTreeNodes(sourceChildUl, destChildUl);
                        }
                    }
                }
            });
        }
    }

    // Inner - common. Diffs
    computeTreeDiffs( sourceData, destData ) {
        if (!sourceData) {
            if (!App.model.sourceFolder || App.model.sourceFolder === "") return;
            App.model.sourceTreeData = this.buildFileTree(App.model.sourceFolder);
        } else if (!destData) {
            if (!App.model.destinationFolders || App.model.destinationFolders.length === 0 || App.model.destinationFolders[0] === "") return;
            App.model.destTreeData = this.buildFileTree(App.model.destinationFolders[0]);
        }
        const { newSourceTreeData, newDestTreeData } = reconcileTreeData(App.model.sourceTreeData, App.model.destTreeData);

        App.model.sourceTreeData = newSourceTreeData;
        App.model.destTreeData = newDestTreeData;

        //-----------
        // Utility functions for computing the LCS and merging sequences
        function computeLCS(seq1, seq2) {
            const m = seq1.length;
            const n = seq2.length;
            const dp = Array(m + 1)
                .fill(0)
                .map(() => Array(n + 1).fill(0));

            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    if (seq1[i - 1] === seq2[j - 1]) {
                        dp[i][j] = dp[i - 1][j - 1] + 1;
                    } else {
                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    }
                }
            }

            let i = m,
                j = n;
            const lcs = [];
            while (i > 0 && j > 0) {
                if (seq1[i - 1] === seq2[j - 1]) {
                    lcs.unshift(seq1[i - 1]);
                    i--;
                    j--;
                } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                    i--;
                } else {
                    j--;
                }
            }
            return lcs;
        }

        function mergeSequences(sourceSeq, destSeq) {
            const lcs = computeLCS(sourceSeq, destSeq);
            const merged = [];
            let i = 0,
                j = 0;

            for (const common of lcs) {
                // Insert elements from source until the common element is reached
                while (i < sourceSeq.length && sourceSeq[i] !== common) {
                    merged.push(sourceSeq[i]);
                    i++;
                }
                // Insert elements from dest until the common element is reached
                while (j < destSeq.length && destSeq[j] !== common) {
                    if (!merged.includes(destSeq[j])) {
                        merged.push(destSeq[j]);
                    }
                    j++;
                }
                merged.push(common);
                i++;
                j++;
            }
            while (i < sourceSeq.length) {
                merged.push(sourceSeq[i]);
                i++;
            }
            while (j < destSeq.length) {
                merged.push(destSeq[j]);
                j++;
            }
            return merged;
        }

        // Recursive reconciliation function for nested structures
        function reconcileNestedTreeData(sourceNodes, destNodes) {
            // Build maps for quick access by name (assuming names are unique within a directory)
            const sourceMap = new Map(sourceNodes.map(item => [item.name, item]));
            const destMap = new Map(destNodes.map(item => [item.name, item]));

            // Create ordering sequences based on "name"
            const sourceSeq = sourceNodes.map(item => item.name);
            const destSeq = destNodes.map(item => item.name);
            const unifiedOrder = mergeSequences(sourceSeq, destSeq);

            const newSourceNodes = [];
            const newDestNodes = [];

            unifiedOrder.forEach(name => {
                let sourceItem = sourceMap.get(name);
                let destItem = destMap.get(name);

                // Initialization/cloning: if the record exists, clone it; otherwise, create a placeholder based on the other record
                if (sourceItem) {
                    sourceItem = { ...sourceItem };
                }
                if (destItem) {
                    destItem = { ...destItem };
                }
                if (!sourceItem && destItem) {
                    sourceItem = { ...destItem, exists: false, different: false };
                }
                if (!destItem && sourceItem) {
                    destItem = { ...sourceItem, exists: false, different: false };
                }
                if (!sourceItem && !destItem) {
                    sourceItem = { name, exists: false, different: false, type: "directory" };
                    destItem = { name, exists: false, different: false, type: "directory" };
                }

                // Check for differences on the data (if both exist)
                if (sourceItem.exists !== false && destItem.exists !== false) {
                    let modMs = false;
                    if (sourceItem.modifiedMs !== destItem.modifiedMs) {
                        let tolerance = App.model.msBaseTolerance + (sourceItem.sizeRaw / App.model.msCopySpeed)
                        if (Math.abs(sourceItem.modifiedMs - destItem.modifiedMs) > tolerance) { modMs = true;}
                    }
                    if (sourceItem.sizeRaw !== destItem.sizeRaw || modMs) {
                        sourceItem.different = true;
                        destItem.different = true;
                    } else {
                        sourceItem.different = false;
                        destItem.different = false;
                    }
                }

                // If the item is a directory and has children, recursively reconcile the children
                if (sourceItem.type === "directory") {
                    const sourceChildren = sourceItem.children || [];
                    const destChildren = destItem.children || [];

                    // Recursively call the reconciliation function for the children
                    const { newSourceNodes: newChildrenSource, newDestNodes: newChildrenDest } = reconcileNestedTreeData(sourceChildren, destChildren);

                    sourceItem.children = newChildrenSource;
                    destItem.children = newChildrenDest;
                }

                newSourceNodes.push(sourceItem);
                newDestNodes.push(destItem);
            });

            return { newSourceNodes, newDestNodes };
        }

        // Recursive function to propagate flags in a nested structure
        function propagateFlagsNested(nodes, parentFlags = { exists: true, different: false }) {
            nodes.forEach(node => {
                // If the parent (for a directory) does not exist or is marked as different, propagate these flags to the children.
                if (parentFlags.exists === false) {
                    node.exists = false;
                }
                if (parentFlags.different === true) {
                    node.different = true;
                }
                // Calculate the flags to be propagated: the node's own flag combined with the inherited ones
                const currentFlags = {
                    exists: node.exists,
                    different: node.different
                };
                if (node.type === "directory" && node.children && node.children.length > 0) {
                    propagateFlagsNested(node.children, currentFlags);
                }
            });
        }

        // Main function for full reconciliation of nested tree data
        // The inputs are the nested trees for source and dest, represented as arrays of root nodes
        function reconcileTreeData(sourceTreeData, destTreeData) {
            // Recursively reconcile the top-level nodes
            const { newSourceNodes, newDestNodes } = reconcileNestedTreeData(sourceTreeData, destTreeData);

            // Propagate flags recursively in both trees
            propagateFlagsNested(newSourceNodes);
            propagateFlagsNested(newDestNodes);

            return { newSourceTreeData: newSourceNodes, newDestTreeData: newDestNodes };
        }
        //-----------
    }
    realignSelectionAfterDiffs(direct) {
        this.realignSelectionAfterDiffsTimeout = setTimeout( ()=> {
            if (App.model.preDiffsSnapshot) {
                // apply filters, selection, stats
                App.snapshotManager.setFromSnapshottedSelection(App.model.preDiffsSnapshot);
                App.model.preDiffsSnapshot = null;
                App.utils.writeMessage('Selection restored.');
            }
        }, App.model.afterDiffsTimeout);
    }

    // Public. Diffs
    updateTreeDiffs() {
        if (App.model.splitScreen === true && App.model.makeTreeDiffs === true) {
            if (!this.diffed) {
                this.diffed = true;
                // Show diff
                doUpdate();
            }
        } else {
            if (this.diffed) {
                this.diffed = false;
                // Hide diff
                doUpdate();
            }
        }
        function doUpdate() {
            if (!App.model.sourceFolder || App.model.sourceFolder === "") return;
            App.treeManager.updateSourceTree(true);
            //if (!App.model.destinationFolders || App.model.destinationFolders.length === 0 || App.model.destinationFolders[0] === "") return;
            //App.treeManager.updateDestinationTree(true);
        }
    }

    // Inner - common. Tree rendering
    renderFileTree(treeData, container, isSource) {
        container.innerHTML = '';
        if (isSource) {
            container.innerHTML += '<div class="tree-folder-name">Source: <b>' + App.model.sourceFolder + '</b></div>';
        } else {
            container.innerHTML += '<div class="tree-folder-name">Destination #1: <b>' + App.model.destinationFolders[0] + '</b></div>';
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
        labelContainer.classList.add('label-node');
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
        checkbox.classList.add('check-node');

        if (node.exists) {
            labelContainer.classList.add('node-exists');
            checkbox.classList.add('node-exists');
            if (node.different) {
                labelContainer.classList.add('node-different');
                checkbox.classList.add('node-different');
            } else {
                labelContainer.classList.add('node-same');
                checkbox.classList.add('node-same');
            }
        } else {
            labelContainer.classList.add('node-missing');
            checkbox.classList.add('node-missing');
        }
        if (isSource) {
            labelContainer.classList.add('node-source');
            checkbox.classList.add('node-source');
        } else {
            labelContainer.classList.add('node-destination');
            checkbox.classList.add('node-destination');
        }

        if (isSource && node.exists) {
            // listener for state change
            checkbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                const currentLi = e.target.closest("li");
                // if node has children (is directory) propagate down
                if (currentLi.querySelector("ul")) {
                    if (App.model.propagateSelections) App.treeManager.propagateDown(currentLi, isChecked);
                }
                // if checkbox selected, update all parents too, if unchecked, no on-parents propagation
                if (isChecked) {
                    if (App.model.propagateSelections) App.treeManager.propagateUp(currentLi);
                }
                //update stats
                App.selectionListManager.updateSelectionStats();
            });
        } else {
            checkbox.disabled = true;
        }

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

            if (isSource && node.exists) {
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
            childUl.classList.add('ul-node');
            if (node.exists) {
                childUl.classList.add('node-exists');
                if (node.different) {
                    childUl.classList.add('node-different');
                } else {
                    childUl.classList.add('node-same');
                }
            } else {
                childUl.classList.add('node-missing');
            }

            if (isSource) {
                childUl.classList.add('node-source');
            } else {
                childUl.classList.add('node-destination');
            }

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
                if (isSource) {
                    //update secondary tree
                    App.treeManager.alignDestinationTree();
                } else {
                    App.treeManager.alignSourceTree();
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

            if (isSource && node.exists) {
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
                    sizeRaw: 0,
                    exists: true,
                    different: false
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
                    sizeRaw: stats.size,
                    exists: true,
                    different: false
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