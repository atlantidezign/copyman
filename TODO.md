# TODO

## NOW
test: new refactored codebase, especially date/size filters

copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progress?, for each single file
      and better verbose and progress in case of small files
copy: before starting, using selectedNodes and scans of destinations, perform various checks on what will actually perform copy/overwrite/skip, etc.
      and use a window instead of confirm to show it to the user.
      with an option eg: showPreview. with check for free space on destinations
copy: new mode: if selected something only on leaf or descending trees (ignoring when folder selection is just to reach the leaf path - no other selection in the descending ones) it syncs just starting from that ones

--- 

## NEXT
queue: multiple queues with load/save/export/import for singles and for all.

snapshots: preview

electron: leaner build, better integrated build parameters and properties for Electron in package.json

---

## LATE
settings: support localization for other languages (in options), for labels and datepicker (language and format); 
          and add to snapshots
          check also all menu items (contextual, tray, main)

electron: splash with logo?
electron: notifications? (possibly also for update checking via my URL)
          create a dedicated modal for listing/reading and add a spinning icon

ui: alerts and confirms not using native dialogs but using html modals.
ui: collapsable folders/filters panels or all separated panels using floating windows?
ui: better tree view, with multiple columns for source (like mac) and/or even show the destinations?
    if show destinations: create a tree for the various destinations as well, in split screen with tabs; 
    then, when you open a source branch, open the same branch in the destination/s automatically.

sys: rewrite all in TypeScript
sys: extensive testing

ext: better Google Copyman account and GitHub profile
ext: in website add robots.txt and better SEO (and add to Google search)

copy: not copy single files/folder, but produce zip archive to be moved to destinations, and a descriptor txt/json widh list of files/dates that can be used for searching/history


---

## NEVER?
electron: signed build for win and mac (requires a paid  for win, for mac?) 
electron: check update (requires the above and third-party services)

sys: also delete and move selected files (complex if folders are empty/contain other items/partial selections, etc.) and to open single file, open in explorer.
sys: progress during verbose copy is slower due to empty promises to update ui, if possible refactor various awaits flow to keep ui updated smoothly (if delay is <200 ms the ui does not update correctly)

---