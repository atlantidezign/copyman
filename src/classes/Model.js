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
    fileTreeData = []; // system: tree data

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
    saveSelectionDefault = true;


    // User Options
    fileOverwrite = this.fileOverwriteDefault;
    copyVerbose = this.copyVerboseDefault;
    copyReport = this.copyReportDefault;
    abortFullQueue = this.abortFullQueueDefault;
    dontConfirmQueue = this.dontConfirmQueueDefault;
    propagateSelections = this.propagateSelectionsDefault;
    clickOnNamesToSelect = this.clickOnNamesToSelectDefault;
    relationshipOR = this.relationshipORDefault;
    sortOrder = this.sortOrderDefault;
    maintainLogs = this.maintainLogsDefault;
    saveSelection = this.saveSelectionDefault;

    // Components
    initialRangeSliderValues = [500000, 1000000];
    limitRangeSliderValues = [0, 1000000000];
    dateFormat = 'mm/dd/yyyy';
    localeLang = 'en';

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

}

// export for singleton
module.exports = new Model();