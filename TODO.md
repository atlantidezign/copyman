# TODO

## NOW
ext: update screenshot

diffs: check propagation of diff classes/props on tree and it's rendering

sys: check update on startup, with option if do or not

---

## NEXT
options: custom suffix for keep existing (unique or (#INCREMENTAL)) - in copy options + handle;
options: custom filename radix for zip archive - in zip options + handle;

sys: extensive testing, especially date/size/diffs filters and copy modes.

---

## THEN
copy: in verbose mode, using selectedNodes, include info on file sizes/date, and elapsed, and progress?, for each single file,
      and better verbose and progress in case of small files.
copy: new copy mode -> if selected something only on leaf or descending trees,
      (ignoring when folder selection is just to reach the leaf path - no other selection in the descending ones) it syncs just starting from that ones,

queue: multiple queues with load/save/export/import for singles and for all.

settings: support localization for other languages (in options), for labels and datepicker (language and format),
          and add to snapshots,
          check also all menu items (contextual, tray, main). (todo)

ui: alerts and confirms not using native dialogs but using html modals.
ui: better text wrap on trees.
ui: add more skins (todo)

sys: set guiActive false for production build (todo)
sys: remove Live reload for production build (todo)



