# TODO

## NOW
snapshots: info window for the shapshots to load

queue: multiple queues with load/save/export/import for singles and for all.

ui: better text wrap on trees

--- 

## NEXT
copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progress?, for each single file
      and better verbose and progress in case of small files
copy: new copy mode -> if selected something only on leaf or descending trees (ignoring when folder selection is just to reach the leaf path - no other selection in the descending ones) it syncs just starting from that ones
copy: new feature 'copy to zip archive' -> not copy single files/folder, but produce a zip archive to be moved to destinations, 
      and a descriptor txt/json with list of files/dates that can be used for searching/history

---

## LATE
settings: support localization for other languages (in options), for labels and datepicker (language and format); 
          and add to snapshots
          check also all menu items (contextual, tray, main)

electron: leaner build, better integrated build parameters and properties for Electron in package.json
electron: splash with logo?

ui: alerts and confirms not using native dialogs but using html modals.
ui: collapsable folders and filters panels or all separated panels using floating windows?

sys: extensive testing, especially date/size filters and copymodes

ext: better Google Copyman account and GitHub profile
ext: in website add robots.txt and better SEO (and add to Google search)

---

## NEVER?
sys: rewrite all in TypeScript?

electron: signed build for win and mac (requires a paid  for win, for mac?) 
electron: native check and update (requires the above and third-party services)
electron: notifications? create a dedicated modal for listing/reading and add a spinning icon (needed?)

sys: also delete and move selected files (complex if folders are empty/contain other items/partial selections, etc.) and to open single file, open in explorer.
sys: progress during verbose copy is slower due to empty promises to update ui, if possible refactor various awaits flow to keep ui updated smoothly (if delay is <200 ms the ui does not update correctly)

---