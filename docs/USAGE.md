### Folders
You need to choose a **Source** folder and at least one **Destination** folder.  
Use the corresponding **Clear** buttons to remove the folder selections.

You can also **Refresh Source Folder Tree**.

In Destination folders list, you can *drag* elements (badges) over each other to rearrange order.


---

### Tree and Selection
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

In **tree view**, if the **Split Screen** option is enabled, the view is divided into two adjustable columns:
- On the left side, we display the **Source Folder** Tree.
- On the right side, we display the First **Destination Folder** Tree.

The Destination tree is *aligned* with the Source tree. This means that for any item in the Source tree, if an item with same relative path exists also on the Destination Tree:
- If the checkbox is selected or deselected, the corresponding checkbox in the Destination tree matches that state.
- If a folder in the Source tree is expanded or collapsed, the corresponding folder in the Destination tree is also expanded or collapsed, respectively.


---

### Copying
With the **Copy Selected Items** button, the files are copied from the Source to the Destinations.

**Pay attention:** Copy process is **strict** on selection:
only and exclusively the selected items will be copied.
For example, if a folder is selected but only some of the files inside it are selected, only those will be copied.

In **Options** panel you can choose between different **Copy modes**

With **Preview** switch you can enable/disable *Preview Mode*: Copying is not performed, but the report is generated.


---

### Filters
To assist with **selection**, you can use the **Filters**.
There are filters for file and folder **Name**, file and folder **Date** and file **Size**.

For each group, we have **Addictive** (+) filters, and **Subtractive** (-) filters.
**Addictive Filters** of each group are in **OR** condition. Eg: with 2 different strings for Addictives Name Filters, will be selected every item matches string1 or string2.
A **Substractive Filter** removes from selection every item matches, as a **NOT** condition.

**Relationship** between Addictive filters of different groups can be an **OR** or **AND** condition, according to options.
*OR* means that item is selected if **at least one** of the group conditions matches, *AND* means that **all** conditions must match.

#### Name Filters
Accepts text string as input, as file/folder name substring.
- By clicking the **Set Name Filter** button, it selects the items that contain the specified string while deselecting the others.
- By clicking the **Add Addictive Name Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Name Filter** button, it removes any selected item that matches with the string.
- In the **Name Filters List** you can see all Name filters applyed and remove individual filters.
- Using the **Clear Name Filters** button, it removes the Name filters.

#### Date Filters
Accepts one or two dates as input, as file/folder date container range. If one date is null, it will be threaded as -infinity (start) or  +infinity (end).
- By clicking the **Set Date Filter** button, it selects the items with date inside the range while deselecting the others.
- By clicking the **Add Addictive Date Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Date Filter** button, it removes any selected item that matches with the date range.
- In the **Date Filters List** you can see all Date filters applyed and remove individual filters.
- Using the **Clear Date Filters** button, it removes the Date filters.

#### Size Filters
Accepts one or two numbers (expressed in Kb) as input, as file/folder size container range. If one number is null, it will be threaded as 0 (start) or  1.000.000.000 (end).
- By clicking the **Set Size Filter** button, it selects the items with size inside the range while deselecting the others.
- By clicking the **Add Addictive Size Filter** button, it adds the items that match, without altering the others.
- By clicking the **Add Subtractive Size Filter** button, it removes any selected item that matches with the size range.
- In the **Size Filters List** you can see all Size filters applyed and remove individual filters.
- Using the **Clear Size Filters** button, it removes the Size filters.


---

### Actions
Within the application, there's a dedicated area featuring action buttons:
- **Swap** swaps Source and First Destination folder.
- **Selection List** Open Selection List panel.
- **Automation** Open Tasks and Queue panel.
- **Options** Open Options panel.
- **Help** Open Help panel.


---

### Selection List
In the **Selection List** panel you'll find a table list of the selected items.
Trough **Export JSON** or **Export CSV** button you can export the list in your preferred format.


---

### Automation: Tasks and Queue
The **Automation** panel provides useful tools for automation: you can save and reload snapshots of frequently used tasks, eliminating the need to make selections each time – simply load and execute.
A Task includes the current configuration of folders, filters, options, and the selection list.
In this panel, you can manage saving, loading, clearing, and exporting Tasks.
- **Save Task** to save current Task, with a name.
- **Export Task** to export current Task to a json file, with a name.
- **Load Task** to load saved Task by selected name.
- **Clear Task** to remove saved Task by selected name.
- **Info Task** to get info on saved Task by selected name.
- **Import Task** to import Task from json file.
- **Clear All Tasks** to remove all saved Tasks.

Tasks can be **Queued** to be executed in succession.
- You can choose Tasks to *Add*.
- You can move **Up** and **Down** and **Delete** items in the queue list.
- You can **Execute** a queue.


---

### Options
The **Options** panel affects copying and selecting behaviours.
Has an autosave behaviour, and can be **Reset** to defaults. 

#### Copying
- **Verbose Progress** to choose if to have a window with verborse progress during copying phase. Default false.
- **Copying Report** to choose if to have a window with report at the end of the copying phase. Default true.
- **Abort Queue** to choose if the *Abort Copying* command affects full Queue or just current Queue Item. Default true.
- **Don't Confirm Queue Steps** to choose if to confirm or not every Queue Step start copying. Default false.
- **Copy Mode** to choose the copying behaviour, eg: overwrite if a file/folder already exist, sync, etc. Default Always Overwrite.
It can be: 
  - *Always Overwrite* Always Overwrite;
  - *Never Overwrite* Never Overwrite; 
  - *Overwrite if Different Size* Overwrite if Different Size;
  - *Overwrite if Newer* Overwrite if Newer; 
  - *Sync1* Clean files in folders with at least a selected file (not folder) inside;
  - *Sync2* Clean files in folders with at least a selected file or folder inside;
  - *Brute* Clean files and folders recursively in folders with at least a selected file or folder inside;
  - *Keep Existing* Keep existing file using a new name for copy.

#### Selecting
- **Propagate Selection** to choose if propagate (checked) or not (unchecked) the selection/deselection click of an item to parent and childen elements. Default true.
- **Click on Names to Select**  to choose if also clicks on files/folders names can Select/Deselect the item. Default true.
- **Filters Relationship OR** to choose the kind of relationship between filter groups, OR (checked) or AND (unchecked). Default true (OR).

#### System
- **Split Screen** to add a tree view also for first Destination folder (remember: you can change order of destinations folders, and set what's the first one, by dragging the badges in the Destination Folders List). Default false.
- **Maintain Logs** to choose if to record application logs in memory. Can be exported to file with **Export Logs** button, and cleaned with **Clear Logs** button. Default false.


---

### Menus
Through the **contextual menu** (right click) you have shortcuts to the main features of the application.

The application **main menu** contains classical *View* actions, for  **Reload**, **Zoom** levels, **Full Screen** and **Minimize** switches; 
it also contains the *Help* submenu, with links to **About** panel, to **Instructions** panel, to **Copyman Website** and to **Atlantide Design Website**.

There is also the **tray** icon and its minimal menu, with **Quit** button.