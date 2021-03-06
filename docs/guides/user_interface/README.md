# User Interface

Baff provides a responsive, touch friendly web browser based user interface based on Sencha ExtJS and mobile user
interface based on Sencha Touch.  This guide uses the reference Evaluator application to illustrate the
user interface supported by the framework.

## Application View

The screenshot below illustrates the overall application view, which adopts a tab based user interface, 
with the main navigation tabs, each representing a domain, on the first row and activity tabs for the domains
on the second row. Workflows can be selected to provide navigation assistance and instructions.  The default theme
is based on Neptune Touch (refer to the Ext theme guides for more information).

<img src="app_view.jpg" alt="Application View" width="850x">


## Domain & Activity Views

The screenshot below illustrates a domain view, for the Scorecard domain, where a Scorecard master entity
is selected in the first activity, and the Criteria and Option that it masters are managed in other activity
tabs; the framework automatically passes the master scorecard entity as context to these tabs.  The Scorecard
activity is based on the list-form activity pattern.

<img src="domain_view.jpg" alt="Domain View" width="850x">

A read only summary 'dashlet' for the domain view can be toggled on and off; this will be visible irrespective of 
whichever tab is selected.  It can be docked top, bottom, left or right, as is shown below.  Alternatively a
non modal pop-up can be presented.

<img src="summ_dash.jpg" alt="Dashlet" width="850x">

## Popup Activity Views

Activity views can also be displayed as popup. The screenshot below illustrates a popup activity for creating a 
template from an existing scorecard, based on a form activity pattern. 

<img src="form_popup.jpg" alt="Form Popup" width="850x">

The following screenshot shows a full screen popup used to display a graphical view of option scores.

<img src="fullscreen_popup.jpg" alt="Fullscreen Popup" width="850x">

Finally, a popup selector can be used to provide context, for example, in the screenshot below it is used to select
an Evaluation Group to provide context into the Scorecard domain in a multi-tab view (see below).

<img src="selector_popup.jpg" alt="Selector Popup" width="850x">


## Multi Tab View

Multiple domain views of the same type can be dynamically opened and closed along side one another in order
to view multiple entities simultaneously.

<img src="multi_view.jpg" alt="Multi Tab View" width="850x">


## Dashboard View

Baff supports a dashboard view where read only activities ('dashlets') can be presented to provide a 
summary across various domains / entities, with the framework supporting the sharing master entity and other 
context, as illustrated by the screenshot below.  Here the activities are based on the selector activity pattern; since
they are read only, a toolbar is not displayed.

<img src="dashboard_view.jpg" alt="Dashboard View" width="850x">


## Tree View

Baff supports a tree view where entities can be presented as nodes in a hierarchical organization, as illustrated
below.

<img src="tree_view.jpg" alt="Tree View" width="850x">

The tree view can also be used to select entities to be displayed in a form view presented alongside, where the
form view is dynamically selected based on the entity type, as illustrated below.  

<img src="tree_card.jpg" alt="Tree Card View" width="850x">


## Mobile

The Baff mobile user interface is not as rich as the web user interface, and supports a single set of activity
tabs.  List - Form activities are supported by toggling between the list and form views, as illustrated below.

<img src="mobile.jpg" alt="Mobile UI" width="850x">
