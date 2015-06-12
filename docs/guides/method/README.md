# Development Method

## High Level Development Method

The following steps are involved in developing a web application using Baff.  The steps for a mobile client are very 
similar and the server side components identical.

This assumes that baff has been included in the application as per the instructions that can be found in the baff-web
and baff-serv package "Readme.md" documents.

Refer to the example "Evaluator" application for more details and typical setup. 

### Create the Application

Create the application framework as follows:

+  Modify Application.js to specify `Baff.utility.application.MainApplicationController` as the controller
+  Specify global properties in your `Ext.app.Application` class (define in Application.js) and `Baff.utility.Globals`
+  Extend `Baff.app.view.DomainView` to create a main view with alias `mainnavigationview` that specifies a set of 
underlying domain views - create these too
+  Extend `Baff.app.controller.DomainController` to create controllers for the domain views and specify any related workflows
+  Extend `com.midrig.baff.app.service.BusinessService` to create a service to support domain
 operations
+  Extend `com.midrig.baff.app.controller.ServiceController` to create controller(s) to handle requests
to the service

### Create Activities

Create individual activities as follows:

+  Extend `com.midrig.baff.app.entity.MappedBusinessEntity` to create a domain object with required
 fields and validation
+  Extend `org.springframework.data.jpa.repository.JpaRepository` to create a data access object for 
the entity
+  Create a database table to persist the related business entity
+  Create methods in the service to call the superclass and perform operation specific processing 
and validation
+  Create methods in the service controller to handle requests to the service
+  Extend `Baff.app.model.EntityModel` to create a model for the entity, with required fields and 
validation
+  Extend `Baff.app.model.EntityStore` to create a client side store and a service proxy for the model
+  Extend `Baff.app.view.SelectorView`, `Baff.app.view.FormView` or `Baff.app.view.ListFormView` to create 
the activity view
+  Extend `Baff.app.view.FormPanel` to create a form for the view, if required
+  Extend `Baff.app.view.ListPanel` and `Baff.app.view.FilterPanel` to create a list and search panel for 
the view if required
+  Extend `Baff.app.controller.SelectorController`, `Baff.app.controller.FormController` or 
`Baff.app.controller.ListFormController` to create a controller to manage client operations
+  Add any related reference data classes to the reference data database


## Key Customisation Points

The following are key customisation points for implementing specific functionality.  Please refer to the API
documentation for more details and for general configuration options.   

**NOTE:** When overriding superclass functions consider if these should be invoked (e.g. via  `callParent`) in 
order to perform common processing, which in some cases will be required. Whilst the framework intends to be 
reasonably flexible in allowing many superclass functions be overridden, take care if modifying core control logic
as this may lead to unexpected behaviour.   

###  `Baff.app.view.DomainController`

+ Entity and context change events bubble down through the domain view hierarchy by default, however if you
need to pass context across domain views at the same level in the hierarchy you should listen for these events 
(override `init` to set this up) handle them in a controller further up the hierarchy and have it pass them across. 
+ Workflows will be visible to anyone with the roles specified in the workflow configuration.  If custom logic is 
required to determine when workflows should be visible, e.g. if this is data dependent then override `isWorkflowVisible` 
to define these.

### `Baff.app.model.EntityModel`

+ Specifiy the various `fields` and `validators`, as well as the `proxy` and associate api urls,  Values for transient fields 
can be determined using the `calculate` configuration.
+ Override `doIntegrityValidation` to perform any entity specific validation

### `Baff.app.view.ActivityView` and sub classes

+ Override `setupDockedItems` to add any additional buttons to the toolbar.
+ Override `setupItems` to add any additional items to the view or change the order in which items appear

### `Baff.app.view.ListPanel`

+ Override `initComponent` to add any additional buttons to the list toolbar.

### `Baff.app.controller.ActivityController` and sub classes

+ Override `onEntityChange` to define logic based on other activities changing their selected entity
+ Override `changeContext` to perform custom context handling logic and to determine if context is set. 
+ Override `setupAccessControl` if any custom, e.g. data dependent access control logic is required beyond the
role based access control provided by default.
+ Override `prepareActivity` to setup the activity, e.g. set additional request parameters prior to store data load
+ Override `prepareView` to setup the view prior to displaying any related entity record
+ Add any required widget event handlers for activity specific widgets, e.g. to handle a button tap or combo box
change.
+ Override `doFeasibilityValidation` to perform any general validation (beyond that defined in the entity model) on
saving or removing an entity.
+ Override `prepareRecord` to setup the entity record prior to sending it to a service, e.g. to add additional request 
parameters.

### `com.midrig.baff.app.entity.MappedBusinessEntity`

+ Add any required `@NamedQueries` and include the associated method in the associated 
`org.springframework.data.jpa.repository.JpaRepository`.
+ Specify the various fields using Java classes instead of primitive types
+ Override `addJson` and `fromJson` to support required serialiazation and de-serialization (latter may not be
required for read-only entities).
+ Override `doIntegrityValidation` to define entity specific validation rules.
+ Override `createWhereClause` to support complex query logic.

### `com.midrig.baff.app.service.BusinessService`

+ In general service operations should be handed off to `findEntity`, `findPageOfEntities`, `saveEntity` or `removeEntity`
as required; otherwise define your own custom operation handling logic. 
+ As the various overridden methods in the service are common for any request, these may typically identify the 
operation being performed or the entity type being acted on in order to call an operation/entity specific sub-function.  
For example:  `if (entity instanceof myEntity) { // call my entity specific operation }`
+ Override `processRetrievedEntities` to perform custom post retrieval processing, e.g. to calculate transient field values
for display purposes.
+ Override `validateFeasibility` to perform operation specific validation, e.g cross entity validation or other feasibility
validation (entity specific validation should be defined in the `com.midrig.baff.app.entity.MappedBusinessEntity`).
+ Override `doBusinessOperations` to perform general operation specific processing, e.g. to manage relationship
dependencies across entity types or generate confirmation messages
+ Add any display messages retrieved via the `com.midrig.baff.utility.locale.MessageHelper` to `messages.properties`

### `com.midrig.baff.app.controller.ServiceController` 

+ Handle the various client requests and responses, typically by marshalling request parameters into a 
`com.midrig.baff.app.service.ServiceRequest`.
