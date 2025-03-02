const {ipcRenderer, remote, shell} = require('electron');
const fs = require('fs');
const path = require('path');
const { version } = require('../package.json');

const Model = require('./classes/Model');
const OptionsManager = require('./classes/OptionsManager');
const CopyManager = require('./classes/CopyManager');
const SnapshotManager = require('./classes/SnapshotManager');
const UIManager = require('./classes/UIManager');
const TreeManager = require('./classes/TreeManager');
const FiltersManager = require('./classes/FiltersManager');
const SelectionListManager = require('./classes/SelectionListManager');
const Utils = require('./classes/Utils');
const SysManager = require('./classes/SysManager');
const LocalizationManager = require('./classes/LocalizationManager');
const QueueManager = require('./classes/QueueManager');

const App = require('./classes/App');
const app = App; // App is a singleton, access by import

app.init();
app.start();
