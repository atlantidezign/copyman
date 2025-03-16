# TODO

## NOW
ui: if diffs active, also clicks on destination tree for open/close aligns open/close on source tree

options: App.model.msCopySpeed (default 50000 = 50 MB/s) , App.model.zipAlreadyCompressed (default false) in sys options
options: custom suffix for keep existing (unique or (#INCREMENTAL)), custom filename for zip archive in sys options

site: in features add "diffs", ...

---

## NEXT
ui: color skins/variants

options: review defaults, in model and index.html first draw (eg: split & diff default true)

---

## THEN
copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progress?, for each single file,
      and better verbose and progress in case of small files.
copy: new copy mode -> if selected something only on leaf or descending trees,
      (ignoring when folder selection is just to reach the leaf path - no other selection in the descending ones) it syncs just starting from that ones,

queue: multiple queues with load/save/export/import for singles and for all.

settings: support localization for other languages (in options), for labels and datepicker (language and format),
          and add to snapshots,
          check also all menu items (contextual, tray, main).

ui: alerts and confirms not using native dialogs but using html modals.
ui: collapsable folders and filters panels or all separated panels using floating windows?
ui: better text wrap on trees.

sys: remove Live reload for production build
sys: extensive testing, especially date/size filters and copymodes.


