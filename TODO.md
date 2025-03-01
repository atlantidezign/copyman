# TODO

## NOW
sys: rewrite all in TypeScript

## NEXT
copy: overwrite option splitted to 4 cases: alyays / if newer / if bigger / never

tree: setting sort => alphabetical order, date, size, file type (tree view)  (add to snapshots)

ui: button to abort copy (clicks remain active; be careful if clicking elsewhere, be careful with toggleSpinner)
ui: more compact

## LATE
copy: in verbose mode, using selectedNodes, include info on file sizes, and time?, for each file
copy: before starting, using selectedNodes and scans of destinations, perform various checks on what will actually perform copy/overwrite/skip, etc. and use a window instead of confirm to show it to the user.
with an option eg. showPreview

electron: splash with logo?
electron: improve menu items (contextual, tray, main)
electron: leaner build, better integrated build parameters
electron: notifications? (possibly also for update checking via my URL)
          create a dedicated modal for listing/reading and add a spinning icon

settings: support localization for other languages (in options), for labels and datepicker (language and format); and add to snapshots
test: thoroughly test, especially filters and progress with small files

ui: in floating windows
ui: better tree view, with multiple columns for source (like mac) and/or even show the destinations?
    if show destinations: create a tree for the various destinations as well, in split screen with tabs; 
    then, when you open a source branch, open the same branch in the destination/s automatically.

ext: add the exe files for other platforms to download, website and git
ext: better Google Copyman account and GitHub profile

## NEVER?
electron: signed build (requires a paid certificate)
electron: check update (requires the above and third-party services)

sys: also delete and move selected files (too complex if folders are empty/contain other items/partial selections, etc.)
sys: progress during verbose copy is slower due to empty promises to update ui, if possible refactor various awaits flow to keep ui updated smoothly (if delay is <200 ms the ui does not update correctly)
