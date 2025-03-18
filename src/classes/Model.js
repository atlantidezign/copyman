// Model.js
class Model {
    static _instance;

    constructor() {
        if (Model._instance) {
            return Model._instance;
        }
        Model._instance = this;
    }

    appVersion = version;

    // Business vars
    clicksActive = true; //system: to deactivate clicks while copying
    sourceTreeData = []; // system: source tree data
    destTreeData = []; // system: destination [0] tree data

    copyingReport = [];
    itemsCopied = [];
    itemsSkipped = [];
    itemsFailed = [];
    itemsTotal = 0;
    itemsProcessed = 0;
    sizeTotal = 0;
    sizeProcessed = 0;
    selectedNodes = [];

    // User folders
    sourceFolder = ''; // user choose: source folder
    destinationFolders = []; // user choose: destinations folder

    // User filters
    filtersNamePlus = []; //Array<string>
    filtersNameMinus = []; //Array<string>
    filtersDatePlus = []; //Array<{ from: Date, to: Date}>
    filtersDateMinus = []; //Array<{ from: Date, to: Date}>
    filtersSizePlus = []; //Array<{ from: number, to: number}>
    filtersSizeMinus = []; //Array<{ from: number, to: number}>
    filtersDiffsPlus = []; //Array<string>
    filtersDiffsMinus = []; //Array<string>

    // Enums
    fileOverwriteEnum = {
        always: 1,
        if_newer: 2,
        if_different: 3,
        never: 4,
        keep: 5,
        sync: 6,
        sync2: 7,
        brute: 8
    };
    sortOrderList = ["alphabetical", "reverseAlphabetical", "sizeAsc", "sizeDesc",
        "dateAsc", "dateDesc", "extAsc", "extDesc"];

    // User Options Defaults
    fileOverwriteDefault = this.fileOverwriteEnum.always;
    copyVerboseDefault = true;
    copyReportDefault = true;
    abortFullQueueDefault = true;
    dontConfirmQueueDefault = false;
    propagateSelectionsDefault = true;
    clickOnNamesToSelectDefault = true;
    relationshipORDefault = true;
    sortOrderDefault = this.sortOrderList[0];
    maintainLogsDefault = false;
    loadNotCopyRelatedOptionsDefault = false;
    splitScreenDefault = true;
    makeTreeDiffsDefault = true;
    saveSelectionDefault = true; //not in ui
    zipLevelDefault = -1;
    zipAlreadyCompressedDefault = false;
    msCopySpeedDefault = 50; //50 MB/s
    currentSkinDefault = "copyman";

    // User Options - stored
    //copy-related
    fileOverwrite = this.fileOverwriteDefault;
    copyVerbose = this.copyVerboseDefault;
    copyReport = this.copyReportDefault;
    abortFullQueue = this.abortFullQueueDefault;
    dontConfirmQueue = this.dontConfirmQueueDefault;
    //selection, not copy-related
    propagateSelections = this.propagateSelectionsDefault;
    clickOnNamesToSelect = this.clickOnNamesToSelectDefault;
    relationshipOR = this.relationshipORDefault;
    saveSelection = this.saveSelectionDefault;
    //sys, not copy-related
    maintainLogs = this.maintainLogsDefault;
    loadNotCopyRelatedOptions = this.loadNotCopyRelatedOptionsDefault;
    splitScreen = this.splitScreenDefault;
    makeTreeDiffs = this.makeTreeDiffsDefault;
    msCopySpeed = this.msCopySpeedDefault;
    currentSkin = this.currentSkinDefault;
    //zip, not copy-related
    zipLevel = this.zipLevelDefault;
    zipAlreadyCompressed = this.zipAlreadyCompressedDefault;
    //ui view, not copy-related
    sortOrder = this.sortOrderDefault;

    // Components
    initialRangeSliderValues = [500000, 1000000]; //for file size
    limitRangeSliderValues = [0, 1000000000]; //for file size
    dateFormat = 'mm/dd/yyyy';
    localeLang = 'en';

    // Preview
    isPreview = false;

    // Messages
    messageLife = 3000; //system: message life in ms before clean

    // Logs
    logs = [];

    // Queue
    queue = [];
    queueToExecute = [];
    isQueue = false;
    preQueueSnapshot = null;

    // Abort
    abort = false;
    wasAborted = false;
    someCopyDone = 0;

    // Diffs
    preDiffsSnapshot = null;
    afterDiffsTimeout = 100; //ms (with retries)
    msBaseTolerance = 1000; //ms

    // Zip
    archiveLevelDefault = 6;
    archiveExtensions = [
        '.zip', '.7z', '.rar', '.tar', '.gz', '.bz2', '.xz', '.iso', '.cab', '.arj', '.lz', '.lzma', '.z'
    ];

    // Skins
    skinKeys = [
        "--copyman-primary",
        "--copyman-primary-irgb",
        "--copyman-secondary",
        "--copyman-tertiary",
        "--copyman-quaternary",
        "--copyman-quinquinary",
        "--copyman-different",

        "--copyman-bg-rgb",
        "--copyman-bg-alt-rgb",
        "--copyman-bg-black-dark-rgb",
        "--copyman-bg-black-low-rgb",
        "--copyman-bg-black-mid-rgb",
        "--copyman-white",
        "--copyman-almostwhite",
        "--copyman-quitewhite",
        "--copyman-gray",
        "--copyman-gray-transparent",
        "--copyman-gray-mid",
        "--copyman-gray-light",
        "--copyman-gray-dark"
    ];
    // TODO add more skins
    skins = [{
        name: "blue", data: {
            "--copyman-primary": "#103df2",
            "--copyman-primary-irgb": "16,61,242",
            "--copyman-secondary": "#0f2ce8",
            "--copyman-tertiary": "#6875ff",
            "--copyman-quaternary": "#102ef2",
            "--copyman-quinquinary": "#ff7925",
            "--copyman-different": "#de00ee",

            "--copyman-bg-rgb": "rgba(102, 16, 242, 1)",
            "--copyman-bg-alt-rgb": "rgba(46, 16, 242, 1)",
            "--copyman-bg-black-dark-rgb": "rgba(0, 0, 0, 0.65)",
            "--copyman-bg-black-low-rgb": "rgba(0, 0, 0, 0.3)",
            "--copyman-bg-black-mid-rgb": "rgba(0, 0, 0, 0.5)",
            "--copyman-white": "#ffffff",
            "--copyman-almostwhite": "#eeeeee",
            "--copyman-quitewhite": "#dddddd",
            "--copyman-gray": "#8f8f8f",
            "--copyman-gray-transparent": "#99999944",
            "--copyman-gray-mid": "#aaaaaa",
            "--copyman-gray-light": "#DEE2E6",
            "--copyman-gray-dark": "#495057"
        }
    }, {
        name: "green", data: {
            "--copyman-primary": "#219700",
            "--copyman-primary-irgb": "33,151,0",
            "--copyman-secondary": "#0fe821",
            "--copyman-tertiary": "#7cff68",
            "--copyman-quaternary": "#2ef210",
            "--copyman-quinquinary": "#25fff8",
            "--copyman-different": "#ee7f00",

            "--copyman-bg-rgb": "rgba(102, 16, 242, 1)",
            "--copyman-bg-alt-rgb": "rgba(46, 16, 242,1)",
            "--copyman-bg-black-dark-rgb": "rgba(0, 0, 0, 0.65)",
            "--copyman-bg-black-low-rgb": "rgba(0, 0, 0, 0.3)",
            "--copyman-bg-black-mid-rgb": "rgba(0, 0, 0, 0.5)",
            "--copyman-white": "#ffffff",
            "--copyman-almostwhite": "#eeeeee",
            "--copyman-quitewhite": "#dddddd",
            "--copyman-gray": "#8f8f8f",
            "--copyman-gray-transparent": "#99999944",
            "--copyman-gray-mid": "#aaaaaa",
            "--copyman-gray-light": "#DEE2E6",
            "--copyman-gray-dark": "#495057"
        }
    },
        {
            name: "red", data: {
                "--copyman-primary": "#be0505",
                "--copyman-primary-irgb": "190,5,5",
                "--copyman-secondary": "#e80f0f",
                "--copyman-tertiary": "#ff6868",
                "--copyman-quaternary": "#f21010",
                "--copyman-quinquinary": "#ffed25",
                "--copyman-different": "#9f00ee",

                "--copyman-bg-rgb": "rgba(102, 16, 242, 1)",
                "--copyman-bg-alt-rgb": "rgba(46, 16, 242,1)",
                "--copyman-bg-black-dark-rgb": "rgba(0, 0, 0, 0.65)",
                "--copyman-bg-black-low-rgb": "rgba(0, 0, 0, 0.3)",
                "--copyman-bg-black-mid-rgb": "rgba(0, 0, 0, 0.5)",
                "--copyman-white": "#ffffff",
                "--copyman-almostwhite": "#eeeeee",
                "--copyman-quitewhite": "#dddddd",
                "--copyman-gray": "#8f8f8f",
                "--copyman-gray-transparent": "#99999944",
                "--copyman-gray-mid": "#aaaaaa",
                "--copyman-gray-light": "#DEE2E6",
                "--copyman-gray-dark": "#495057"
            }
        }]

}

// export for singleton
module.exports = new Model();