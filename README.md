# Copyman

Select and copy files from one folder to multiple destinations while preserving the folder structure.

## Development

### Requirements

- **Node.js**: Make sure you have Node.js installed (version 21 or higher is recommended).
- **Electron**: Version 34 is used to create the desktop application.

### Installation

```bash
npm install
```

### Running the Application

Launch the Electron application in development mode by executing:

```bash
npm start
```

or, to activate Developer Tools:
```bash
npm run dev
```
that adds `--inDebug` argument to electron launch script.

### Build the Application

Build the application into an executable for each platform:

```bash
npm build:win
```
```bash
npm build:mac
```
```bash
npm build:linux
```

## Usage

You need to choose a *Source* folder and at least one *Destination* folder.  
Use the *Clear* buttons to remove the folder selections.

Within the *tree view*, you can *select* the items to copy (whether files or folders) using checkboxes.

You can navigate within the tree by *expanding* or *collapsing* branches.  
You can also use the two buttons for *Expand or Collapse All*.

To assist with selection, you can use the *Filters*.
- By clicking the *Set Selection* button, it selects the items that contain the specified string while deselecting the others.
- By clicking the *Add to Selection* button, it adds the items that match, without altering the others.
- By clicking the *Remove from Selection* button, it removes any selected items that match from the selection.
- In the *Filters List* you can see all filters applyed and remove individual filters.
- Using the *Clear Filter and Selection* button, it removes the filters.  

Additionally, you can use the two buttons for *Select or Deselect All*.

There are options that affects copying and selecting behaviours.
- *Propagate* to choose if propagate selection/deselection of an item to parent and childen elements.
- *Overwrite* to choose if overwrite or not files that already exist.

With the *Copy Selected Items* button, the files are copied from the Source to the Destinations.

***Pay attention:*** Copy mode is strict on selection: only and exclusively the selected items will be copied. For example, if a folder is selected but only some of the files inside it are selected, only those will be copied.





