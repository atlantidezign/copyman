// FiltersManager.js
class FiltersManager {
    constructor() {
    }

    init() {
        //Filters Name
        document.getElementById('setNameFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");
                return;
            }
            App.model.filtersNamePlus = [filterValue];
            App.model.filtersNameMinus = [];
            App.filtersManager.resetNameFilterUI();
            App.filtersManager.applyAllFilters();
        });
        document.getElementById('addNameMinusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");
                return;
            }
            const indexPresence = App.model.filtersNameMinus.findIndex(item => item.includes(filterValue));
            if (App.model.filtersNameMinus.indexOf(filterValue) < 0 && App.model.filtersNamePlus.indexOf(filterValue) < 0 && indexPresence < 0) {
                App.model.filtersNameMinus.push(filterValue);
                App.filtersManager.resetNameFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                if (indexPresence >= 0) {
                    App.utils.showAlert("This filter is already present as substring.");
                    App.utils.writeMessage('Filter "' + filterValue + '" is already present as substring.');
                } else {
                    App.utils.showAlert("This filter is already present.");
                    App.utils.writeMessage('Filter "' + filterValue + '" is already present.');
                }
            }
        });
        document.getElementById('addNamePlusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            const filterValue = document.getElementById('filterNameInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");

                return;
            }
            const indexPresence = App.model.filtersNamePlus.findIndex(item => item.includes(filterValue));
            if (App.model.filtersNameMinus.indexOf(filterValue) < 0 && App.model.filtersNamePlus.indexOf(filterValue) < 0 && indexPresence < 0) {
                App.model.filtersNamePlus.push(filterValue);
                App.filtersManager.resetNameFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                if (indexPresence >= 0) {
                    App.utils.showAlert("This filter is already present as substring.");
                    App.utils.writeMessage('Filter "' + filterValue + '" is already present as substring.');
                } else {
                    App.utils.showAlert("This filter is already present.");
                    App.utils.writeMessage('Filter "' + filterValue + '" is already present.');
                }
            }

        });
        document.getElementById('clearNameFilter').addEventListener('click', () => {
            App.filtersManager.removeNameFilters();
        });

        //Filters Date
        document.getElementById('setDateFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }

            let rangePickerGet = App.uiManager.rangePicker.getDates(); //Date
            let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
            let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
            if (!rangePickerStart && !rangePickerEnd) {
                App.utils.showAlert("Please enter at least a date for filter.");
                return;
            }
            App.model.filtersDatePlus = [rangePickerGet];
            App.model.filtersDateMinus = [];
            App.filtersManager.resetDateFilterUI();
            App.filtersManager.applyAllFilters();
        });
        document.getElementById('addDateMinusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            let rangePickerGet = App.uiManager.rangePicker.getDates(); //Date
            let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
            let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
            if (!rangePickerStart && !rangePickerEnd) {
                App.utils.showAlert("Please enter at least a date for filter.");
                return;
            }
            if (!App.filtersManager.dateRangeInsideAnotherArrayOfRanges(rangePickerGet, App.model.filtersDateMinus) && !App.filtersManager.dateRangeInsideAnotherArrayOfRanges(rangePickerGet, App.model.filtersDatePlus)) {
                App.model.filtersDateMinus.push(rangePickerGet);
                App.filtersManager.resetDateFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + App.filtersManager.renderSingleDateFilter(rangePickerGet) + '" is already present.');
            }
        });
        document.getElementById('addDatePlusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            let rangePickerGet = App.uiManager.rangePicker.getDates(); //Date
            let rangePickerStart = rangePickerGet[0] ? rangePickerGet[0] : null;
            let rangePickerEnd = rangePickerGet[1] ? rangePickerGet[1] : null;
            if (!rangePickerStart && !rangePickerEnd) {
                App.utils.showAlert("Please enter at least a date for filter.");
                return;
            }

            if (!App.filtersManager.dateRangeInsideAnotherArrayOfRanges(rangePickerGet, App.model.filtersDateMinus) && !App.filtersManager.dateRangeInsideAnotherArrayOfRanges(rangePickerGet, App.model.filtersDatePlus)) {
                App.model.filtersDatePlus.push(rangePickerGet);
                App.filtersManager.resetDateFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + App.filtersManager.renderSingleDateFilter(rangePickerGet) + '" is already present.');
            }
        });
        document.getElementById('clearDateFilter').addEventListener('click', () => {
            App.filtersManager.removeDateFilters();
        });

        //Filters Size
        document.getElementById('setSizeFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }

            let rangeSliderGet = App.uiManager.rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
            let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : App.model.limitRangeSliderValues[0];
            let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : App.model.limitRangeSliderValues[1];
            if (rangeSliderStart === App.model.limitRangeSliderValues[0] && rangeSliderEnd === App.model.limitRangeSliderValues[1]) {
                App.utils.showAlert("Please enter at least a size for filter.");
                return;
            }
            App.model.filtersSizePlus = [rangeSliderGet];
            App.model.filtersSizeMinus = [];
            App.filtersManager.resetSizeFilterUI();
            App.filtersManager.applyAllFilters();
        });
        document.getElementById('addSizeMinusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            let rangeSliderGet = App.uiManager.rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
            let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : App.model.limitRangeSliderValues[0];
            let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : App.model.limitRangeSliderValues[1];
            if (rangeSliderStart === App.model.limitRangeSliderValues[0] && rangeSliderEnd === App.model.limitRangeSliderValues[1]) {
                App.utils.showAlert("Please enter at least a size for filter.");
                return;
            }
            if (!App.filtersManager.sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, App.model.filtersSizeMinus) && !App.filtersManager.sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, App.model.filtersSizePlus)) {
                App.model.filtersSizeMinus.push(rangeSliderGet);
                App.filtersManager.resetSizeFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + App.filtersManager.renderSingleSizeFilter(rangeSliderGet) + '" is already present.');
            }
        });
        document.getElementById('addSizePlusFilter').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            let rangeSliderGet = App.uiManager.rangeSlider.noUiSlider.get(); //string -> Number(string) -> number
            let rangeSliderStart = rangeSliderGet[0] ? Number(rangeSliderGet[0]) : App.model.limitRangeSliderValues[0];
            let rangeSliderEnd = rangeSliderGet[1] ? Number(rangeSliderGet[1]) : App.model.limitRangeSliderValues[1];
            if (rangeSliderStart === App.model.limitRangeSliderValues[0] && rangeSliderEnd === App.model.limitRangeSliderValues[1]) {
                App.utils.showAlert("Please enter at least a size for filter.");
                return;
            }
            if (!App.filtersManager.sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, App.model.filtersSizeMinus) && !App.filtersManager.sizeRangeInsideAnotherArrayOfRanges(rangeSliderGet, App.model.filtersSizePlus)) {
                App.model.filtersSizePlus.push(rangeSliderGet);
                App.filtersManager.resetSizeFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + App.filtersManager.renderSingleSizeFilter(rangeSliderGet) + '" is already present.');
            }
        });
        document.getElementById('clearSizeFilter').addEventListener('click', () => {
            App.filtersManager.removeSizeFilters();
        });

        //Filters Diffs
        async function askForEnableDiffs() {
            let confirmation = await App.utils.showConfirmWithReturn('Enable Split Screen and Tree Diffs to use this feature?');
            if (confirmation) {
                if (!App.model.makeTreeDiffs) {
                    document.getElementById("makeTreeDiffsChecked").click();
                }
                if (!App.model.splitScreen) {
                    document.getElementById("splitScreenChecked").click();
                }
                App.utils.showAlert('Split Screen and Tree Diffs are now enabled.');
                App.utils.writeMessage('Split Screen and Tree Diffs are now enabled.');
            }
        }
        document.getElementById('setDiffsFilter').addEventListener('click', () => {
            if (!App.model.splitScreen || !App.model.makeTreeDiffs) {
                askForEnableDiffs();
                return;
            }
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");
                return;
            }
            const filterValue = document.getElementById('filterDiffsInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");
                return;
            }
            App.model.filtersDiffsPlus = [filterValue];
            App.model.filtersDiffsMinus = [];
            App.filtersManager.resetDiffsFilterUI();
            App.filtersManager.applyAllFilters();
        });
        document.getElementById('addDiffsMinusFilter').addEventListener('click', () => {
            if (!App.model.splitScreen || !App.model.makeTreeDiffs) {
                askForEnableDiffs();
                return;
            }
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            const filterValue = document.getElementById('filterDiffsInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");
                return;
            }
            if (App.model.filtersDiffsMinus.indexOf(filterValue) < 0 && App.model.filtersDiffsPlus.indexOf(filterValue) < 0) {
                App.model.filtersDiffsMinus.push(filterValue);
                App.filtersManager.resetDiffsFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + filterValue + '" is already present.');
            }
        });
        document.getElementById('addDiffsPlusFilter').addEventListener('click', () => {
            if (!App.model.splitScreen || !App.model.makeTreeDiffs) {
                askForEnableDiffs();
                return;
            }
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            const filterValue = document.getElementById('filterDiffsInput').value.trim().toLowerCase();
            if (!filterValue) {
                App.utils.showAlert("Please enter a string for filter.");

                return;
            }
            if (App.model.filtersDiffsMinus.indexOf(filterValue) < 0 && App.model.filtersDiffsPlus.indexOf(filterValue) < 0) {
                App.model.filtersDiffsPlus.push(filterValue);
                App.filtersManager.resetDiffsFilterUI();
                App.filtersManager.applyAllFilters();
            } else {
                App.utils.showAlert("This filter is already present.");
                App.utils.writeMessage('Filter "' + filterValue + '" is already present.');
            }

        });
        document.getElementById('clearDiffsFilter').addEventListener('click', () => {
            if (!App.model.splitScreen || !App.model.makeTreeDiffs) {
                askForEnableDiffs();
                return;
            }
            App.filtersManager.removeDiffsFilters();
        });

        //Filters Select/Deselect all
        document.getElementById('selectAll').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            App.filtersManager.removeAllFilters();
            App.treeManager.inRendering = true;
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            //update stats
            App.selectionListManager.updateSelectionStats();
            App.treeManager.inRendering = false;
            App.utils.writeMessage('All items selected.');
        });
        document.getElementById('deselectAll').addEventListener('click', () => {
            if (!App.model.sourceFolder) {
                App.utils.showAlert("Please select a source folder first.");

                return;
            }
            App.filtersManager.removeAllFilters();
            //update stats
            App.selectionListManager.updateSelectionStats();

            App.utils.writeMessage('All items deselected.');
        });
    }

    //Filters common
    removeAllFilters() {
        App.treeManager.inRendering = true;
        this.resetNameFilterUI();
        this.resetDateFilterUI();
        this.resetSizeFilterUI();
        this.resetDiffsFilterUI();

        // iterate all tree checkboxes
        App.model.filtersNamePlus = [];
        App.model.filtersNameMinus = [];
        App.model.filtersDatePlus = [];
        App.model.filtersDateMinus = [];
        App.model.filtersSizePlus = [];
        App.model.filtersSizeMinus = [];
        App.model.filtersDiffsPlus = [];
        App.model.filtersDiffsMinus = [];

        this.renderNameFiltersList();
        this.renderDateFiltersList();
        this.renderSizeFiltersList();
        this.renderDiffsFiltersList();

        this.removeAllSelection();
        App.treeManager.inRendering = false;
        App.utils.writeMessage('All filters removed.');
    }
    applyAllFilters() {
        App.treeManager.inRendering = true;
        this.renderNameFiltersList();
        this.renderDateFiltersList();
        this.renderSizeFiltersList();
        this.renderDiffsFiltersList();

        this.removeAllSelection();

        // apply filters for names
        for (const filterValue of App.model.filtersNamePlus) {
            // iterate all tree checkboxes
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeName = checkbox.dataset.nodeName.toLowerCase();
                if (filterValue !== '' && nodeName.includes(filterValue.toLowerCase())) {
                    checkbox.checked = true;
                    // expand to selected child node
                    App.treeManager.expandAncestors(checkbox);
                }
            });
        }
        for (const filterValue of App.model.filtersNameMinus) {
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeName = checkbox.dataset.nodeName.toLowerCase();
                if (filterValue !== '' && nodeName.includes(filterValue.toLowerCase())) {
                    checkbox.checked = false;
                }
            });
        }

        //apply filters for Date, Size and Diffs, evaluating also App.model.relationshipOR true or false (AND)
        for (const filterValue of App.model.filtersDatePlus) {
            // iterate all tree checkboxes
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeDate = checkbox.dataset.nodeModified;
                if (App.filtersManager.dateSingleInsideARange(nodeDate, filterValue)) {
                    if (App.model.relationshipOR) {
                        checkbox.checked = true;
                        // expand to selected node
                        App.treeManager.expandAncestors(checkbox);
                    } else {
                        if (App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0) {
                            checkbox.checked = true;
                            // expand to selected node
                            App.treeManager.expandAncestors(checkbox);
                        }
                        //on if no previous condition present (Name and Date)
                    }
                } else {
                    if (!App.model.relationshipOR) checkbox.checked = false;
                }
            });
        }
        for (const filterValue of App.model.filtersDateMinus) {
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeDate = checkbox.dataset.nodeModified;
                if (App.filtersManager.dateSingleInsideARange(nodeDate, filterValue)) {
                    checkbox.checked = false;
                }
            });
        }

        for (const filterValue of App.model.filtersSizePlus) {
            // iterate all tree checkboxes
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeSize = checkbox.dataset.nodeSize;
                if (App.filtersManager.sizeSingleInsideARange(nodeSize, filterValue)) {
                    if (App.model.relationshipOR) {
                        checkbox.checked = true;
                        // expand to selected
                        App.treeManager.expandAncestors(checkbox);
                    } else {
                        if (App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0 && filterDateMinus.length === 0 && App.model.filtersDatePlus.length === 0) {
                            checkbox.checked = true;
                            // expand to selected
                            App.treeManager.expandAncestors(checkbox);
                        }
                        //on if no previous condition exists (Name and Date for Size)
                    }
                } else {
                    if (!App.model.relationshipOR) checkbox.checked = false;
                }
            });
        }
        for (const filterValue of App.model.filtersSizeMinus) {
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const nodeSize = checkbox.dataset.nodeSize;
                if (App.filtersManager.sizeSingleInsideARange(nodeSize, filterValue)) {
                    checkbox.checked = false;
                }
            });
        }

        for (const filterValue of App.model.filtersDiffsPlus) {
            // iterate all tree checkboxes
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (App.filtersManager.matchesDiff(checkbox, filterValue)) {
                    if (App.model.relationshipOR) {
                        checkbox.checked = true;
                        // expand to selected
                        App.treeManager.expandAncestors(checkbox);
                    } else {
                        if (App.model.filtersNameMinus.length === 0 && App.model.filtersNamePlus.length === 0 && filterDateMinus.length === 0 && App.model.filtersDatePlus.length === 0
                            && filterSizeMinus.length === 0 && App.model.filtersSizePlus.length === 0) {
                            checkbox.checked = true;
                            // expand to selected
                            App.treeManager.expandAncestors(checkbox);
                        }
                        //on if no previous condition exists (Name, Date, Size for Diffs)
                    }
                } else {
                    if (!App.model.relationshipOR) checkbox.checked = false;
                }
            });
        }
        for (const filterValue of App.model.filtersDiffsMinus) {
            const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (App.filtersManager.matchesDiff(checkbox, filterValue)) {
                    checkbox.checked = false;
                }
            });
        }

        //update stats
        App.selectionListManager.updateSelectionStats();
        App.treeManager.inRendering = false;
        App.utils.writeMessage('Filters updated.');
    }
    removeAllSelection() {
        const checkboxes = document.querySelectorAll('#source-tree input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        //update stats
        App.selectionListManager.updateSelectionStats();
    }

    // Name
    removeNameFilters() {
        this.resetNameFilterUI();
        // iterate all tree checkboxes
        App.model.filtersNamePlus = [];
        App.model.filtersNameMinus = [];
        this.renderNameFiltersList();
        this.applyAllFilters();
        App.utils.writeMessage('Name filters removed.');
    }
    removeSingleNameFilter(index, kind) {
        let oldFilter = "";
        if (kind === "+") {
            oldFilter = App.model.filtersNamePlus[index];
            App.model.filtersNamePlus.splice(index, 1);
        }
        if (kind === "-") {
            oldFilter = App.model.filtersNameMinus[index];
            App.model.filtersNameMinus.splice(index, 1);
        }
        App.utils.writeMessage('Removed Name filter "' + kind + oldFilter + '".');
        this.applyAllFilters();
    }
    renderNameFiltersList() {
        const listContainer = document.getElementById('nameFilterList');
        listContainer.innerHTML = '';
        drawFiltersFor(App.model.filtersNamePlus, "+");
        drawFiltersFor(App.model.filtersNameMinus, "-");
        if (listContainer.innerHTML === '') listContainer.innerHTML = 'Name Filters list'

        function drawFiltersFor(arrayList, filterKind) {
            arrayList.forEach((filter, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'position-relative', 'me-3');
                if (filterKind === "+") listItem.classList.add('filter-plus');
                if (filterKind === "-") listItem.classList.add('filter-minus');
                listItem.textContent = filterKind + filter;
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.title = 'Remove Filter';
                removeButton.addEventListener('click', () => {
                    App.filtersManager.removeSingleNameFilter(index, filterKind);
                });
                removeButton.style.cursor = 'pointer';
                listItemInner.appendChild(removeButton);
                listItem.appendChild(listItemInner);
                listContainer.appendChild(listItem);
            });
        }
    }
    resetNameFilterUI() {
        document.getElementById('filterNameInput').value = "";
    }

    // Date
    dateRangeInsideAnotherArrayOfRanges(rangeToCheck, rangeOrigin) {
        let isInside = false
        if (rangeToCheck[0] !== null && rangeToCheck[0] !== undefined && rangeToCheck[0] !== "undefined" && (!(rangeToCheck[0] instanceof Date) || rangeToCheck[0].toString() === "Invalid Date")) {
            rangeToCheck[0] = new Date(rangeToCheck[0]);
        }
        if (rangeToCheck[1] !== null && rangeToCheck[1] !== undefined && rangeToCheck[1] !== "undefined" && (!(rangeToCheck[1] instanceof Date) || rangeToCheck[1].toString() === "Invalid Date")) {
            rangeToCheck[1] = new Date(rangeToCheck[1]);
        }
        const pickerStart = rangeToCheck[0] ? rangeToCheck[0].getTime() : 0;
        const pickerEnd = rangeToCheck[1] ? rangeToCheck[1].getTime() : 0;

        rangeOrigin.forEach(function (rangePresent) {
            if (rangePresent[0] !== null && rangePresent[0] !== undefined && rangePresent[0] !== "undefined" && (!(rangePresent[0] instanceof Date) || rangePresent[0].toString() === "Invalid Date")) {
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
    dateSingleInsideARange(dateToCheck, rangePresent) {
        let isInside = false;

        const pickerPoint = App.utils.dateToGetTime(dateToCheck);

        if (rangePresent[0] !== null && rangePresent[0] !== undefined && rangePresent[0] !== "undefined" && (!(rangePresent[0] instanceof Date) || rangePresent[0].toString() === "Invalid Date")) {
            rangePresent[0] = new Date(rangePresent[0]);
        }
        if (rangePresent[1] !== null && rangePresent[1] !== undefined && rangePresent[1] !== "undefined" && (!(rangePresent[1] instanceof Date) || rangePresent[1].toString() === "Invalid Date")) {
            rangePresent[1] = new Date(rangePresent[1]);
        }

        const originStart = rangePresent[0] ? rangePresent[0].getTime() : Number.NEGATIVE_INFINITY;
        const originEnd = rangePresent[1] ? rangePresent[1].getTime() : Number.POSITIVE_INFINITY;

        // verify if interval to check is inside current interval
        if (originStart <= pickerPoint && pickerPoint <= originEnd) {
            isInside = true;
        }

        return isInside
    }
    removeDateFilters() {
        this.resetDateFilterUI();
        // iterate on all tree checkboxes
        App.model.filtersDatePlus = [];
        App.model.filtersDateMinus = [];
        this.renderDateFiltersList();
        this.applyAllFilters();
        App.utils.writeMessage('Date filters removed.');
    }
    removeSingleDateFilter(index, kind) {
        let oldFilter = "";
        if (kind === "+") {
            oldFilter = App.model.filtersDatePlus[index];
            App.model.filtersDatePlus.splice(index, 1);
        }
        if (kind === "-") {
            oldFilter = App.model.filtersDateMinus[index];
            App.model.filtersDateMinus.splice(index, 1);
        }
        App.utils.writeMessage('Removed Date filter "' + kind + this.renderSingleDateFilter(oldFilter) + '".');
        this.applyAllFilters();
    }
    renderSingleDateFilter(filter) {
        return App.utils.formatDate(filter[0]) + "-" + App.utils.formatDate(filter[1]);
    }
    renderDateFiltersList() {
        const listContainer = document.getElementById('dateFilterList');
        listContainer.innerHTML = '';
        drawFiltersFor(App.model.filtersDatePlus, "+");
        drawFiltersFor(App.model.filtersDateMinus, "-");
        if (listContainer.innerHTML === '') listContainer.innerHTML = 'Date Filters list'

        function drawFiltersFor(arrayList, filterKind) {
            arrayList.forEach((filter, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'position-relative', 'me-3');
                if (filterKind === "+") listItem.classList.add('filter-plus');
                if (filterKind === "-") listItem.classList.add('filter-minus');
                listItem.textContent = filterKind + App.filtersManager.renderSingleDateFilter(filter);
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single item
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.title = 'Remove Filter';
                removeButton.addEventListener('click', () => {
                    App.filtersManager.removeSingleDateFilter(index, filterKind);
                });
                removeButton.style.cursor = 'pointer';
                listItemInner.appendChild(removeButton);
                listItem.appendChild(listItemInner);
                listContainer.appendChild(listItem);
            });
        }
    }
    resetDateFilterUI() {
        App.uiManager.rangePicker.setDates({clear: true}, {clear: true});
    }

    // Size
    sizeRangeInsideAnotherArrayOfRanges(rangeToCheck, rangeOrigin) {
        let isInside = false
        let sliderStart = (rangeToCheck[0] !== null && rangeToCheck[0] !== undefined)
            ? rangeToCheck[0]
            : App.model.limitRangeSliderValues[0];
        let sliderEnd = (rangeToCheck[1] !== null && rangeToCheck[1] !== undefined)
            ? rangeToCheck[1]
            : App.model.limitRangeSliderValues[1];
        if (typeof sliderStart !== 'number') {
            const convertedSize = Number(sliderStart);
            if (!isNaN(convertedSize)) {
                sliderStart = convertedSize;
            } else {
                sliderStart = App.model.limitRangeSliderValues[0];
            }
        }
        if (typeof sliderEnd !== 'number') {
            const convertedSize = Number(sliderEnd);
            if (!isNaN(convertedSize)) {
                sliderEnd = convertedSize;
            } else {
                sliderEnd = App.model.limitRangeSliderValues[1];
            }
        }
        rangeOrigin.forEach(function (rangePresent) {
            let originStart = (rangePresent[0] !== null && rangePresent[0] !== undefined)
                ? rangePresent[0]
                : App.model.limitRangeSliderValues[0];
            let originEnd = (rangePresent[1] !== null && rangePresent[1] !== undefined)
                ? rangePresent[1]
                : App.model.limitRangeSliderValues[1];
            if (typeof originStart !== 'number') {
                const convertedSize = Number(originStart);
                if (!isNaN(convertedSize)) {
                    originStart = convertedSize;
                } else {
                    originStart = App.model.limitRangeSliderValues[0];
                }
            }
            if (typeof originEnd !== 'number') {
                const convertedSize = Number(originEnd);
                if (!isNaN(convertedSize)) {
                    originEnd = convertedSize;
                } else {
                    originEnd = App.model.limitRangeSliderValues[1];
                }
            }
            if (originStart <= sliderStart && sliderEnd <= originEnd) {
                isInside = true;
            }
        });

        return isInside
    }
    sizeSingleInsideARange(sizeToCheck, rangePresent) {
        let isInside = false
        if (!sizeToCheck) return false;

        let sliderPoint = sizeToCheck ? sizeToCheck / 1024 : App.model.limitRangeSliderValues[0]; // sizeToCheck is in bytes - divide by 1024
        if (typeof sliderPoint !== 'number') {
            const convertedSize = Number(sliderPoint);
            if (!isNaN(convertedSize)) {
                sliderPoint = convertedSize;
            } else {
                sliderPoint = App.model.limitRangeSliderValues[0];
            }
        }
        let originStart = (rangePresent[0] !== null && rangePresent[0] !== undefined)
            ? rangePresent[0]
            : App.model.limitRangeSliderValues[0];
        let originEnd = (rangePresent[1] !== null && rangePresent[1] !== undefined)
            ? rangePresent[1]
            : App.model.limitRangeSliderValues[1];
        if (typeof originStart !== 'number') {
            const convertedSize = Number(originStart);
            if (!isNaN(convertedSize)) {
                originStart = convertedSize;
            } else {
                originStart = App.model.limitRangeSliderValues[0];
            }
        }
        if (typeof originEnd !== 'number') {
            const convertedSize = Number(originEnd);
            if (!isNaN(convertedSize)) {
                originEnd = convertedSize;
            } else {
                originEnd = App.model.limitRangeSliderValues[1];
            }
        }

        // check if slider interval is inside current
        if (originStart <= sliderPoint && sliderPoint <= originEnd) {
            isInside = true;
        }
        return isInside
    }
    removeSizeFilters() {
        this.resetSizeFilterUI();
        // iterate on all tree checkboxes
        App.model.filtersSizePlus = [];
        App.model.filtersSizeMinus = [];
        this.renderSizeFiltersList();
        this.applyAllFilters();
        App.utils.writeMessage('Size filters removed.');
    }
    removeSingleSizeFilter(index, kind) {
        let oldFilter = "";
        if (kind === "+") {
            oldFilter = App.model.filtersSizePlus[index];
            App.model.filtersSizePlus.splice(index, 1);
        }
        if (kind === "-") {
            oldFilter = App.model.filtersSizeMinus[index];
            App.model.filtersSizeMinus.splice(index, 1);
        }
        App.utils.writeMessage('Removed Size filter "' + kind + this.renderSingleSizeFilter(oldFilter) + '".');
        this.applyAllFilters();
    }
    renderSingleSizeFilter(filter) {
        return App.utils.formatSizeForFilters(filter[0]) + "-" + formatSize(filter[1]);
    }
    renderSizeFiltersList() {
        const listContainer = document.getElementById('sizeFilterList');
        listContainer.innerHTML = ''; // clear existing list
        drawFiltersFor(App.model.filtersSizePlus, "+");
        drawFiltersFor(App.model.filtersSizeMinus, "-");
        if (listContainer.innerHTML === '') listContainer.innerHTML = 'Size Filters list'

        function drawFiltersFor(arrayList, filterKind) {
            arrayList.forEach((filter, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'position-relative', 'me-3');
                if (filterKind === "+") listItem.classList.add('filter-plus');
                if (filterKind === "-") listItem.classList.add('filter-minus');
                listItem.textContent = filterKind + App.filtersManager.renderSingleSizeFilter(filter);
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single item
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.title = 'Remove Filter';
                removeButton.addEventListener('click', () => {
                    App.filtersManager.removeSingleSizeFilter(index, filterKind);
                });
                removeButton.style.cursor = 'pointer';
                listItemInner.appendChild(removeButton);
                listItem.appendChild(listItemInner);
                listContainer.appendChild(listItem);
            });
        }
    }
    resetSizeFilterUI() {
        App.uiManager.rangeSlider.noUiSlider.set(App.model.initialRangeSliderValues)
    }

    // Diffs
    removeDiffsFilters() {
        this.resetDiffsFilterUI();
        // iterate all tree checkboxes
        App.model.filtersDiffsPlus = [];
        App.model.filtersDiffsMinus = [];
        this.renderDiffsFiltersList();
        this.applyAllFilters();
        App.utils.writeMessage('Diffs filters removed.');
    }
    removeSingleDiffsFilter(index, kind) {
        let oldFilter = "";
        if (kind === "+") {
            oldFilter = App.model.filtersDiffsPlus[index];
            App.model.filtersDiffsPlus.splice(index, 1);
        }
        if (kind === "-") {
            oldFilter = App.model.filtersDiffsMinus[index];
            App.model.filtersDiffsMinus.splice(index, 1);
        }
        App.utils.writeMessage('Removed Diffs filter "' + kind + oldFilter + '".');
        this.applyAllFilters();
    }
    renderDiffsFiltersList() {
        const listContainer = document.getElementById('diffsFilterList');
        listContainer.innerHTML = '';
        drawFiltersFor(App.model.filtersDiffsPlus, "+");
        drawFiltersFor(App.model.filtersDiffsMinus, "-");
        if (listContainer.innerHTML === '') listContainer.innerHTML = 'Diffs Filters list'

        function drawFiltersFor(arrayList, filterKind) {
            arrayList.forEach((filter, index) => {
                const listItem = document.createElement('span');
                listItem.classList.add('badge', 'badge-outer', 'text-bg-secondary', 'position-relative', 'me-3');
                if (filterKind === "+") listItem.classList.add('filter-plus');
                if (filterKind === "-") listItem.classList.add('filter-minus');
                listItem.textContent = filterKind + filter;
                const listItemInner = document.createElement('span');
                listItemInner.classList.add('position-absolute', 'start-100', 'translate-middle', 'badge', 'rounded-pill', 'bg-danger');
                // remove single
                const removeButton = document.createElement('a');
                removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
                removeButton.title = 'Remove Filter';
                removeButton.addEventListener('click', () => {
                    App.filtersManager.removeSingleDiffsFilter(index, filterKind);
                });
                removeButton.style.cursor = 'pointer';
                listItemInner.appendChild(removeButton);
                listItem.appendChild(listItemInner);
                listContainer.appendChild(listItem);
            });
        }
    }
    resetDiffsFilterUI() {
        document.getElementById('filterDiffsInput').value = "diff";
    }
    matchesDiff(checkbox, filter) {
        let matches = false;
        //check node for filter
        let realItem = checkbox.dataset;
        if (realItem && realItem.nodeExists == 1) {
            switch (filter) {
                case "diff":
                    if (realItem.nodeDifferent == 1) matches = true;
                    break;
                case "nodiff":
                    if (realItem.nodeDifferent == 0) matches = true;
                    break;
                case "size":
                    if (realItem.nodeDifferent_size == 1) matches = true;
                    break;
                case "date":
                    if (realItem.nodeDifferent_date == 1) matches = true;
                    break;
            }
        }
        return matches;
    }

}

module.exports = FiltersManager;