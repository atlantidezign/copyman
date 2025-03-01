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

    //Business vars
    clicksActive = true; //system: to disactivate clicks while copying
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

    //User folders
    sourceFolder = ''; // user choose: source folder
    destinationFolders = []; // user choose: destinations folder

    //User filters
    filtersNamePlus = []; //Array<string>
    filtersNameMinus = []; //Array<string>
    filtersDatePlus = []; //Array<{ from: Date, to: Date}>
    filtersDateMinus = []; //Array<{ from: Date, to: Date}>
    filtersSizePlus = []; //Array<{ from: number, to: number}>
    filtersSizeMinus = []; //Array<{ from: number, to: number}>

    //User Options Defaults
    fileOverwriteDefault = true;
    copyVerboseDefault = false;
    copyReportDefault = true;
    propagateSelectionsDefault = true;
    relationshipORDefault = true;
    //User Options
    fileOverwrite = this.fileOverwriteDefault;
    copyVerbose = this.copyVerboseDefault;
    copyReport = this.copyReportDefault;
    propagateSelections = this.propagateSelectionsDefault;
    relationshipOR = this.relationshipORDefault;

    //Components
    initialRangeSliderValues = [500000, 1000000];
    limitRangeSliderValues = [0, 1000000000];
    dateFormat = 'mm/dd/yyyy';
    localeLang = 'en';

    //Messages
    messageLife = 3000; //system: message life in ms before clean
}

// export for singleton
module.exports = new Model();