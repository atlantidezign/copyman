# TODO

## NOW
filters: on diffs-> select different (set, addictive, subtractive), select non different (set, addictive, subtractive) if tree & diff active (otherwise asks: activate tree and diffs?). rearrange ui

ext: update screenshot

---

## NEXT
ui: color skins/variants

options: custom suffix for keep existing (unique or (#INCREMENTAL)) - in copy options + handle;
options: custom filename radix for zip archive - in zip options + handle;

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
ui: all separated panels using floating windows?
ui: better text wrap on trees.

sys: remove Live reload for production build
sys: extensive testing, especially date/size filters and copymodes.


