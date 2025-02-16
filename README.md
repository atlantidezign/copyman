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



### TODO
#### NOW
user: save/load/clean user settings (overwrite + nuovi) + save/clean source and destinations selected + save/clean filters

filtri: 
  - sistema a tags plus/minus con 2 array e funzione render (a tags, con rimozione singola) e funzione applicazione
  - cambio sorgente, select all e deselect all toglie filtri
  - data e dimensioni (estensioni non serve fa coi filtri nome) + aggiungere a save/load

comportamento copia:
  - strict: copia solo selezionati e non tutti figli (copia) default
      se una cartella è selezionata ma ha solo alcuni file selezionati, copia solo quelli
 
settings: (aggiungere a opzioni save)
  - child: quando seleziono/deseleziono cartella lo fa anche per tutti i figli (selezione)
  - sort: ordinamento alfabetico, data, dimensioni, tipofile (tree) 

electron: 
  - menu generale mettere bene about
  - build per linux
  - parametro al lancio per inDebug non nel codice

#### LATER
ui: meglio, con modale, progresso copia e report
ui: meglio visualizzazione tree, su piu colonne (tipo mac)
electron: splash con logo?
electron: meglio voci dei menu (contestuale, tray, principale)
settings: localizzazione altre lingue (scelta)
electron: check update e notifiche

