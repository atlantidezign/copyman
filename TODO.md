# TODO

## NOW
ui: confirm on saving snapshot with a check if it already exists

copy: overwrite if newer

test: thoroughly test, especially filters and progress with small files

## NEXT
ui: more compact
ui: in floating windows

ui: button to abort copy (clicks remain active; be careful if clicking elsewhere, be careful with toggleSpinner)

copy: before starting, perform various checks on what will actually perform copy/overwrite etc. and use a window instead of confirm.
copy: in verbose mode, include info on file sizes and time for each file

tree: setting sort => alphabetical order, date, size, file type (tree view)  (add to snapshots)

## LATE
electron: splash with logo?
electron: improve menu items (contextual, tray, main)
electron: leaner build, better integrated build parameters
electron: notifications? (possibly also for update checking via my URL)
          create a dedicated modal for listing/reading and add a spinning icon

settings: support localization for other languages (optional choice) and a datepicker (language and format) also in snapshots

ui: better tree view, with multiple columns (like mac) and/or even show the destinations?
ui: create a tree for the various destinations as well, in split screen with tabs; 
    when you open a source branch, open the same branch in the destination automatically

sys: progress during copy is slow due to empty promises, refactor various awaits
sys: redo in TypeScript

ext: on the website, add the exe files for other platforms to download
ext: better Google Copyman account and GitHub profile

## NEVER!
electron: signed build (requires a paid certificate)
electron: check update (requires the above and third-party services)

sys: delete and move selected files (too complicated if folders are empty/contain other items, etc)