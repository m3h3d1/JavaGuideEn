---
title: "Why Can Spring Boot JARs Run Directly?"
description: How executable JARs are packaged and launched, explained through java -jar, Main-Class, Start-Class, BOOT-INF, and Spring Boot Loader, with the roles of embedded servers and auto-configuration clarified.
category: Frameworks
tag:
  - Spring Boot
  - Java
head:
  - - meta
    - name: keywords
      content: Spring Boot,executable JAR,java -jar,JarLauncher,Main-Class,Start-Class,BOOT-INF,repackage
---

**A Spring Boot executable JAR relies on a launch entry in its manifest and a Boot Loader that can load nested dependencies.** Embedded Tomcat provides HTTP services as part of a web application's runtime. Command-line applications without a web container can also be packaged and run.

## Can a Regular JAR Also Run with `java -jar`?

Yes. JAR is an archive format, not something specific to Spring Boot. When you run `java -jar app.jar`, the Java launcher reads `Main-Class` from `META-INF/MANIFEST.MF` and invokes that entry point. A regular application can also be launched this way as long as it has an entry point supported by the target JDK and its dependencies are available. See the [Java 17 `java` command documentation](https://docs.oracle.com/en/java/javase/17/docs/specs/man/java.html).

Boot solves the additional problem of distributing dependencies with an application and loading them from the outer JAR. The standard Java class-loading mechanism does not recursively load other JARs nested inside a JAR, so simply copying dependency files into an archive is not enough.

## What's Inside a Boot Executable JAR?

Here is a common Boot Loader layout, with some files omitted:

```text
app.jar
├── META-INF/MANIFEST.MF
├── org/springframework/boot/loader/...
└── BOOT-INF/
    ├── classes/
    │   ├── com/example/Application.class
    │   ├── application.yml
    │   └── static/...
    └── lib/
        ├── spring-context-*.jar
        └── other-dependency-*.jar
```

Application classes and classpath resources are in `BOOT-INF/classes/`. Dependencies remain as separate JARs in `BOOT-INF/lib/`, while Loader classes are placed where the outer JAR can load them directly. Dependencies are not all expanded and merged into one set of class files, unlike a common shaded-JAR approach. See the [Spring Boot nested JAR specification](https://docs.spring.io/spring-boot/specification/executable-jar/nested-jars.html).

## What's the Difference Between `Main-Class` and `Start-Class`?

With the newer Loader introduced by default in Spring Boot 3.2, the manifest contains entries similar to these:

```text
Main-Class: org.springframework.boot.loader.launch.JarLauncher
Start-Class: com.example.Application
```

- **`Main-Class`:** The bootstrap class first invoked by the Java launcher.
- **`Start-Class`:** The application's main class, which the Boot Launcher invokes next.

Older Loaders commonly used `org.springframework.boot.loader.JarLauncher` as the entry point, without the intermediate `launch` package. Spring Boot 3.2 rewrote the Loader and changed the default entry-point class name. When troubleshooting, check the manifest in the actual build artifact. See the [Spring Boot 3.2 release notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.2-Release-Notes).

`Start-Class` is metadata used by Boot; the Java launcher does not recognize it as the application's entry point. `@SpringBootApplication` also does not replace the manifest's entry-point configuration.

## What Happens Between `java -jar` and Application Startup?

1. The Java launcher reads `Main-Class` and runs `JarLauncher`.
2. The Launcher organizes the application classes and nested dependencies according to the Boot layout, then creates the appropriate class loader.
3. The Launcher reads `Start-Class`, loads the application main class, and invokes its `main` method.
4. The application main class typically calls `SpringApplication.run(...)`, which creates the application context, registers beans, and applies auto-configuration.
5. If the application meets the conditions for a web application and a server is configured, it creates and starts an embedded server.

Therefore, `JarLauncher` is a bootstrap class, not itself a class loader. Auto-configuration and the web server are not what make the JVM recognize an executable JAR. See [Launching Executable JARs](https://docs.spring.io/spring-boot/specification/executable-jar/launching.html) for the entry-point mechanism and [How Spring Boot Auto-Configuration Works](./spring-boot-auto-assembly-principles.md) for auto-configuration.

Boot Loader can read nested entries from their locations in the outer archive. It typically does not need to extract the entire JAR to disk or load every dependency into memory at once. Extracting particular dependencies is an additional compatibility measure; it is inaccurate to say that “Boot startup extracts every JAR first.” See the [NestedJarFile documentation](https://docs.spring.io/spring-boot/specification/executable-jar/jarfile-class.html).

## How Can You Verify That a JAR Is Executable?

Maven projects usually use the `repackage` goal of `spring-boot-maven-plugin` to reorganize a regular JAR. The execution is preconfigured when you use `spring-boot-starter-parent`, but you still need to declare the plugin. Importing only the dependency BOM does not bind this packaging goal automatically. Gradle projects use the `bootJar` task provided by the Spring Boot plugin.

After building a project with the Maven plugin configured, inspect the actual artifact:

```bash
mvn package
jar tf target/app.jar
unzip -p target/app.jar META-INF/MANIFEST.MF
java -jar target/app.jar
```

Replace `app.jar` with the file name your project generated. The Maven plugin may retain the original archive with an `.original` suffix, and Gradle projects may also produce a regular JAR. Confirm that you are deploying the repackaged Boot artifact. See the [Maven plugin packaging documentation](https://docs.spring.io/spring-boot/maven-plugin/packaging.html) and [Gradle plugin packaging documentation](https://docs.spring.io/spring-boot/gradle-plugin/packaging.html).

When startup fails, check the corresponding part of the process:

| Symptom                                     | Check first                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `no main manifest attribute`                | Are you running a regular JAR? Was it repackaged?                                        |
| `JarLauncher` not found                     | Does the manifest class name match the Loader version and classes in the archive?        |
| Application or dependency class not found   | Are `Start-Class`, the application classes, and runtime dependencies packaged correctly? |
| Application starts but exposes no HTTP port | Is it a web application, and is the appropriate server included and enabled?             |
| `UnsupportedClassVersionError`              | Is the runtime JDK older than the class-file version requires?                           |

An executable JAR packages the application and its included Java dependencies, but it still requires a compatible Java runtime. It does not eliminate environmental dependencies such as databases, external configuration, or native libraries.

<!-- @include: @article-footer.snippet.md -->
