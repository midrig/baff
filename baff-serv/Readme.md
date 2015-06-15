# baff-serv

This is the Baff Java package based on Java 7 EE and Spring Framework 4.1.

Follow these steps below to include this package in your application, using Maven 

## 1. Install the package

+ Take a copy of "baff-X.X.X.jar", found in /target (or you can build it from source)
+ Add the package to your Maven repository
    
    mvn install:install-file -Dfile=/path/to/baff-X.X.X.jar -DpomFile=/path/to/pom.xml -DgroupId=com.midrig -DartifactId=baff -Dversion=X.X.X -Dpackaging=jar

## 2. Create your Java application

+ Generate the application using your IDE

+ Modify pom.xml to include baff, also refer to the example in /config for other options

    ....    
    <dependency>
        <groupId>com.midrig</groupId>
        <artifactId>baff</artifactId>
        <version>X.X.X</version>
    </dependency>
    ...

+ Create the reference data and/or security database tables as required, using the scripts in /ddl

+ Configure the application, referring to the examples in /config