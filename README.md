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

### Binaries Download
You can download already compiled executables from:

http://www.atlantide-design.it/copyman

## Usage

### Folders
You need to choose a *Source* folder and at least one *Destination* folder.  
Use the *Clear* buttons to remove the folder selections.

### Selection
Within the *tree view*, you can *select* the items to copy (whether files or folders) using checkboxes.

You can navigate within the tree by *expanding* or *collapsing* branches.  
You can also use the two buttons for *Expand or Collapse All*.

To select/unselect all items you can use the two buttons *Select All* and *Deselect All*.

### Filters
To assist with *selection*, you can use the *Filters*.
There are filters for file and folder *Name*, file and folder *Date* and file *Size*.

For each group, we have *Addictive* (+) filters, and *Subtractive* (-) filters.
*Addictive Filters* of each group are in *OR* condition. Eg. with 2 different strings for Addictives Name Filters, will be selected every item matches string1 or string2.
A *Substractive Filter* removes from selection every item matches, as a *NOT* condition.

*Relationship* between Addictive filters of different groups can be an *OR* or *AND* condition, according to options.
OR means that item is selected if *at least one* of the group conditions matches, AND means that *all* conditions must match.

#### Name
Accepts text string as input, as file/folder name substring.
- By clicking the *Set Name Filter* button, it selects the items that contain the specified string while deselecting the others.
- By clicking the *Add Addictive Name Filter* button, it adds the items that match, without altering the others.
- By clicking the *Add Subtractive Name Filter* button, it removes any selected item that matches with the string.
- In the *Name Filters List* you can see all Name filters applyed and remove individual filters.
- Using the *Clear Name Filters* button, it removes the Name filters.  

#### Date
- TBD

#### Size
- TBD

### Options
The *options* panel affects copying and selecting behaviours.

#### Copying
- *Overwrite existing* to choose if overwrite (checked) or not (unchecked) files that already exist.

#### Selecting
- *Propagate Selection* to choose if propagate (checked) or not (unchecked) the selection/deselection click of an item to parent and childen elements.
- *Relationship OR* to choose the kind of relationship between filter groups, OR (checked) or AND (unchecked).

### Copying
With the *Copy Selected Items* button, the files are copied from the Source to the Destinations.

**Pay attention:** Copy mode is strict on selection: only and exclusively the selected items will be copied. For example, if a folder is selected but only some of the files inside it are selected, only those will be copied.

### Menus
Trough the *contextual menu* (right click) you have shortcuts to the main features of the application.

The *main menu* contains generic actions, and the help.

There is also the *tray* icon and its minimal menu.



