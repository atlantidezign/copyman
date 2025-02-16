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

### Build the Application

Build the application into an executable for each platform:

```bash
npm build:win
```
```bash
npm build:mac
```

## Usage

You need to choose a *Source* folder and at least one *Destination* folder.  
Use the *Clear* buttons to remove the folder selections.

Within the *tree view*, you can *select* the items to copy (whether files or folders) using checkboxes.

You can navigate within the tree by *expanding* or *collapsing* branches.  
You can also use the two buttons for *Expand or Collapse All*.

To assist with selection, you can use the *Filters*.
- By clicking the *Set* button, it selects the items that contain the specified string while deselecting the others.
- By clicking the *Add* button, it adds the items that match, without altering the others.
- By clicking the *Remove* button, it removes any selected items that match from the selection.
- Using the *Clear* button, it removes the filter.  
  Additionally, you can use the two buttons for *Select or Deselect All*.

There are some options that affects copying and selecting behaviours.
- *Overwrite* to choose if overwrite or not files that already exist.

With the *Copy Selected Items* button, the files are copied from the Source to the Destinations.



