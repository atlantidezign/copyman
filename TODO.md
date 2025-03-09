# TODO

## NOW
snapshots: info window for the shapshots to load

ui: better tree view, with split screen (as an option) for source and destination #1;
then, when you open a source branch, open the same branch in the destination/s automatically.
- render> done : App.treeManager.renderDestinationTree()
- render> update: ok 2nd tree on choose first dest, ok load snapshot with first dest, ok swap dests with change of first, ok clear destinations, ok remove single dest, ok options splitscreen change
- update> to do: App.treeManager.alignDestinationTree()
- update> to update:  on expand/collapse/select in the first tree, expand/collapse all

--- 

## NEXT
queue: multiple queues with load/save/export/import for singles and for all.

copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progress?, for each single file
      and better verbose and progress in case of small files
copy: new copy mode -> if selected something only on leaf or descending trees (ignoring when folder selection is just to reach the leaf path - no other selection in the descending ones) it syncs just starting from that ones
copy: new feature copy to archive -> not copy single files/folder, but produce a zip archive to be moved to destinations, and a descriptor txt/json with list of files/dates that can be used for searching/history

---

## LATE
settings: support localization for other languages (in options), for labels and datepicker (language and format); 
          and add to snapshots
          check also all menu items (contextual, tray, main)

electron: leaner build, better integrated build parameters and properties for Electron in package.json
electron: splash with logo?
electron: notifications? create a dedicated modal for listing/reading and add a spinning icon

ui: alerts and confirms not using native dialogs but using html modals.
ui: collapsable folders/filters panels or all separated panels using floating windows?

sys: rewrite all in TypeScript
sys: extensive testing, especially date/size filters and copymodes

ext: better Google Copyman account and GitHub profile
ext: in website add robots.txt and better SEO (and add to Google search)

---

## NEVER?
electron: signed build for win and mac (requires a paid  for win, for mac?) 
electron: check update (requires the above and third-party services)

sys: also delete and move selected files (complex if folders are empty/contain other items/partial selections, etc.) and to open single file, open in explorer.
sys: progress during verbose copy is slower due to empty promises to update ui, if possible refactor various awaits flow to keep ui updated smoothly (if delay is <200 ms the ui does not update correctly)

---