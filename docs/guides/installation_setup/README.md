# Installation & Setup

## Getting Started

This guide outlines how to setup an application based on Baff.  Prerequisites are as follows:

-  A suitable IDE such as NetBeans 8 (this ships with Java, Maven and Glassfish application server)
-  Java EE 7 JDK
-  Maven
-  Sencha Cmd, Sencha ExtJs 5 and Sencha Touch
-  A suitable database such as MySQL 5
-  A project created using the Maven WebApp archetype 

Refer to the example "Evaluator" application for more details and typical setup. 

## Setup baff-web 

Setup the Baff Web Javascript Client (Sencha ExtJs 5).

### 1. Install the package

+ Take a copy of "baff-web.pkg", found in /baff-client/build/baff-web (or you can build it from source)
+ Initialize the local respository (only do this once):

        sencha package repo init -name "Midrig" -email "support@midrig.com"

+  Add the package:

        sencha package add /path/to/baff-web.pkg

### 2. Create your sencha application

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

## Setup baff-mob

Setup the Baff Mobile Javascript Client (Sencha Touch 2.4).

### 1. Install the package

+ Take a copy of "baff-mob.pkg", found in /baff-client/build/baff-mob (or you can build it from source)
+ Initialize the local respository (only do this once):

        sencha package repo init -name "Midrig" -email "support@midrig.com"

+  Add the package:

        sencha package add /path/to/baff-mob.pkg

### 2. Create your sencha application

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

## Setup baff-serv

Setup the Baff Java Services (Spring Framework).

### 1. Install the package

+ Take a copy of "baff-X.X.X.jar", found in /target (or you can build it from source)
+ Add the package to your Maven repository
    
        mvn install:install-file -Dfile=/path/to/baff-X.X.X.jar -DpomFile=/path/to/pom.xml -DgroupId=com.midrig -DartifactId=baff -Dversion=X.X.X -Dpackaging=jar

### 2. Create your Java application

+ Generate the application using your IDE
+ Modify pom.xml to include baff

        ....    
        <dependency>
            <groupId>com.midrig</groupId>
            <artifactId>baff</artifactId>
            <version>X.X.X</version>
        </dependency>
        ...

+ Create the reference data and/or security database tables as required, using the scripts in /ddl
+ Configure the application, referring to the examples in /config