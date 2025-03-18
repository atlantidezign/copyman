// UIManager.js
class UIManager {
    constructor() {
    }

    defaultSkin = {};
    availableSkins = [];
    skinNames = [];

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

        //inits
        this.initializeSkin();
        this.initializeComponents();
        this.initializeModals();
        this.initializeDebug();
    }

    // Modals
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
Binaries downloads are available on <a href="https://www.copyman.it"><img src="images/logotype_indigo_alt.svg" class="logotipo" alt="Copyman" title="Copyman" height="14" /></a> website <br>
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

    // Components
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

        // Filters panel
        document.getElementById("button-filter-open").addEventListener("click", () => {
            document.getElementById("button-filter-open").classList.add("hidden");
            document.getElementById("button-filter-close").classList.remove("hidden");
            document.getElementById("div-filters1").classList.remove("hidden");
            document.getElementById("div-filters2").classList.remove("hidden");
            document.getElementById("div-filters3").classList.remove("hidden");
            document.getElementById("div-filters4").classList.remove("hidden");
            document.getElementById("div-tree").classList.remove("expanded");
            document.getElementById("div-controls").classList.remove("expanded");
        });
        document.getElementById("button-filter-close").addEventListener("click", () => {
            document.getElementById("button-filter-open").classList.remove("hidden");
            document.getElementById("button-filter-close").classList.add("hidden");
            document.getElementById("div-filters1").classList.add("hidden");
            document.getElementById("div-filters2").classList.add("hidden");
            document.getElementById("div-filters3").classList.add("hidden");
            document.getElementById("div-filters4").classList.add("hidden");
            document.getElementById("div-tree").classList.add("expanded");
            document.getElementById("div-controls").classList.add("expanded");
        });

        // Popover Info Snapshot
        let popoverEl = document.getElementById('infoSnapshot');
        this.popoverInfoSnapshot = new bootstrap.Popover(popoverEl, {
            trigger: 'focus',
            html: true
        })
    }

    // Split screen
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
            App.treeManager.updateTreeDiffs();
        } else {
            this.splitted = false;
            this.cleanDestinationTree();
            document.querySelector('.gutter-col').classList.add('hidden');
            document.querySelector('#dest-tree').classList.add('hidden');
        }
    }

    // Empty dest tree container
    cleanDestinationTree() {
        const container = document.getElementById('dest-tree');
        container.innerHTML = '';
    }

    // Skin - internal
    initializeSkin() {
        this.defaultSkin = this.getCopymanSkin();
        this.availableSkins = [
            { name: App.model.currentSkinDefault, data: this.defaultSkin },
            ...App.model.skins
        ]
        for (const skin of this.availableSkins) {
            this.skinNames.push(skin.name);
        }
    }
    getSkinDataByName(name) {
        for (const skin of this.availableSkins) {
            if (skin.name === name) {
                return skin.data;
            }
        }
        return null;
    }
    applySkin(skinProperties) {
        const root = document.documentElement;
        for (const property in skinProperties) {
            if (skinProperties.hasOwnProperty(property)) {
                root.style.setProperty(property, skinProperties[property]);
            }
        }
        this.updateLilGuiFromTheme();
    }
    getCopymanSkin() {
        const computedStyle = getComputedStyle(document.documentElement);
        const skin = {};
        App.model.skinKeys.forEach(key => {
            skin[key] = computedStyle.getPropertyValue(key).trim();
        });
        return skin;
    }

    // Skin public
    getSkinNames() {
        return this.skinNames;
    }
    setSkinByName(name) {
        const skinData = this.getSkinDataByName(name);
        if (skinData) {
            this.applySkin(skinData);
            const logoImages = document.querySelectorAll('.logotipo');
            if (name == App.model.currentSkinDefault) {
                logoImages.forEach(img => {
                    img.src = 'images/logotype_indigo_alt.svg';
                });
            } else {
                logoImages.forEach(img => {
                    img.src = 'images/logotype_textcolor.svg';
                });
            }
        }
    }

    // Debug: lil-gui
    guiActive = true; //TODO set to false
    gui = null;
    guiState = {};
    async initializeDebug() {
        const debugValue = await ipcRenderer.invoke('get-indebug');
        if (this.guiActive && debugValue) {
            this.createLilGui();
        }
    }
    createLilGui() {
        const root = document.documentElement;
        this.gui = new GUI();
        this.gui.title("Copyman Skin Editor - Dev");
        App.model.skinKeys.forEach(key => {
            if (key.indexOf('-irgb') >= 0) {
                this.guiState[key] = 'rgb(' + this.guiFetchVariable(key) + ')';
                this.gui.addColor( this.guiState, key ).onChange((value) => {
                    App.uiManager.guiUpdateVariable(key, value.replace('rgb(','').replace(')',''));
                })
            } else if (key.indexOf('-rgb') >= 0) {
                const { rgb, alpha } = this.parseRGBA(this.guiFetchVariable(key));
                this.guiState[key] = rgb;
                this.guiState[key+"-alpha"] = alpha;
                this.gui.addColorWithAlpha( this.guiState, key, key+"-alpha" ).onChange((newColor,newAlpha) => {
                    App.uiManager.guiUpdateVariable(key, App.uiManager.composeRGBA(newColor,newAlpha));
                })
            } else {
                this.guiState[key] = this.guiFetchVariable(key);
                this.gui.addColor( this.guiState, key ).onChange((value) => {
                    App.uiManager.guiUpdateVariable(key, value);
                })
            }
        });
        this.guiState.LogSkin = () => {
            let out = '\n/* Copyman Skin Editor - Dev */\n{ name: "loremipsum", data: {\n';
            Object.keys(App.uiManager.guiState).forEach(key => {
                if (!(key.startsWith("--"))) return;
                if (key.indexOf('-irgb') >= 0) {
                    out += '"'+key + '": "' + App.uiManager.parseToRGB(App.uiManager.guiState[key]).replace('rgb(','').replace(')','') +'",\n';
                } else if (key.indexOf('-rgb') >= 0 && key.indexOf('-alpha') < 0) {
                    out += '"'+key + '": "' + App.uiManager.composeRGBA(App.uiManager.guiState[key],App.uiManager.guiState[key+"-alpha"]) +'",\n';
                } else if (key.indexOf('Log') < 0 && key.indexOf('-alpha') < 0) {
                    out += '"'+key + '": "' + App.uiManager.guiState[key] +'",\n';
                }
            })
            out += '}}';
            console.log(out);
        }
        this.gui.add(this.guiState, 'LogSkin')
        this.guiState.LogCss = () => {
            let out = '\n/* Copyman Skin Editor - Dev */\n';
            Object.keys(App.uiManager.guiState).forEach(key => {
                if (!(key.startsWith("--"))) return;
                if (key.indexOf('-irgb') >= 0) {
                    out += key + ': ' + App.uiManager.parseToRGB(App.uiManager.guiState[key]).replace('rgb(','').replace(')','') +';\n';
                } else if (key.indexOf('-rgb') >= 0 && key.indexOf('-alpha') < 0) {
                    out += key + ': ' + App.uiManager.composeRGBA(App.uiManager.guiState[key],App.uiManager.guiState[key+"-alpha"]) +';\n';
                } else if (key.indexOf('Log') < 0 && key.indexOf('-alpha') < 0) {
                    out += key + ': ' + App.uiManager.guiState[key] +';\n';
                }
            });
            console.log(out);
        }
        this.gui.add(this.guiState, 'LogCss')
    }
    updateLilGuiFromTheme() {
        if (this.guiActive && this.gui !== null) {
            App.model.skinKeys.forEach(key => {
                if (key.indexOf('-irgb') >= 0) {
                    this.guiState[key] = 'rgb(' + this.guiFetchVariable(key) + ')';
                } else if (key.indexOf('-rgb') >= 0) {
                    const {rgb, alpha} = this.parseRGBA(this.guiFetchVariable(key));
                    this.guiState[key] = rgb;
                    this.guiState[key + "-alpha"] = alpha;
                } else {
                    this.guiState[key] = this.guiFetchVariable(key);
                }
            });
            for (const controller of this.gui.controllersRecursive()) {
                controller.updateDisplay();
            }
        }
    }

    // Utils - lil-gui
    guiFetchVariable(variableName) {
        return (
            getComputedStyle(document.documentElement)
                .getPropertyValue(variableName)
                .trim()
                .replace(/['"]+/g, '') || ''
        )
    }
    guiUpdateVariable(variableName, value) {
        this.guiState.colorText = value;
        document.documentElement.style.setProperty(variableName, value);
    }
    parseRGBA(rgbaString) {
        // extract rbg+alpha from rgba
        const regex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i;
        const match = rgbaString.match(regex);
        if (!match) {
            throw new Error('rgba format not valid');
        }
        const r = match[1];
        const g = match[2];
        const b = match[3];
        const alpha = match[4];
        const rgb = `rgb(${r}, ${g}, ${b})`;
        return { rgb, alpha };
    }
    parseToRGB(colorString) {
        const trimmed = colorString.trim();
        // Case hex
        if (trimmed.charAt(0) === '#') {
            let hex = trimmed.substring(1);
            if (hex.length === 3) {
                hex = hex.split('').map(ch => ch + ch).join('');
            }
            if (hex.length !== 6) {
                throw new Error('hex format not valid');
            }
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return `rgb(${r}, ${g}, ${b})`;
        }
        // Case rgb
        const regex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
        const match = trimmed.match(regex);
        if (!match) {
            throw new Error('rgb format not valid');
        }
        return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    }
    composeRGBA(rgbString, alpha) {
        // recompose rgba from rbg+alpha
        const innerRgb = App.uiManager.parseToRGB(rgbString);
        return `rgba(${innerRgb.replace('rgb(','').replace(')','')}, ${alpha})`;
    }
}

module.exports = UIManager;