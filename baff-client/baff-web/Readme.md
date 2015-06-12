# baff-web

This is the Baff Javascript package based on Sencha ExtJs 5.

Follow these steps below to include this package in your application. 

## 1. Install the package

+ Take a copy of "baff-web.pkg", found in /baff-client/web/build/baff-web (or you can build it from source)
+ Initialize the local respository (only do this once):

    sencha package repo init -name "Midrig" -email "support@midrig.com"

+  Add the package:

    sencha package add /path/to/baff-web.pkg

## 2. Create your sencha application

+ Generate the application folder

    sencha -sdk /path/to/ext5 generate app MyApp  /path/to/MyApp

+ Modify app.json to include the baff-web package

    ...

    "requires": [
            ...,
            "baff-mob"
            ...
        ],

    ...

    "css": [
            ...,
            {
                "path": "packages/baff-web/resources/baff.css",
                "update": "delta"
            },
            ...
        ],

    ...
