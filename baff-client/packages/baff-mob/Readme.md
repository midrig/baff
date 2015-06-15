# baff-mob

This is the Baff Javascript package based on Sencha Touch 2.4.

Follow these steps below to include this package in your application. 

## 1. Install the package

+ Take a copy of "baff-mob.pkg", found in /baff-client/mob/build/baff-mob (or you can build it from source)
+ Initialize the local respository (only do this once):

    sencha package repo init -name "Midrig" -email "support@midrig.com"

+  Add the package:

    sencha package add /path/to/baff-mob.pkg

## 2. Create your sencha application

+ Generate the application folder

    sencha -sdk /path/to/touch2.4 generate app MyApp  /path/to/MyApp

+ Modify app.json to include the baff-mob package

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
                "path": "packages/baff-mob/resources/css/baff.css",
                "update": "delta"
            },
            ...
        ],

    ...

+ Modify /resources/sass/app.scss to include the baff scss

    @import '../../packages/baff-mob/sass/baff';

+ Modify app.js to provide the baff path to the loader

    Ext.Loader.setConfig({
        enabled: true,
        paths:{
            'Baff': 'packages/baff-mob/src'
        }
    });

    Ext.application({
        ....
