// CopyManager.js
class CopyManager {
    constructor() {
    }

    init() {

        // Source folder
        document.getElementById('selectSource').addEventListener('click', async () => {
            App.utils.writeMessage('Choose Source folder.');
            App.model.clicksActive = false;
            App.utils.toggleSpinner(!App.model.clicksActive);
            const folder = await ipcRenderer.invoke('select-folder', 'Select Source Folder', App.model.sourceFolder);
            if (folder) {
                App.utils.writeMessage('Scanning Source folder...');
                if (App.model.destinationFolders.includes(folder)) {
                    App.utils.showAlert("This folder is in the destination list.");
                    App.model.clicksActive = true;
                    App.utils.toggleSpinner(!App.model.clicksActive);
                    return;
                }
                // check folder is not a folder of something else already selected
                for (const destFolder of App.model.destinationFolders) {
                    if (App.utils.isSubFolder(folder, destFolder)) {
                        App.utils.showAlert("The source folder cannot be a subfolder of an already selected destination folder.");
                        App.model.clicksActive = true;
                        App.utils.toggleSpinner(!App.model.clicksActive);
                        return;
                    }
                    if (App.utils.isSubFolder(destFolder, folder)) {
                        App.utils.showAlert("The source folder cannot be a parent folder of an already selected destination folder.");
                        App.model.clicksActive = true;
                        App.utils.toggleSpinner(!App.model.clicksActive);
                        return;
                    }
                }
                App.model.sourceFolder = folder;
                document.getElementById('sourcePath').textContent = folder;
                // build tree
                App.treeManager.updateSourceTree();
                App.utils.writeMessage('Source Folder rendered.');
            } else {
                App.utils.writeMessage('No Source folder selected.');
            }
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
        });
        document.getElementById('clearSource').addEventListener('click', async () => {
            App.model.sourceFolder = '';
            App.filtersManager.removeAllFilters();
            document.getElementById('sourcePath').textContent = 'Select Source Folder';
            App.model.fileTreeData = [];
            const container = document.getElementById('file-tree');
            container.innerHTML = '';
            App.utils.writeMessage('Source folder cleared.');
        });
        document.getElementById('refreshSource').addEventListener('click', async () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert('Please select the Source Folder!');
                App.utils.writeMessage('Unable to refresh Source Folder.');
                return;
            }
            // rebuild tree
            App.treeManager.updateSourceTree();
            App.utils.writeMessage('Source Folder refreshed.');
        });
        document.getElementById('buttonSwap').addEventListener('click', this.swapSourceAndDestination.bind(this));

        // Destination Folders
        document.getElementById('addDestination').addEventListener('click', this.addDestination.bind(this));
        document.getElementById('clearAllDestinations').addEventListener('click', this.clearDestinations.bind(this));

        // Copying
        document.getElementById("previewChecked").addEventListener("change", function () {
            App.model.isPreview = this.checked;
            App.utils.writeMessage('Preview Mode is now ' + App.model.isPreview);
            if (App.model.isPreview && !App.model.copyReport) {
                App.utils.writeMessage('Copying Report is disabled, enable it in Options panel to show Preview result!');
                App.utils.showAlert('Copying Report is disabled, enable it in Options panel to show Preview result!');
            }
        });
        document.getElementById('abortCopy').addEventListener('click', (e) => {
            e.target.classList.add("opDisabled");
            App.model.abort = true;
        });
        document.getElementById('copySelected').addEventListener('click', () => {
            this.startCopyProcess();
        });
        document.getElementById('zipSelected').addEventListener('click', () => {
            this.startZipProcess();
        });
        document.getElementById('exportReport').addEventListener('click', () => {
            this.exportReport();
        });
    }

    // Sources and Destinations
    swapSourceAndDestination() {
        if (!App.model.sourceFolder || App.model.destinationFolders.length === 0) {
            App.utils.showAlert("Please select the Source Folder and a Destination Folder before swap.")
            return;
        }
        let oldSource = App.model.sourceFolder;
        App.model.sourceFolder = App.model.destinationFolders[0];
        App.model.destinationFolders[0] = oldSource;
        document.getElementById('sourcePath').textContent = App.model.sourceFolder;
        App.treeManager.updateSourceTree();
        this.updateDestinationList();
        App.filtersManager.applyAllFilters();
        App.utils.writeMessage('Source / Destination Folders swapped.');
    }
    updateDestinationList() {
        const listContainer = document.getElementById('destinationList');
        listContainer.innerHTML = ''; // empty list
        App.uiManager.cleanDestinationTree();
        if (App.model.destinationFolders.length === 0) {
            listContainer.innerHTML = 'Add Destination Folder';
            App.model.destTreeData = [];
        } else {
            App.model.destinationFolders.forEach((folder, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'badge-dest', 'position-relative', 'me-3');
                listItem.title = folder;
                listItem.textContent = getLastTwoElements(folder);
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single item
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.dataset.index = index;
                removeButton.title = "Remove Folder";
                removeButton.addEventListener('click', (e) => {
                    App.copyManager.removeDestination(e.target.dataset.index);
                });
                removeButton.style.cursor = 'pointer';
                listItemInner.appendChild(removeButton);
                listItem.appendChild(listItemInner);
                listContainer.appendChild(listItem);
            });
        }
        if (App.model.destinationFolders.length > 0) {
            App.treeManager.renderDestinationTree();
        }
        if (App.model.destinationFolders.length > 1) {
            addDraggableToDestinationFolders();
        }

        function addDraggableToDestinationFolders() {
            const destinationList = document.getElementById('destinationList');
            let badges = Array.from(destinationList.querySelectorAll('.badge-outer'));

            // index of dragged item
            let draggedIndex = null;

            // listeners for each  badge
            badges.forEach((badge) => {
                badge.setAttribute('draggable', 'true');

                badge.addEventListener('dragstart', (event) => {
                    // set index of dragged item
                    draggedIndex = badges.indexOf(badge);
                    event.dataTransfer.effectAllowed = 'move';
                    // can also save some info
                    event.dataTransfer.setData('text/plain', draggedIndex);
                    badge.classList.add('dragging');
                });

                badge.addEventListener('dragend', (event) => {
                    badge.classList.remove('dragging');
                    // If the drop does not occur over another badge (dropEffect is "none"), no changes are made.
                    // Naturally, if the drop is valid, the logic has already been executed in "drop".

                });

                //  dragover event for drop
                badge.addEventListener('dragover', (event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                });

                // drop on badge
                badge.addEventListener('drop', (event) => {
                    event.preventDefault();
                    const targetIndex = badges.indexOf(badge);

                    // if different index
                    if (draggedIndex !== null && draggedIndex !== targetIndex) {
                        // swap items in destinationFolders array too
                        const temp = App.model.destinationFolders[draggedIndex];
                        App.model.destinationFolders[draggedIndex] = App.model.destinationFolders[targetIndex];
                        App.model.destinationFolders[targetIndex] = temp;

                        // swap items in DOM
                        if (draggedIndex < targetIndex) {
                            destinationList.insertBefore(badges[draggedIndex], badges[targetIndex].nextSibling);
                        } else {
                            destinationList.insertBefore(badges[draggedIndex], badges[targetIndex]);
                        }

                        // updated badges array according to new DOM
                        badges = Array.from(destinationList.querySelectorAll('.badge-outer'));
                        badges.forEach((badge, index) => {
                            let removeButton = badge.querySelector('a');
                            removeButton.dataset.index = index;
                        })
                        App.treeManager.renderDestinationTree();
                        App.utils.writeMessage('Destination Folders List updated!'); // + App.model.destinationFolders.join(","));
                    }
                    draggedIndex = null;
                });
            });

            // events on container:
            // if drop on #destinationList, not on a badge, cancel
            destinationList.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            destinationList.addEventListener('drop', (event) => {
                // If the dropped element is not an internal badge, the drop is not accepted.
                if (event.target === destinationList) {
                    event.preventDefault();
                    //console.log('Drop not valid: release over another item.');
                }
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
    async addDestination() {
        App.utils.writeMessage('Choose a Destination folder.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        const folder = await ipcRenderer.invoke('select-folder', 'Select destination folder', App.model.destinationFolders.length > 0 ? App.model.destinationFolders[App.model.destinationFolders.length - 1] : "");
        if (folder) {
            // check folder is different from App.model.sourceFolder
            if (folder === App.model.sourceFolder) {
                App.utils.showAlert("The destination folder cannot be the same as the source folder.");
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
                return;
            }
            // Check that the folder is not already present in the array
            if (App.model.destinationFolders.includes(folder)) {
                App.utils.showAlert("This folder has already been added.");
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
                return;
            }

            // check folder is not inside App.model.sourceFolder
            if (App.model.sourceFolder && App.utils.isSubFolder(folder, App.model.sourceFolder) && App.utils.isSubFolder(App.model.sourceFolder, folder)) {
                App.utils.showAlert("The destination folder cannot be a subfolder or a parent of source folder.");
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
                return;
            }

            // check folder is not a folder of something else already selected
            for (const destFolder of App.model.destinationFolders) {
                if (App.utils.isSubFolder(folder, destFolder)) {
                    App.utils.showAlert("The destination folder cannot be a subfolder of an already selected destination folder.");
                    App.model.clicksActive = true;
                    App.utils.toggleSpinner(!App.model.clicksActive);
                    return;
                }
                if (App.utils.isSubFolder(destFolder, folder)) {
                    App.utils.showAlert("The destination folder cannot be a parent folder of an already selected destination folder.");
                    App.model.clicksActive = true;
                    App.utils.toggleSpinner(!App.model.clicksActive);
                    return;
                }
            }

            // adds folder to array and updates ui
            App.model.destinationFolders.push(folder);
            this.updateDestinationList();
            App.utils.writeMessage('Destination folder added.');
        } else {
            App.utils.writeMessage('No Destination folder selected.');
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
    }
    removeDestination(index) {
        App.model.destinationFolders.splice(Number(index), 1);
        this.updateDestinationList();
        App.utils.writeMessage('Destination folder removed.');
    }
    clearDestinations() {
        App.model.destinationFolders = [];
        this.updateDestinationList();
        App.utils.writeMessage('All Destination folder removed.');
    }

    //Copying
    async startCopying() {
        if (!this.moreQueue()) {
            //reset counters
            App.model.copyingReport = [];
            App.model.itemsCopied = [];
            App.model.itemsSkipped = [];
            App.model.itemsFailed = [];
            for (let i = 0; i < App.model.destinationFolders.length; i++) {
                App.model.itemsCopied.push(0);
                App.model.itemsSkipped.push(0);
                App.model.itemsFailed.push(0);
            }
            App.model.itemsProcessed = 0;
            App.model.itemsTotal = App.model.selectedNodes.length;
        } else {
            //update counters
            if (App.model.destinationFolders.length > App.model.itemsCopied.length) {
                for (let i = 0; i < (App.model.destinationFolders.length - App.model.itemsCopied.length); i++) {
                    App.model.itemsCopied.push(0);
                    App.model.itemsSkipped.push(0);
                    App.model.itemsFailed.push(0);
                }
            }
            App.model.itemsTotal += App.model.selectedNodes.length;
        }

        //reset abort
        App.model.wasAborted = false;
        App.model.abort = false;
        this.setButtonsForOperation();

        //start
        this.openProgressModal();
        if (App.model.copyVerbose && !App.model.isPreview) {
            await App.utils.waitForUiUpdate();
        }
        await this.executeCopy();
        if (App.model.copyVerbose && !App.model.isPreview) {
            await App.utils.waitForUiUpdate();
        }

        //clear queue item if exists
        if (App.model.queueToExecute.length > 0) {
            App.model.queueToExecute.shift();
        }

        if (this.moreQueue()) {
            App.snapshotManager.executeNextQueue();
        } else {
            this.endCopying();
        }
    }
    endCopying() {
        if (App.model.isQueue && !this.moreQueue()) {
            if (App.model.preQueueSnapshot) {
                App.snapshotManager.setFromSnapshot(App.model.preQueueSnapshot);
                App.model.preQueueSnapshot = null;
            }
            App.model.isQueue = false;
        }
        this.resetButtonsFromOperation();
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
        this.openReportModal();
    }
    async executeCopy() {
        let now1 = new Date();
        let startTime = now1.getTime();
        App.model.someCopyDone++;
        this.updateCopyingProgress('▷ ' + 'Copy started at: ' + now1.toLocaleTimeString(), true);
        // copy every selected item
        let fileIndex = 1;
        for (const node of App.model.selectedNodes) {
            // check for abort
            if (App.model.abort) {
                App.model.abort = false;
                App.model.wasAborted = true;
                App.utils.writeMessage(`Abort request received. Aborting current Copy operation...`);
                document.getElementById('abortCopy').classList.remove("opDisabled");
                if (App.model.abortFullQueue) {
                    App.model.queueToExecute = [];
                    App.utils.writeMessage('Copy Aborted!');
                } else {
                    if (App.model.queueToExecute.length > 0) {
                        App.utils.writeMessage('Copy of the current Queue item Aborted!');
                    } else {
                        App.utils.writeMessage('Copy Aborted!');
                    }
                }
                break;
            }
            // copy
            let relPath = node.path;
            const sourceFullPath = path.join(App.model.sourceFolder, relPath);
            let destIndex = 0;
            for (const destFolder of App.model.destinationFolders) {
                const destinationFullPath = path.join(destFolder, relPath);
                App.utils.writeMessage('[' + fileIndex + '/' + App.model.selectedNodes.length + '] Copying ' + sourceFullPath + ' to ' + destinationFullPath);
                this.updateCopyingProgress('[' + fileIndex + '/' + App.model.selectedNodes.length + '] Copying ' + sourceFullPath + ' to ' + destinationFullPath, true)
                try {
                    await this.copyRecursive(sourceFullPath, destinationFullPath, destIndex, node);
                } catch (err) {
                    console.error('Error copying ', sourceFullPath, destinationFullPath, err);
                    App.utils.writeMessage('Error copying ' + sourceFullPath + ' to ' + destinationFullPath);
                    App.model.itemsFailed[destIndex]++;
                    this.updateCopyingProgress('Error copying ' + sourceFullPath + ' to ' + destinationFullPath, false);
                }
                if (App.model.copyVerbose && !App.model.isPreview) {
                    await App.utils.waitForUiUpdate();
                }
                destIndex++;
            }
            App.model.itemsProcessed = fileIndex;
            App.model.sizeProcessed += node.sizeBits;
            fileIndex++;
        }
        let now2 = new Date();
        let endTime = now2.getTime();
        let elapsedTimeMS = (endTime - startTime);
        let elapsedTimeS = (elapsedTimeMS / 1000).toFixed(2);
        this.updateCopyingProgress('▷ ' + 'Copy finished at: ' + now2.toLocaleTimeString() + '. <hr> Elapsed: ' + elapsedTimeS + 's (' + elapsedTimeMS + 'ms)', true);
        App.utils.writeMessage('Copy Completed!');
        if (App.model.copyVerbose && !App.model.isPreview) {
            await App.utils.waitForUiUpdate();
        }
    }
    async copyRecursive(src, dest, destIndex, node) {
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {

            if ( (App.model.fileOverwrite === App.model.fileOverwriteEnum.sync && hasSelectedFilesInFolder(src))
                || (App.model.fileOverwrite === App.model.fileOverwriteEnum.sync2 && hasSelectedFilesOrFoldersInFolder(src))
                || (App.model.fileOverwrite === App.model.fileOverwriteEnum.brute && hasSelectedFilesOrFoldersInFolder(src)) ) {
                if (fs.existsSync(dest)) {
                    if (!App.model.isPreview) clearFolder(dest);
                } else {
                    if (!App.model.isPreview) fs.mkdirSync(dest, { recursive: true });
                }
            } else {
                if (!fs.existsSync(dest)) {
                    if (!App.model.isPreview) fs.mkdirSync(dest, { recursive: true });
                }
            }

            if (App.model.fileOverwrite === App.model.fileOverwriteEnum.never && fs.existsSync(dest)) {
                this.updateCopyingProgress('Folder ' + dest + ' already exists. Overwrite set to "Never". Skipping...', false);
                App.utils.writeMessage('Folder ' + dest + ' already exists. Overwrite set to "Never". Skipping...');
                App.model.itemsSkipped[destIndex]++;
            } else if (App.model.fileOverwrite === App.model.fileOverwriteEnum.if_newer && fs.existsSync(dest)) {
                try {
                    const stats = fs.statSync(dest);
                    if (node.ms > stats.mtimeMs) {
                        this.updateCopyingProgress('Folder ' + dest + ' copied.', false);
                        App.utils.writeMessage('Folder ' + dest + ' copied.');
                        App.model.itemsCopied[destIndex]++;
                    } else {
                        this.updateCopyingProgress('Folder ' + dest + ' already exists. Overwrite set to "If Newer". Skipping...', false);
                        App.utils.writeMessage('Folder ' + dest + ' already exists. Overwrite set to "If Newer". Skipping...');
                        App.model.itemsSkipped[destIndex]++;
                    }
                } catch (err) {
                    console.error("Error reading folder stats for '"+dest+"':", err.message);
                    this.updateCopyingProgress('Error reading folder stats for '+dest+'. Overwrite set to "If Newer". Skipping...', false);
                    App.utils.writeMessage('Error reading folder stats for '+dest+'. Overwrite set to "If Newer". Skipping...');
                    App.model.itemsSkipped[destIndex]++;
                }
            } else {
                this.updateCopyingProgress('Folder ' + dest + ' copied.', false);
                App.utils.writeMessage('Folder ' + dest + ' copied.');
                App.model.itemsCopied[destIndex]++;
            }
            //no! const items = fs.readdirSync(src);
            //no! for (const item of items) {
            //no!   await this.copyRecursive(path.join(src, item), path.join(dest, item));
            //no! }
        } else {
            const destDir = path.dirname(dest);
            if (!fs.existsSync(destDir)) {
                if (!App.model.isPreview) fs.mkdirSync(destDir, {recursive: true});
            }
            if (App.model.fileOverwrite !== App.model.fileOverwriteEnum.always) {
                if (!fs.existsSync(dest)) {
                    if (!App.model.isPreview) fs.copyFileSync(src, dest);
                    this.updateCopyingProgress('File ' + dest + ' copied.', false);
                    App.utils.writeMessage('File ' + dest + ' copied.');
                    App.model.itemsCopied[destIndex]++;
                } else {
                    if (App.model.fileOverwrite === App.model.fileOverwriteEnum.never) {
                        this.updateCopyingProgress('File ' + dest + ' already exists. Overwrite set to "Never". Skipping...', false);
                        App.utils.writeMessage('File ' + dest + ' already exists. Overwrite set to "Never". Skipping...');
                        App.model.itemsSkipped[destIndex]++;
                    } else if (App.model.fileOverwrite === App.model.fileOverwriteEnum.if_newer) {
                        try {
                            const stats = fs.statSync(dest);
                            if (node.ms > stats.mtimeMs) {
                                if (!App.model.isPreview) fs.copyFileSync(src, dest);
                                this.updateCopyingProgress('File ' + dest + ' copied.', false);
                                App.utils.writeMessage('File ' + dest + ' copied.');
                                App.model.itemsCopied[destIndex]++;
                            } else {
                                this.updateCopyingProgress('File ' + dest + ' already exists. Overwrite set to "If Newer". Skipping...', false);
                                App.utils.writeMessage('File ' + dest + ' already exists. Overwrite set to "If Newer". Skipping...');
                                App.model.itemsSkipped[destIndex]++;
                            }
                        } catch (err) {
                            console.error("Error reading file stats for '"+dest+"':", err.message);
                            this.updateCopyingProgress('Error reading file stats for '+dest+'. Overwrite set to "If Newer". Skipping...', false);
                            App.utils.writeMessage('Error reading file stats for '+dest+'. Overwrite set to "If Newer". Skipping...');
                            App.model.itemsSkipped[destIndex]++;
                        }
                    } else if (App.model.fileOverwrite === App.model.fileOverwriteEnum.if_different) {
                        try {
                            const stats = fs.statSync(dest);
                            if (node.sizeBits !== stats.size) {
                                if (!App.model.isPreview) fs.copyFileSync(src, dest);
                                this.updateCopyingProgress('File ' + dest + ' copied.', false);
                                App.utils.writeMessage('File ' + dest + ' copied.');
                                App.model.itemsCopied[destIndex]++;
                            } else {
                                this.updateCopyingProgress('File ' + dest + ' already exists. Overwrite set to "If Different Size". Skipping...', false);
                                App.utils.writeMessage('File ' + dest + ' already exists. Overwrite set to "If Different Size". Skipping...');
                                App.model.itemsSkipped[destIndex]++;
                            }
                        } catch (err) {
                            console.error("Error reading file stats for '"+dest+"':", err.message);
                            this.updateCopyingProgress('Error reading file stats for '+dest+'. Overwrite set to "If Different Size". Skipping...', false);
                            App.utils.writeMessage('Error reading file stats for '+dest+'. Overwrite set to "If Different Size". Skipping...');
                            App.model.itemsSkipped[destIndex]++;
                        }
                    } else if (App.model.fileOverwrite === App.model.fileOverwriteEnum.keep) {
                        let newDest = App.utils.addUniqueStringToFilePath(dest);
                        if (!App.model.isPreview) fs.copyFileSync(src, newDest);
                        this.updateCopyingProgress('File ' + newDest + ' copied using new name.', false);
                        App.utils.writeMessage('File ' + newDest + ' copied using new name .');
                        App.model.itemsCopied[destIndex]++;
                    }
                }
            } else {
                if (!App.model.isPreview) fs.copyFileSync(src, dest);
                this.updateCopyingProgress('File ' + dest + ' copied.', false);
                App.utils.writeMessage('File ' + dest + ' copied.');
                App.model.itemsCopied[destIndex]++;
            }
        }


        function clearFolder(folderPath) {
            const items = fs.readdirSync(folderPath);
            items.forEach((item) => {
                const currentPath = path.join(folderPath, item);
                const stats = fs.statSync(currentPath);
                if (App.model.fileOverwrite === App.model.fileOverwriteEnum.brute) {
                    if (stats.isDirectory()) {
                        if (!App.model.isPreview) fs.rmdirSync(currentPath, { recursive: true });
                    } else {
                        if (!App.model.isPreview) fs.unlinkSync(currentPath);
                    }

                } else {
                    if (!stats.isDirectory()) {
                        if (!App.model.isPreview) fs.unlinkSync(currentPath);
                    }
                }

            });

        }

        function hasSelectedFilesInFolder(folderPath) {
            return App.model.selectedNodes.some(filePath => filePath.fullPath.startsWith(folderPath) && !filePath.isDirectory);
        }
        function hasSelectedFilesOrFoldersInFolder(folderPath) {
            return App.model.selectedNodes.some(filePath => filePath.fullPath.startsWith(folderPath));
        }

    }

    //Copying Progress and Report
    openProgressModal() {
        if (App.model.copyVerbose && !App.model.isPreview) {
            document.getElementById('verboseProgress').classList.remove('hidden');
            document.getElementById('copyingReport').classList.add('hidden');
            document.getElementById('exportReport').classList.add('hidden');
            document.querySelectorAll('.copyingClose').forEach((el) => el.classList.add('hidden'));
            document.getElementById('verboseProgressMD').innerHTML = "";
            document.getElementById('progressBarItems').style.width = "0%";
            document.getElementById('progressBarItems').textContent = App.model.itemsProcessed + "/" + App.model.itemsTotal;
            document.getElementById('progressBarSize').style.width = "0%";
            document.getElementById('progressBarSize').textContent = "0%";
            const modal = bootstrap.Modal.getOrCreateInstance('#copyingModal');
            modal.show();
        }
    }
    openReportModal() {
        if (App.model.copyReport) {
            document.getElementById('verboseProgress').classList.add('hidden');
            document.getElementById('copyingReport').classList.remove('hidden');
            document.getElementById('exportReport').classList.remove('hidden');
            document.querySelectorAll('.copyingClose').forEach((el) => el.classList.remove('hidden'));
            document.getElementById('copyingReportMD').innerHTML = this.generateReportContentHtml();
            setTimeout( () => {
                const modalBody = document.querySelector('#copyingModal .modal-body');
                modalBody.scrollTop = modalBody.scrollHeight;
            }, 100)
            const modal = bootstrap.Modal.getOrCreateInstance('#copyingModal');
            modal.show();
        }
    }
    updateCopyingProgress(message, sep = false) {
        if (App.model.copyVerbose || App.model.copyReport) {
            let useClass = '';
            if (sep) useClass = ' class="verboseSep"';
            let useMessage = "<div" + useClass + ">" + message + "</div>";
            if (App.model.copyVerbose && !App.model.isPreview) {
                if (sep) document.getElementById('verboseProgressMD').innerHTML = useMessage
                else document.getElementById('verboseProgressMD').innerHTML = useMessage + document.getElementById('verboseProgressMD').innerHTML;
                let percentageI = ((App.model.itemsProcessed * 100) / App.model.itemsTotal).toFixed(0);
                let percentageS = ((App.model.sizeProcessed * 100) / App.model.sizeTotal).toFixed(0);
                document.getElementById('progressBarItems').style.width = percentageI + "%";
                document.getElementById('progressBarItems').textContent = App.model.itemsProcessed + "/" + App.model.itemsTotal;
                document.getElementById('progressBarSize').style.width = percentageS + "%";
                document.getElementById('progressBarSize').textContent = percentageS + "%";
                const modalBody = document.querySelector('#copyingModal .modal-body');
                modalBody.scrollTop = 0;
            }
            App.model.copyingReport.push(useMessage);
        }
    }

    // Utils for report
    generateReportContentHtml() {
        let copyReport = App.model.copyingReport.join("\n");
        if (copyReport == "") {
            copyReport = "No items copied!"
        }
        let innerHTML = `<h6>Report [${(new Date()).toLocaleDateString()}]</h6>
${copyReport}
<hr>
Processed <b>${App.model.itemsProcessed}</b> of <b>${App.model.itemsTotal}</b> items, into <b>${App.model.destinationFolders.length}</b> Destination folders.<br>
Copied: <b>${App.model.itemsCopied.toString()}</b>; Skipped: <b>${App.model.itemsSkipped.toString()}</b>; Failed: <b>${App.model.itemsFailed.toString()}</b>.<br>
Size: ${App.utils.formatSizeForThree(App.model.sizeTotal)}
`;
        if (App.model.wasAborted) {
            innerHTML += `<hr> Copying aborted by user!
                `;
            App.model.wasAborted = false;
        }

        return innerHTML;

    }
    async exportReport() {
        if (App.model.copyingReport === 0) {
            App.utils.writeMessage('No Report to export.');
            return;
        }
        App.utils.writeMessage('Choose Report Export file.');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        let htmlExport = htmlToPlainText(this.generateReportContentHtml());
        const saved = await ipcRenderer.invoke('select-export-report-file', htmlExport);
        if (saved) {
            App.utils.writeMessage('Report exported successfully.');
        } else {
            App.utils.writeMessage('Report not exported.');
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);

        function htmlToPlainText(html) {
            var tempDiv = document.createElement('div');
            // Replace <br> elements with newlines
            html = html.replace(/<br\s*\/?>/gi, '\n').replace(/▷/gi, '\n▷');
            tempDiv.innerHTML = html;
            return tempDiv.textContent || tempDiv.innerText;
        }
    }
    // Utils for queue
    moreQueue() {
        let moreQueue = App.model.queueToExecute.length > 0;
        return moreQueue
    }
    // Utils for buttons
    setButtonsForOperation() {
        document.getElementById('abortCopy').classList.remove("hidden");
        document.getElementById('copySelected').classList.add("hidden");
        document.getElementById('zipSelected').classList.add("hidden");
        document.getElementById('previewCheckedContainer').classList.add("hidden");
    }
    resetButtonsFromOperation() {
        document.getElementById('abortCopy').classList.add("hidden");
        document.getElementById('copySelected').classList.remove("hidden");
        document.getElementById('zipSelected').classList.remove("hidden");
        document.getElementById('previewCheckedContainer').classList.remove("hidden");
    }
    // Utils for execution
    performChecksAndCreateSelectedNodes(operation) {
        // check if at least a destination folder is selected, and if source folder selected
        let opUpper = "Copying";
        if (operation === 'zip') {
            opUpper = "Zipping";
        }
        App.utils.writeMessage('Preparing for '+opUpper+'...');

        if (!App.model.sourceFolder) {
            App.utils.showAlert('Please select the Source Folder!');
            App.utils.writeMessage('Unable to start '+opUpper+'.');
            return false;
        }
        if (App.model.destinationFolders.length === 0) {
            App.utils.showAlert('Please select at least a Destination Folder!');
            App.utils.writeMessage('Unable to start '+opUpper+'.');
            return false;
        }

        const checkboxes = document.querySelectorAll('#file-tree input[type="checkbox"]');
        App.model.selectedNodes = [];
        App.model.sizeTotal = 0;
        App.model.sizeProcessed = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                App.model.sizeTotal += Number(checkbox.dataset.nodeSize);

                App.model.selectedNodes.push({
                    fullPath: path.join(App.model.sourceFolder, checkbox.dataset.filePath),
                    path: checkbox.dataset.filePath,
                    name: checkbox.dataset.nodeName,
                    sizeBits: Number(checkbox.dataset.nodeSize),
                    getTime: App.utils.dateToGetTime(checkbox.dataset.nodeModified),
                    ms: Number(checkbox.dataset.nodeMS),
                    isDir: (checkbox.dataset.isDirectory === '1')
                });
            }
        });
        if (App.model.selectedNodes.length === 0) {
            App.utils.showAlert('No selected Items.\nPlease select at least one item.');
            App.utils.writeMessage('Unable to start '+opUpper+'.');
            return false;
        }
        if (App.model.destinationFolders.includes(App.model.sourceFolder)) {
            App.utils.showAlert('Source and some Destination Folder are the same.\nPlease select different folders.');
            App.utils.writeMessage('Unable to start '+opUpper+'.');
            return false;
        }

        return true;
    }

    // ZIP
    /**
     * Create ZIP archive of selected files and folders only.
     * Folder will be added to archive only if explicitely present in the selection.
     *
     * @param {string} sourceFolder - The source folder.
     * @param {Array} selectedNodes - Selected Nodes (with path).
     * @param {string} outputFolder - Temporary path to create ZIP archive to.
     * @returns {Promise<string>} - Resolves with full path of created ZIP.
     */
    async createSelectiveZipArchive(sourceFolder, selectedNodes, outputFolder) {
        // Create unique name for zip
        const pad = (number) => (number < 10 ? '0' + number : number);
        const now = new Date();
        const archiveName = `copyman_zip_archive-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.zip`;
        const archivePath = path.join(outputFolder, archiveName);

        const output = fs.createWriteStream(archivePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // compression level
        });

        return new Promise(async (resolve, reject) => {
            let aborted = false;
            output.on('close', () => {
                if (!aborted) {
                    App.utils.writeMessageAndWaitForUiUpdate(`Zip Archive created (${archive.pointer()} bytes).`);
                    resolve(archivePath);
                } else {
                    fs.unlinkSync(archivePath);
                    App.utils.writeMessageAndWaitForUiUpdate(`Zip Archive creation aborted.`);
                    resolve("");
                }
            });
            output.on('error', err => reject(err));
            archive.on('error', err => reject(err));

            archive.on("progress", async (progress) => {
                App.utils.writeMessageAndWaitForUiUpdate(`Zipped ${progress.entries.processed}/${progress.entries.total} (${App.utils.formatSizeForThree(progress.fs.processedBytes)}/${App.utils.formatSizeForThree(progress.fs.totalBytes)})`);
            });

            archive.pipe(output);

            // Add selected entry to archive
            for (const node of selectedNodes) {
                if (App.model.abort) {
                    App.model.abort = false;
                    aborted = true;
                    App.utils.writeMessageAndWaitForUiUpdate(`Abort request received. Aborting ZIP creation...`);
                    break;
                }
                const relativeEntryPath = node.path;
                const absolutePath = path.join(sourceFolder, relativeEntryPath);
                try {
                    const stats = fs.statSync(absolutePath);
                    if (stats.isDirectory()) {
                        // If folder selected, creates empty (don't add contents)
                        archive.append(null, { name: relativeEntryPath.replace(/\/?$/, '/') });
                    } else {
                        // Add file maintaining relative path
                        archive.file(absolutePath, { name: relativeEntryPath });
                    }
                } catch (err) {
                    console.error(`Error processing ${absolutePath}:`, err);
                    App.utils.writeMessageAndWaitForUiUpdate(`Error processing ${absolutePath}`);
                }
            };

            // Finalize archive
            archive.finalize();
        });
    }
    /**
     * Create ZIP one time then copy to all desinations
     *
     * @param {string} sourceFolder - Source folder.
     * @param {Array} selectedNodes - Array of selected nodes.
     * @param {Array} destinationFolders - Array of destination folders.
     * @returns {Promise<void>}
     */
    async createAndCopyZipArchive(sourceFolder, selectedNodes, destinationFolders) {
        // Create ZIP in temporary folder.
        const tempDir = os.tmpdir();
        App.utils.writeMessageAndWaitForUiUpdate('Start Zipping...');
        const zipPath = await this.createSelectiveZipArchive(sourceFolder, selectedNodes, tempDir);

        if (zipPath === "") {
            App.utils.writeMessageAndWaitForUiUpdate('Zipping Aborted.');
        } else {
            // Copy ZIP to destinations
            destinationFolders.forEach(destFolder => {
                const targetZipPath = path.join(destFolder, path.basename(zipPath));
                const targetReportPath = path.join(destFolder, path.basename(zipPath).replace(".zip", ".json").replace("_archive", "_report"));
                try {
                    fs.copyFileSync(zipPath, targetZipPath);
                    App.utils.writeMessageAndWaitForUiUpdate(`ZIP Archive copied to ${targetZipPath}`);
                } catch (error) {
                    console.error(`Error copying ZIP Archive to ${destFolder}:`, error);
                    App.utils.writeMessageAndWaitForUiUpdate(`Error copying ZIP Archive to ${destFolder}`);
                }
            });

            fs.unlinkSync(zipPath); // Remove termporary zip

            App.utils.writeMessage('Zipping Completed!');
            App.utils.showAlert('Zipping Completed!');
        }
        document.getElementById('abortCopy').classList.remove("opDisabled");
    }

    // Executions
    async startCopyProcess() {
        if (!this.performChecksAndCreateSelectedNodes("copy")) return;

        //continue after checks
        let destinations = App.model.destinationFolders.join(", ");
        App.utils.writeMessage('Asking for copying confirmation...');
        App.model.clicksActive = false;
        App.utils.toggleSpinner(!App.model.clicksActive);
        let useOverwrite = App.utils.formatOverwriteMode(App.model.fileOverwrite);

        // remove confirmation request if queue or preview
        if ((this.moreQueue() && App.model.dontConfirmQueue) || (App.model.isPreview)) {
            App.utils.writeMessage('Copying Started...');
            setTimeout(() => {
                App.copyManager.startCopying()
            }, 100);
            return;
        }
        let previewStr = '';
        if (App.model.isPreview) previewStr = '\nPreview Mode is active.'
        let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to copy ' + App.model.selectedNodes.length + ' items (' + App.utils.formatSizeForThree(App.model.sizeTotal) + ')\nfrom ' + App.model.sourceFolder +
            '\nto ' + destinations + '\nwith overwrite mode set to ' +useOverwrite + '?'+previewStr);
        if (confirmation) {
            App.utils.writeMessage('Copying Started...');
            setTimeout(() => {
                App.copyManager.startCopying()
            }, 100);
        } else {
            //clear queue item if exists
            if (App.model.queueToExecute.length > 0) {
                App.model.queueToExecute.shift();
                App.snapshotManager.executeNextQueue();
            } else {
                App.utils.writeMessage('Copying Canceled.');
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
            }
        }

    }
    async startZipProcess() {
        try {
            if (!this.performChecksAndCreateSelectedNodes("zip")) return;

            //continue after checks
            App.model.abort = false;
            App.model.clicksActive = false;
            App.utils.toggleSpinner(!App.model.clicksActive);
            let destinations = App.model.destinationFolders.join(", ");
            App.utils.writeMessage('Asking for ZIP confirmation...');
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to ZIP ' + App.model.selectedNodes.length + ' items (' + App.utils.formatSizeForThree(App.model.sizeTotal) + ')\nfrom ' + App.model.sourceFolder +
                '\nto ' + destinations + ' ?');
            if (confirmation) {
                this.setButtonsForOperation();
                await this.createAndCopyZipArchive(
                    App.model.sourceFolder,
                    App.model.selectedNodes,
                    App.model.destinationFolders
                );
                this.resetButtonsFromOperation();
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
            } else {
                App.utils.writeMessage('Zipping Canceled.');
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
            }
        } catch (error) {
            console.error('Error during ZIP process:', error);
            App.utils.writeMessage(`Error during ZIP process!`);
            App.model.clicksActive = true;
            App.utils.toggleSpinner(!App.model.clicksActive);
        }
    }


}

module.exports = CopyManager;