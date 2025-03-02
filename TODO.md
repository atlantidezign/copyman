# TODO

## NOW
sys: test new refractored codebase, especially filters

options: in overwrite options, add "keep" that adds unique suffix to file to be copied over an existing one. (just for files, not folders)

--- 

## NEXT
ui: button to abort copy (clicks remain active; be careful if clicking elsewhere, be careful with toggleSpinner)

copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progres?, for each single file
      and better verbose and progress in case of small files
copy: before starting, using selectedNodes and scans of destinations, perform various checks on what will actually perform copy/overwrite/skip, etc.
      and use a window instead of confirm to show it to the user.
      with an option eg. showPreview. with check for free space on destinations
copy: tasks queue

---

## LATE
settings: support localization for other languages (in options), for labels and datepicker (language and format); 
          and add to snapshots
          check also all menu items (contextual, tray, main)

electron: add more properties for Electron in package.json
electron: splash with logo?
electron: leaner build, better integrated build parameters
electron: notifications? (possibly also for update checking via my URL)
          create a dedicated modal for listing/reading and add a spinning icon

ui: more compact, eg. lower vertical padding, collapsable folders/filters panels
ui: in floating windows?
ui: better tree view, with multiple columns for source (like mac) and/or even show the destinations?
    if show destinations: create a tree for the various destinations as well, in split screen with tabs; 
    then, when you open a source branch, open the same branch in the destination/s automatically.
ui: change order of destination folders

sys: rewrite all in TypeScript
sys: extensive testing

ext: add the exe files for other platforms to download, website and git
ext: better Google Copyman account and GitHub profile

---

## NEVER?
electron: signed build (requires a paid certificate)
electron: check update (requires the above and third-party services)

sys: also delete and move selected files (complex if folders are empty/contain other items/partial selections, etc.) and to open single file.
sys: progress during verbose copy is slower due to empty promises to update ui, if possible refactor various awaits flow to keep ui updated smoothly (if delay is <200 ms the ui does not update correctly)

---