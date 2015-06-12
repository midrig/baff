# Baff

Baff is an enterprise grade, integrated software framework that makes light work of business application 
development by hiding technical complexity so that efforts are focused on delivering consistent business 
functionality according to standard functional design patterns.

Baff is based on a modern software stack to deliver a rich, responsive user interface to web browsers
and mobile devices using HTML5 (based on Sencha Ext) and enterprise grade services (based on Spring Framework)

Because it is so quick to develop an end-to-end working solution, in the order of an hour or two for an
activity based on one of the standard patterns, it is well suited for agile development as well as rapid 
prototyping early in the delivery life-cycle, with the further advantage that the prototype can be extended 
to develop the production solution.

## Key Features

### Functional

+ Supports standard functional design patterns for viewing and editing business data entities
+ Business actvities and associated views can be organised in tab view, dashboard and/or tree view structures
+ Workflows can guide the user through each activity step by step
+ Lists of information can be sorted and filtered based on search criteria
+ Integrated entity (field, cross field, and integrity) and operation feasibility validation 
+ Version control and optimistic locking strategy applied at a master entity level
+ Reference data to support picklists and other display decoding as well as business parameters
+ User access control based on roles aligned to application functions
+ Support for internationalization, including unicode based display text formatting 

### Technical

+ User interface built on Sencha ExtJS/Touch, a rich, customizable, multi-channel HTML5 MVC framework.
+ Services built on Java Spring Framework that also provides extensive support for security, integration, etc.  
+ Client/server integration via HTTP, with JSON used to describe value objects across all layers.
+ Separation of domain objects responsible for entity integrity and services responsible for activity operations. 
+ Data is retrieved in batches to avoid delays when handling large lists.
+ Client side data caching and refresh strategy fully supports version control and optimistic locking.
+ Integrated role based user authentication and access control via credentials from an external source.
+ Filters for capturing business/security audit and application performance information.

## Getting Started

Read the guides, review the example "Evaluator" application and install the software.  For more details visit
http://www.midrig.com/baff.

[Framework Overview](https://github.com/midrig/baff/docs/guides/framework/README.md): An overview of the Baff 
framework.

[Application Architecture](https://github.com/midrig/baff/docs/guides/app_arch/README.md):  The application architecture 
and associated design patterns.

[Entities and Activities](https://github.com/midrig/baff/docs/guides/entity_activity/README.md): How the application 
supports the domain model, including version control.

[User Interface](https://github.com/midrig/baff/docs/guides/user_interface/README.md): The framework's look and feel,
including support for tab views, dashboards and tree views.

[Installation and Setup](https://github.com/midrig/baff/docs/guides/installation_setup/README.md): The basic steps to 
install and setup a Baff based application.

[Development Method](https://github.com/midrig/baff/docs/guides/method/README.md): The basic steps to build a Baff 
based application.
                