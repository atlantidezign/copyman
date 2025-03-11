// UIManager.js
class UIManager {
    constructor() {
    }

    init() {
        //General click
        document.addEventListener('click', (event) => {
            // If the clicked element is or is inside an element with id "abortCopy", do nothing
            if (event.target.closest('#abortCopy')) {
                return;
            }
            // For all other cases, block the click when clicksActive is false
            if (!App.model.clicksActive) {
                event.stopImmediatePropagation();
                event.preventDefault();
            }
        }, true);

        this.initializeComponents();
        this.initializeModals();
    }

    //Modals
    initializeHelpModal() {
        const usageFilePath = path.join(__dirname, '../../docs/USAGE.md');
        let markdown = '';
        try {
            markdown = fs.readFileSync(usageFilePath, 'utf8');
        } catch (error) {
            console.error('Error reading USAGE.md:', error);
            App.utils.writeMessage('Error reading USAGE.md.');
        }

        let underDocs = `
    <hr>
    Written by Alessandro Di Michele<br>
&copy;2025 Atlantide Design <a href="http://www.atlantide-design.it">www.atlantide-design.it</a> All rights reserved.<br>
<br>
Binaries downloads are available on <a href="https://www.copyman.it"><img src="images/logotype_indigo_alt.svg" alt="Copyman" title="Copyman" height="14"/></a> website <br>
Source code and binaries are available on <a href="https://github.com/atlantidezign/copyman"><i class="bi bi-github"></i> GitHub</a>`;
        let aboutDocs = `
    <img src="images/logotype_white.svg" alt="Copyman" class="img-fluid" title="Copyman" width="300"/><br>
    v${App.model.appVersion}
    <br>
    <br>
    <p>Select and copy items at lightning speed to multiple destinations while preserving the folder structure - with a focus on automation.</p>
    `;
        document.getElementById('helpContentMD').innerHTML = marked.parse(markdown) + underDocs;
        document.getElementById('aboutContentMD').innerHTML = aboutDocs + underDocs;
    }

    initializeSnapshotModal() {
        App.snapshotManager.listSnapshots();
    }
    initializeModals() {
        this.initializeHelpModal();
        this.initializeSnapshotModal();
        App.selectionListManager.updateListContent();
    }

    //Components
    rangePicker = null;
    rangeSlider = null;
    popoverInfoSnapshot = null;
    initializeComponents() {
        if (navigator.language && navigator.language.toLowerCase().startsWith('it')) {
            App.model.dateFormat = 'dd/mm/yyyy';
            App.model.localeLang = 'it';
        }

        const elem = document.querySelector('.input-dateRange');
        this.rangePicker = new DateRangePicker(elem, {
            buttonClass: 'btn',
            allowOneSidedRange: true,
            enableOnReadonly: true,
            clearButton: true,
            todayButton: true,
            todayButtonMode: 0,
            todayHighlight: true,
            format: App.model.dateFormat,
            language: App.model.localeLang
        });

        this.rangeSlider = document.getElementById('slider-range');
        noUiSlider.create(this.rangeSlider, {
            start: App.model.initialRangeSliderValues,
            step: 1,
            range: {
                'min': [App.model.limitRangeSliderValues[0]],
                '25%': [1000],
                '75%': [1000000],
                'max': [App.model.limitRangeSliderValues[1]]
            },
            connect: true,
            tooltips: [true, true],
            behaviour: 'drag-smooth-steps-tap'
        });

        //date
        let dateFrom = document.getElementById('range-start');
        let dateTo = document.getElementById('range-end');
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
            const correctedValue = correctDateInput(rawValue, App.model.dateFormat);
            this.value = correctedValue;
        });
        dateTo.addEventListener('change', function (e) {
            let rawValue = this.value;
            const correctedValue = correctDateInput(rawValue, App.model.dateFormat);
            this.value = correctedValue;
        });

        //size
        let sliderFrom = document.getElementById('slider-from');
        let sliderTo = document.getElementById('slider-to');
        this.rangeSlider.noUiSlider.on('update', (values, handle) => {
            let value = values[handle];
            if (handle) {
                sliderTo.value = Number(value);
            } else {
                sliderFrom.value = Number(value);
            }
        });
        sliderFrom.addEventListener('change',  () => {
            let rawValue = this.value;
            App.uiManager.rangeSlider.noUiSlider.set([rawValue, null]);
        });

        sliderTo.addEventListener('change', ()=> {
            let rawValue = this.value;
            App.uiManager.rangeSlider.noUiSlider.set([null, rawValue]);
        });
        function correctDateInput(inputValue, dateFormat) {
            // extracts day month and year from string, as numbers
            const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
            const match = inputValue.match(regex);

            if (!match) {
                // if format not matches, returns original.
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
            if (App.model.dateFormat === 'dd/mm/yyyy') {
                outputString = `${dayFormatted}/${monthFormatted}/${year}`;
            } else if (App.model.dateFormat === 'mm/dd/yyyy') {
                outputString = `${monthFormatted}/${dayFormatted}/${year}`;
            }

            return outputString;
        }

        // Popover Info Snapshot
        let popoverEl = document.getElementById('infoSnapshot');
        this.popoverInfoSnapshot = new bootstrap.Popover(popoverEl, {
            trigger: 'focus',
            html: true
        })
    }

    splitted = false;
    updateSplitScreen() {
        if (App.model.splitScreen === true) {
            if (!this.splitted) {
                this.splitted = true;
                // Split
                window.Split({
                    snapOffset: 90,
                    columnGutters: [{
                        track: 1,
                        element: document.querySelector('.gutter-col-1'),
                    }],
                })
                document.querySelector('.gutter-col').classList.remove('hidden');
                document.querySelector('#dest-tree').classList.remove('hidden');
                App.copyManager.updateDestinationList();
            }
        } else {
            this.splitted = false;
            this.cleanDestinationTree();
            document.querySelector('.gutter-col').classList.add('hidden');
            document.querySelector('#dest-tree').classList.add('hidden');
        }
    }


    cleanDestinationTree() {
        const container = document.getElementById('dest-tree');
        container.innerHTML = '';
    }
}

module.exports = UIManager;