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
                App.treeManager.updateTree();
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
            App.treeManager.updateTree();
            App.utils.writeMessage('Source Folder refreshed.');
        });
        document.getElementById('buttonSwap').addEventListener('click', this.swapSourceAndDestination.bind(this));

        // Destination Folders
        document.getElementById('addDestination').addEventListener('click', this.addDestination.bind(this));
        document.getElementById('clearAllDestinations').addEventListener('click', this.clearDestinations.bind(this));

        // Copying
        document.getElementById('copySelected').addEventListener('click', async () => {
            // check if at least a destination folder is selected, and if source folder selected
            App.utils.writeMessage('Preparing for Copy...');
            if (App.model.destinationFolders.length === 0) {
                App.utils.showAlert('Please select at least a Destination Folder!');
                App.utils.writeMessage('Unable to start copying.');
                return;
            }
            if (!App.model.sourceFolder) {
                App.utils.showAlert('Please select the Source Folder!');
                App.utils.writeMessage('Unable to start copying.');
                return;
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
                App.utils.writeMessage('Unable to start copying.');
                return;
            }
            if (App.model.destinationFolders.includes(App.model.sourceFolder)) {
                App.utils.showAlert('Source and some Destination Folder are the same.\nPlease select different folders.');
                App.utils.writeMessage('Unable to start copying.');
                return;
            }
            let destinations = App.model.destinationFolders.join(", ");
            App.utils.writeMessage('Asking for copying confirmation...');
            App.model.clicksActive = false;
            App.utils.toggleSpinner(!App.model.clicksActive);
            let useOverwrite = App.utils.formatOverwriteMode(App.model.fileOverwrite);
            let confirmation = await App.utils.showConfirmWithReturn('Are you sure you want to copy ' + App.model.selectedNodes.length + ' items (' + App.utils.formatSizeForThree(App.model.sizeTotal) + ')\nfrom ' + App.model.sourceFolder + '\nto ' + destinations + '\nwith overwrite mode set to ' +useOverwrite + '?');
            if (confirmation) {
                App.utils.writeMessage('Copying Started...');
                setTimeout(() => {
                    App.copyManager.startCopying()
                }, 100);
            } else {
                App.utils.writeMessage('Copying Aborted.');
                App.model.clicksActive = true;
                App.utils.toggleSpinner(!App.model.clicksActive);
            }

        });
    }

    swapSourceAndDestination() {
        if (!App.model.sourceFolder || App.model.destinationFolders.length === 0) {
            App.utils.showAlert("Please select the Source Folder and a Destination Folder before swap.")
            return;
        }
        let oldSource = App.model.sourceFolder;
        App.model.sourceFolder = App.model.destinationFolders[0];
        App.model.destinationFolders[0] = oldSource;
        document.getElementById('sourcePath').textContent = App.model.sourceFolder;
        App.treeManager.updateTree();
        this.updateDestinationList();
        App.filtersManager.applyAllFilters();
        App.utils.writeMessage('Source / Destination Folders swapped.');
    }

    updateDestinationList() {
        const listContainer = document.getElementById('destinationList');
        listContainer.innerHTML = ''; // empty list
        if (App.model.destinationFolders.length === 0) {
            listContainer.innerHTML = 'Add Destination Folder';
        } else {
            App.model.destinationFolders.forEach((folder, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'position-relative', 'me-3');
                listItem.title = folder;
                listItem.textContent = getLastTwoElements(folder);
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single item
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.addEventListener('click', () => {
                    App.copyManager.removeDestination(index);
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
        App.model.destinationFolders.splice(index, 1);
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
        this.openProgressModal();
        if (App.model.copyVerbose) {
            await App.utils.waitForUiUpdate();
        }
        await this.executeCopy();
        if (App.model.copyVerbose) {
            await App.utils.waitForUiUpdate();
        }
        App.model.clicksActive = true;
        App.utils.toggleSpinner(!App.model.clicksActive);
        this.openReportModal();
    }

    async executeCopy() {
        let now1 = new Date();
        let startTime = now1.getTime();
        this.updateCopyingProgress('▷ ' + 'Copy started at: ' + now1.toLocaleTimeString(), true);
        // copy every selected item
        let fileIndex = 1;
        for (const node of App.model.selectedNodes) {
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
                if (App.model.copyVerbose) {
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
        this.updateCopyingProgress('▷ ' + 'Copy finished at: ' + now2.toLocaleTimeString() + '.<hr>Elapsed: ' + elapsedTimeS + 's (' + elapsedTimeMS + 'ms)', true);
        App.utils.writeMessage('Copy Completed!');
        if (App.model.copyVerbose) {
            await App.utils.waitForUiUpdate();
        }
    }

    async copyRecursive(src, dest, destIndex, node) {
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {

            if (App.model.fileOverwrite === App.model.fileOverwriteEnum.sync && hasSelectedFilesInFolder(src)) {
                if (fs.existsSync(dest)) {
                    clearFolder(dest);
                } else {
                    fs.mkdirSync(dest, { recursive: true });
                }
            } else {
                if (!fs.existsSync(dest)) {
                    fs.mkdirSync(dest, { recursive: true });
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
                fs.mkdirSync(destDir, {recursive: true});
            }
            if (App.model.fileOverwrite !== App.model.fileOverwriteEnum.always) {
                if (!fs.existsSync(dest)) {
                    fs.copyFileSync(src, dest);
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
                                fs.copyFileSync(src, dest);
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
                                fs.copyFileSync(src, dest);
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
                        fs.copyFileSync(src, newDest);
                        this.updateCopyingProgress('File ' + newDest + ' copied using new name.', false);
                        App.utils.writeMessage('File ' + newDest + ' copied using new name .');
                        App.model.itemsCopied[destIndex]++;
                    }
                }
            } else {
                fs.copyFileSync(src, dest);
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
                if (!stats.isDirectory()) {
                    fs.unlinkSync(currentPath);
                }
            });

        }

        function hasSelectedFilesInFolder(folderPath) {
            return App.model.selectedNodes.some(filePath => filePath.fullPath.startsWith(folderPath));
        }

    }

    //Copying Progress and Report
    openProgressModal() {
        if (App.model.copyVerbose) {
            document.getElementById('verboseProgress').classList.remove('hidden');
            document.getElementById('copyingReport').classList.add('hidden');
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
            document.querySelectorAll('.copyingClose').forEach((el) => el.classList.remove('hidden'));
            document.getElementById('copyingReportMD').innerHTML = '<h6>Report</h6>' + App.model.copyingReport.join("\n") + `<hr>
        Processed <b>${App.model.itemsProcessed}</b> of <b>${App.model.itemsTotal}</b> items, into <b>${App.model.destinationFolders.length}</b> Destination folders.<br>
        Copied: <b>${App.model.itemsCopied.toString()}</b>; Skipped: <b>${App.model.itemsSkipped.toString()}</b>; Failed: <b>${App.model.itemsFailed.toString()}</b>.<br>
        Size: ${App.utils.formatSizeForThree(App.model.sizeTotal)}
        `;
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
            if (App.model.copyVerbose) {
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
}

module.exports = CopyManager;