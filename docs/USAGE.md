### Folders
You need to choose a **Source** folder and at least one **Destination** folder.  
Use the **Clear** buttons to remove the folder selections.

You can also **Refresh Source Folder Tree**.

In Destination folders list, you can *drag* elements (badges) over each other to change order.


---

### Selection
Within the **tree view**, you can **select** the items to copy (whether files or folders) using checkboxes (you can also click on names).

You can navigate within the tree by **expanding** or **collapsing** branches.  
You can also use the two buttons for **Expand or Collapse All**.

To select/unselect all items you can use the two buttons **Select All** and **Deselect All**.

You can also choose the **Sort order** of the tree. Possible values are:
- Alphabetical ASC
- Alphabetical DESC
- Size ASC
- Size DESC
- Date ASC
- Date DESC
- Type ASC
- Type DESC


---

### Filters
To assist with **selection**, you can use the **Filters**.
There are filters for file and folder **Name**, file and folder **Date** and file **Size**.

For each group, we have **Addictive** (+) filters, and **Subtractive** (-) filters.
**Addictive Filters** of each group are in **OR** condition. Eg. with 2 different strings for Addictives Name Filters, will be selected every item matches string1 or string2.
A **Substractive Filter** removes from selection every item matches, as a **NOT** condition.

**Relationship** between Addictive filters of different groups can be an **OR** or **AND** condition, according to options.
*OR* means that item is selected if **at least one** of the group conditions matches, *AND* means that **all** conditions must match.

#### Name Filter
Accepts text string as input, as file/folder name substring.
- By clicking the **Set Name Filter** button, it selects the items that contain the specified string while deselecting the others.
- By clicking the **Add Addictive Name Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Name Filter** button, it removes any selected item that matches with the string.
- In the **Name Filters List** you can see all Name filters applyed and remove individual filters.
- Using the **Clear Name Filters** button, it removes the Name filters.

#### Date Filter
Accepts one or two dates as input, as file/folder date container range. If one date is null, it will be threaded as -infinity (start) or  +infinity (end).
- By clicking the **Set Date Filter** button, it selects the items with date inside the range while deselecting the others.
- By clicking the **Add Addictive Date Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Date Filter** button, it removes any selected item that matches with the date range.
- In the **Date Filters List** you can see all Date filters applyed and remove individual filters.
- Using the **Clear Date Filters** button, it removes the Date filters.

#### Size Filter
Accepts one or two numbers (expressed in Kb) as input, as file/folder size container range. If one number is null, it will be threaded as 0 (start) or  1.000.000.000 (end).
- By clicking the **Set Size Filter** button, it selects the items with size inside the range while deselecting the others.
- By clicking the **Add Addictive Size Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Size Filter** button, it removes any selected item that matches with the size range.
- In the **Size Filters List** you can see all Size filters applyed and remove individual filters.
- Using the **Clear Size Filters** button, it removes the Size filters.


---

### Actions
There is a panel with action buttons:
- **Swap** swaps Source and (first) Destination folders.
- **Selection List** Open Selection List panel.
- **Snapshots** Open Snapshots panel.
- **Options** Open Options panel.
- **Help** Open Help panel.


---

### Options
The **Options** panel affects copying and selecting behaviours.
Has an autosave behaviour, and can be **Reset** to defaults. 

#### Copying
- **Verbose Progress** to choose if have a window with verborse progress during copying phase. Default false.
- **Copying Report** to choose if have a window with report at the end of the copying phase. Default true.
- **Abort Queue** to choose if the *Abort Copying* command affects full Queue or just current Queue Item. Default true.
- **Don't Confirm Queue Steps** to choose if confirm or not every Queue Step start copying. Default false.
- **Overwrite Existing** to choose the overwrite mode if a file/folder already exist. Default Always.
It can be: 
  - *Always* Always Overwrite;
  - *Never* Never Overwrite; 
  - *If Different Size* Overwrite if Different Size;
  - *If Newer* Overwrite if Newer; 
  - *Sync1* Clean files in folders with at least a selected file (not folder) inside;
  - *Sync2* Clean files in folders with at least a selected file or folder inside;
  - *Brute* Clean files and folders recursively in folders with at least a selected file or folder inside;
  - *Keep* Keep existing file using a new name for copy.

#### Selecting
- **Propagate Selection** to choose if propagate (checked) or not (unchecked) the selection/deselection click of an item to parent and childen elements. Default true.
- **Click on Names to Select**  to choose if also clicks on files/folders names can Select/Deselect the item. Default true.

#### Filtering
- **Relationship OR** to choose the kind of relationship between filter groups, OR (checked) or AND (unchecked). Default true (OR).

#### System
- **Maintain Logs** to choose if to record application logs in memory. Can be exported to file with **Export Logs** button, and cleaned with **Clear Logs** button. Default false.
- **Split Screen** to add a tree view also for first Desination folder (remember: you can change order of destinations folders, and set what's the first one, by dragging the badges in the Destination Folders List). Default false.

---

### Automation: Snapshots and Queue
The **Snapshot** panel provides useful tools for automation: you can save and reload snapshots of frequently used tasks, eliminating the need to make selections each time – simply load and execute.
A snapshot includes the current configuration of folders, filters, options, and the selection list.
In this panel, you can manage saving, loading, clearing, and exporting snapshots.
- **Save Shapshot** to save current snapshot, with a name.
- **Export Shapshot** to export current snapshot to a json file, with a name.
- **Load Shapshot** to load saved snapshot by selected name.
- **Clear Shapshot** to remove saved snapshot by selected name.
- **Import Shapshot** to import snapshot from json file.
- **Clear All Shapshots** to remove all saved snapshots.

Snapshots can be **Queued** as tasks to be executed in succession.
- You can choose snapshots to *Add*.
- You can move **Up** and **Down** and **Delete** items in the queue list.
- You can **Execute** a queue.


---

### Selection List
In the **Selection List** panel you'll find a table list of the selected items.
Trough **Export JSON** or **Export CSV** button you can export the list in your preferred format.


---

### Copying
With the **Copy Selected Items** button, the files are copied from the Source to the Destinations.

**Pay attention:** Copy mode is **strict** on selection:
only and exclusively the selected items will be copied.
For example, if a folder is selected but only some of the files inside it are selected, only those will be copied.

With **Preview** switch you can enable/disable *Preview Mode*: Copying is not performed, but the report is generated.


---

### Menus
Trough the **contextual menu** (right click) you have shortcuts to the main features of the application.

The **main menu** contains classical *View* actions, for  **Reload**, **Zoom** levels, **Full Screen** and **Minimize** switches; 
it also contains the *Help* submenu, with links to **About** panel, to **Instructions** panel, to **Copyman Website** and to **Atlantide Design Website**.

There is also the **tray** icon and its minimal menu, with **Quit** button.