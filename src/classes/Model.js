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
    sortOrderList= ["alphabetical", "reverseAlphabetical", "sizeAsc", "sizeDesc",
        "dateAsc", "dateDesc", "extAsc", "extDesc"];

    // User Options Defaults
    fileOverwriteDefault = this.fileOverwriteEnum.always;
    copyVerboseDefault = false;
    copyReportDefault = true;
    abortFullQueueDefault = true;
    dontConfirmQueueDefault = false;
    propagateSelectionsDefault = true;
    clickOnNamesToSelectDefault = true;
    relationshipORDefault = true;
    sortOrderDefault = this.sortOrderList[0];
    maintainLogsDefault = false;
    loadNotCopyRelatedOptionsDefault = false;
    splitScreenDefault = false;
    saveSelectionDefault = true;
    makeTreeDiffsDefault = false;
    zipLevelDefault = -1;

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
    //sys, not copy-related
    maintainLogs = this.maintainLogsDefault;
    loadNotCopyRelatedOptions = this.loadNotCopyRelatedOptionsDefault;
    splitScreen = this.splitScreenDefault;
    saveSelection = this.saveSelectionDefault; //not in ui
    makeTreeDiffs = this.makeTreeDiffsDefault;
    zipLevel = this.zipLevelDefault;
    //view, not copy-related
    sortOrder = this.sortOrderDefault;

    // Components
    initialRangeSliderValues = [500000, 1000000];
    limitRangeSliderValues = [0, 1000000000];
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
    afterDiffsTimeout = 250;

    msBaseTolerance = 1000; //ms
    msCopySpeed = 50000; //ms - 50 MB/s

}

// export for singleton
module.exports = new Model();