// App.js
class App {
    static _instance;

    // Classes instances
    model = Model; // Model is a singleton, access by import
    utils = new Utils(); //no needs init
    optionsManager = new OptionsManager();
    copyManager = new CopyManager();
    snapshotManager = new SnapshotManager();
    uiManager = new UIManager();
    treeManager = new TreeManager();
    filtersManager = new FiltersManager();
    selectionListManager = new SelectionListManager();
    sysManager = new SysManager();
    localizationManager = new LocalizationManager();

    constructor() {
        if (App._instance) {
            return App._instance;
        }
        App._instance = this;
    }

    init() {
        // Main inits
        this.localizationManager.init(); //first
        this.sysManager.init(); //second
        this.uiManager.init(); //third
        this.optionsManager.init(); //fourth

        // Other inits
        this.copyManager.init();
        this.snapshotManager.init();
        this.treeManager.init();
        this.filtersManager.init();
        this.selectionListManager.init();
    }

    start() {
        //eventually: end preloader/splashscreen
    }
}

// export for singleton
module.exports = new App();