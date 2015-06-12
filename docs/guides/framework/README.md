# Baff Framework

The Baff framework comprises of **Application** foundation classes that may be extended in 
order to build the required functionality, as well as **Utility** classes that provide common 
application services.

The framework may also be demarcated by those classes that are deployed on the **Client**,
supported by Sencha ExtJS and Touch, and those that are deployed on the server, supported by 
Spring IO and Jave EE.

{@img framework.jpg Baff Framework}


## Application

+   **View**: Provides the user interface widgets such as views, forms and lists.
+   **Controller (Client)**: Manages the views and interaction with stores and associated data models.
+   **Model**:  Defines the client data model and associated stores and service proxies.
+   **Json**: Supports transfer of information between components in JSON format.
+   **Controller (Server)**: Manages requests to and responses from services.
+   **Service**: Defines service operations to support client requests.
+   **Entity**: Defines business entities and associated persistence.


## Utility

+   **Application**: Provides a framework for the overall client application.
+   **Store Manager**: Manages the stores that cache business entities on the client.
+   **Version Manager**": Manages the versions of business entities cached on the client.
+   **Workflow**: Manages automatic sequencing of activities under a domain controller in order to 
support a business process.
+   **Logger**: Supports logging of diagnostic and audit information from the client.
+   **Locale**: Supports retrieval of locale specific messages on the server.
+   **Reference Data**:  Supports retrieval and presentation of decodes for data attributes held in
code format, for example to support drop down list selection.







   



