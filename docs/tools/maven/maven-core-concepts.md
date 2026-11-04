---
title: Maven Fundamentals
description: An introduction to Maven's core concepts, including coordinates, dependencies, repositories, lifecycles, plugins, and multi-module projects.
category: Developer Tools
head:
  - - meta
    - name: keywords
      content: Maven coordinates,Maven repositories,Maven lifecycle,multi-module Maven
---

> This section is based on the official Maven documentation and focuses on key concepts. It does not cover hands-on usage.

## Introduction to Maven

The [official Maven documentation](https://github.com/apache/maven) describes Maven as follows:

> Apache Maven is a software project management and comprehension tool. Based on the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a central piece of information.
>
> **What is a POM?** Every Maven project has a `pom.xml` file in its root directory. It contains details about the project's build lifecycle. Use it to define coordinates, dependencies, project information, plugins, and other settings.

Maven has three main purposes for developers:

1. **Build projects:** Provide a standard, cross-platform way to automate project builds.
2. **Manage dependencies:** Manage project dependencies (JARs) and avoid version conflicts.
3. **Standardize project structure:** Provide a standard, consistent project layout.

This article does not cover basic Maven usage. For a quick introduction, see the official [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html) guide.

## Maven Coordinates

Third-party libraries and plugins used by a project are called artifacts. Each artifact is uniquely identified by its Maven coordinates, which include:

- **`groupId` (required):** Identifies the organization or company that owns the Maven project. It is usually made up of several parts: often a top-level domain followed by the organization name. Common domains include `org`, `com`, and `cn`. For example, the Apache Tomcat project uses `org.apache`: `org` is the domain, `apache` is the organization, and `tomcat` is the `artifactId`.
- **`artifactId` (required):** The project's name and unique identifier, usually matching the project directory name.
- **`version` (required):** The project's current version.
- **`packaging` (optional):** The package type, such as JAR or WAR. The default is JAR.
- **`classifier` (optional):** Distinguishes artifacts with different contents built from the same POM. It can be any string and is appended to the version.

With the correct coordinates, Maven can find the corresponding artifact in a repository.

For example, to add Alibaba's open-source EasyExcel:

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.1.1</version>
</dependency>
```

You can find many available artifacts on <https://mvnrepository.com/>. If you use Maven, you may find this site useful.

![Maven repository](https://oss.javaguide.cn/github/javaguide/tools/maven/mvnrepository.com.png)

## Maven Dependencies

When another project uses an artifact built by Maven, such as a JAR file, that artifact is a dependency of the other project.

### Configure Dependencies

**Example configuration:**

```xml
<project>
    <dependencies>
        <dependency>
            <groupId></groupId>
            <artifactId></artifactId>
            <version></version>
            <type>...</type>
            <scope>...</scope>
            <optional>...</optional>
            <exclusions>
                <exclusion>
                  <groupId>...</groupId>
                  <artifactId>...</artifactId>
                </exclusion>
          </exclusions>
        </dependency>
      </dependencies>
</project>
```

**Configuration details:**

- `dependencies`: The top-level element for dependencies. A `pom.xml` can contain only one.
- `dependency`: Declares a project dependency. A `dependencies` element can contain multiple entries.
- `groupId`, `artifactId`, `version` (required): The dependency's basic coordinates. Maven uses them to locate the artifact.
- `type` (optional): The dependency type, corresponding to the artifact's `packaging`. It usually defaults to `jar`.
- `scope` (optional): The dependency scope. The default is `compile`.
- `optional` (optional): Marks a dependency as optional.
- `exclusions` (optional): Excludes transitive dependencies, for example to resolve a JAR conflict.

### Dependency Scopes

The **classpath** specifies where `.class` files are located. A class loader loads the required classes from these locations into memory.

Maven uses three different classpaths for compiling, testing, and running an application:

- **Compile classpath:** Used to compile main code.
- **Test classpath:** Used to compile and run test code.
- **Runtime classpath:** Used when the application runs.

Maven defines these dependency scopes:

- **`compile`:** The default scope, available on the compile, test, and runtime classpaths.
- **`test`:** Available only on the test classpath. JUnit is a typical example; it is needed to compile and run tests, but not to compile or run the application.
- **`provided`:** Available for compilation and testing, but not at runtime. For example, Tomcat provides `servlet-api.jar`, so the project only needs it during compilation.
- **`runtime`:** Available for testing and runtime, but not for compiling main code. A JDBC driver implementation is a typical example.
- **`system`:** Requires you to explicitly specify the dependency path with `systemPath`. Maven does not resolve it from a repository, which can make the build non-portable.

### Transitive Dependencies

### Dependency Conflicts

**1. Maven can use only one version for a given `groupId` and `artifactId`.**

```xml
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.48</version>
</dependency>
<!-- Only version 1.0.49 will be used. -->
<dependency>
    <groupId>in.hocg.boot</groupId>
    <artifactId>mybatis-plus-spring-boot-starter</artifactId>
    <version>1.0.49</version>
</dependency>
```

If the same dependency is declared more than once with different versions in one POM, only the later declaration is used.

**2. Two project dependencies bring in different versions of the same dependency.**

For example, a project has these dependency paths:

```plain
Dependency path 1: A -> B -> C -> X (1.0)
Dependency path 2: A -> D -> X (2.0)
```

These paths bring in two versions of X. To avoid duplicate dependencies, Maven selects only one of them.

**Which version of X does Maven use?**

Maven follows two rules: **nearest definition** and **first declaration wins**. Resolving version conflicts this way is called **dependency mediation**.

**Nearest definition**

```plain
Dependency path 1: A -> B -> C -> X (1.0) // distance = 3
Dependency path 2: A -> D -> X (2.0) // distance = 2
```

The second path is shorter, so Maven selects X (2.0).

However, nearest definition alone cannot resolve cases where the paths have equal lengths:

```plain
Dependency path 1: A -> B -> X (1.0) // distance = 2
Dependency path 2: A -> D -> X (2.0) // distance = 2
```

Maven therefore also uses declaration order.

The first rule does not resolve every conflict. For example, the paths `A -> B -> Y (1.0)` and `A -> C -> Y (2.0)` have the same length. Maven applies its second rule:

**First declaration wins**

When dependency paths have the same length, the declaration order in `pom.xml` determines which version is selected. The first one declared wins. In this example, if B is declared before D, Maven uses X (1.0).

```xml
<!-- A's pom.xml -->
<dependencies>
    ...
    <!-- dependency B -->
    ...
    <!-- dependency D -->
</dependencies>
```

### Exclude Dependencies

Maven's dependency mediation may not produce the version you need. In some cases, you must exclude a dependency manually.

For example, a project has these dependency paths:

```plain
Dependency path 1: A -> B -> C -> X (1.5) // distance = 3
Dependency path 2: A -> D -> X (1.0) // distance = 2
```

By the nearest-definition rule, Maven selects X (1.0).

This can cause problems. If C uses a class available only in X 1.5, the application may fail at runtime with `NoClassDefFoundError`. If it uses a method available only in X 1.5, it may fail with `NoSuchMethodError`.

This is one reason Maven projects may encounter `NoClassDefFoundError` and `NoSuchMethodError`.

**How can you fix it?** Manually exclude X (1.0) with the `exclusions` element:

```xml
<dependency>
    ......
    <exclusions>
      <exclusion>
        <artifactId>x</artifactId>
        <groupId>org.apache.x</groupId>
      </exclusion>
    </exclusions>
</dependency>
```

When resolving a dependency conflict, it is generally preferable to keep the newer version because most JARs maintain backward compatibility between releases.

If the newer version changed or removed classes or methods used by a dependency, don't simply keep it. Consider upgrading the higher-level dependency instead.

For example, consider the same dependency paths:

```plain
Dependency path 1: A -> B -> C -> X (1.5) // distance = 3
Dependency path 2: A -> D -> X (1.0) // distance = 2
```

Suppose you keep X 1.5, but it has removed classes present in X 1.0. You may need to upgrade D to a version compatible with X 1.5.

## Maven Repositories

In Maven, a dependency, plugin, or project build output is called an **artifact**.

Coordinates and dependencies are the logical representation of an artifact; the artifact itself is a file. Maven repositories manage these files. Each artifact has a unique set of coordinates, so you can use those coordinates to retrieve it instead of adding the file manually.

Maven repositories are divided into:

- **Local repository:** A directory on the computer running Maven. It caches downloaded artifacts and stores locally built artifacts that have not been published. The path is configured in `settings.xml`; the default is `${user.home}/.m2/repository`.
- **Remote repository:** A Maven repository maintained by the project or another organization.

Remote Maven repositories include:

- **Central Repository:** Maintained by the Maven community, it hosts most open-source packages and is configured by default. Developers do not need to add it explicitly. Use [Maven Central Search](https://central.sonatype.com/) to find artifact coordinates.
- **Private repository:** A remote repository hosted on a local network, often configured as a mirror for public repositories and shared by Maven users within an organization.
- **Other public repositories:** Some speed up access, such as the Aliyun Maven mirror; others host artifacts not available from Central.

Maven resolves dependencies in this order:

1. Check the local repository and use the artifact if it is present.
2. If it is not found locally, search the remote repositories and download it to the local repository.
3. If it is not found remotely, Maven reports an error.

## Maven Lifecycles

Maven lifecycles abstract and standardize the build process. They cover most build steps, including cleaning, initialization, compilation, testing, packaging, integration testing, verification, deployment, and site generation.

Maven defines three lifecycles in `META-INF/plexus/components.xml`:

- The `default` lifecycle
- The `clean` lifecycle
- The `site` lifecycle

The lifecycles are independent, and each contains ordered phases. Later phases depend on earlier ones, so running a phase also runs all preceding phases in that lifecycle.

Run Maven lifecycle phases with this command format:

```bash
mvn phase [phase2] ... [phaseN]
```

### The `default` Lifecycle

The `default` lifecycle is Maven's main lifecycle for building applications. It contains 23 phases, defined independently of any specific plugin:

```xml
<phases>
  <!-- Validate the project and ensure all required information is available. -->
  <phase>validate</phase>
  <!-- Initialize the build, for example by setting properties. -->
  <phase>initialize</phase>
  <!-- Generate source code to include in compilation. -->
  <phase>generate-sources</phase>
  <!-- Process the source code. -->
  <phase>process-sources</phase>
  <!-- Generate resources to include in the package. -->
  <phase>generate-resources</phase>
  <!-- Copy and process resources into the target directory for packaging. -->
  <phase>process-resources</phase>
  <!-- Compile the project's source code. -->
  <phase>compile</phase>
  <!-- Post-process compiled files, such as enhancing or optimizing Java bytecode. -->
  <phase>process-classes</phase>
  <!-- Generate test source code to include in compilation. -->
  <phase>generate-test-sources</phase>
  <!-- Process test source code. -->
  <phase>process-test-sources</phase>
  <!-- Generate test resources. -->
  <phase>generate-test-resources</phase>
  <!-- Process test resources. -->
  <phase>process-test-resources</phase>
  <!-- Compile test source code. -->
  <phase>test-compile</phase>
  <!-- Post-process compiled test files. -->
  <phase>process-test-classes</phase>
  <!-- Run tests with a suitable unit-testing framework, such as JUnit. -->
  <phase>test</phase>
  <!-- Perform any required preparation before packaging. -->
  <phase>prepare-package</phase>
  <!-- Package compiled code in a distributable format such as JAR, WAR, or EAR. -->
  <phase>package</phase>
  <!-- Perform required setup before integration tests, such as preparing the environment. -->
  <phase>pre-integration-test</phase>
  <!-- Deploy the package to an environment where integration tests can run. -->
  <phase>integration-test</phase>
  <!-- Perform required cleanup after integration tests. -->
  <phase>post-integration-test</phase>
  <!-- Run checks to verify the package and ensure it meets quality standards. -->
  <phase>verify</phase>
  <!-- Install the package in the local repository for use by other local projects. -->
  <phase>install</phase>
  <!-- Publish the final package to a remote repository for other developers and projects. -->
  <phase>deploy</phase>
</phases>
```

Because lifecycle phases run in order, `mvn test` runs every phase from `validate` through `test`. This is why the project is compiled automatically when you run tests.

### The `clean` Lifecycle

The `clean` lifecycle cleans the project and contains three phases:

1. pre-clean
2. clean
3. post-clean

```xml
<phases>
  <!-- Run tasks that must finish before cleaning. -->
  <phase>pre-clean</phase>
  <!-- Remove files generated by the previous build. -->
  <phase>clean</phase>
  <!-- Run tasks that must finish immediately after cleaning. -->
  <phase>post-clean</phase>
</phases>
<default-phases>
  <clean>
    org.apache.maven.plugins:maven-clean-plugin:2.5:clean
  </clean>
</default-phases>
```

Because lifecycle phases run in order, `mvn clean` runs the `pre-clean` and `clean` phases.

### The `site` Lifecycle

The `site` lifecycle builds and publishes a project site. It contains four phases:

1. pre-site
2. site
3. post-site
4. site-deploy

```xml
<phases>
  <!-- Run tasks required before generating the site documentation. -->
  <phase>pre-site</phase>
  <!-- Generate the project site documentation. -->
  <phase>site</phase>
  <!-- Run tasks after generating the site and prepare it for deployment. -->
  <phase>post-site</phase>
  <!-- Deploy the generated site documentation to a server. -->
  <phase>site-deploy</phase>
</phases>
<default-phases>
  <site>
    org.apache.maven.plugins:maven-site-plugin:3.3:site
  </site>
  <site-deploy>
    org.apache.maven.plugins:maven-site-plugin:3.3:deploy
  </site-deploy>
</default-phases>
```

Maven can use information in `pom.xml` to generate a project site for sharing information with the team.

## Maven Plugins

Maven is essentially a plugin execution framework: plugins perform the build operations. Common commands such as `install`, `clean`, and `deploy` are backed by Maven plugins. For details, see the official [Maven Plugins documentation](https://maven.apache.org/plugins/index.html).

Default local plugin directory: `${user.home}/.m2/repository/org/apache/maven/plugins`

![](https://oss.javaguide.cn/github/javaguide/tools/maven/maven-plugins.png)

In addition to the plugins maintained by the Maven project, third-party plugins include `jacoco-maven-plugin` for test coverage, `maven-checkstyle-plugin` for detecting style violations, and `sonar-maven-plugin` for code-quality analysis. You can also write custom plugins to meet your needs.

Example `jacoco-maven-plugin` configuration:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.8</version>
      <executions>
        <execution>
          <goals>
            <goal>prepare-agent</goal>
          </goals>
        </execution>
        <execution>
          <id>generate-code-coverage-report</id>
          <phase>test</phase>
          <goals>
            <goal>report</goal>
          </goals>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
```

Think of a Maven plugin as a collection of goals. You can run a goal directly from the command line or bind it to a build lifecycle phase so it runs as part of the build.

Maven plugins are divided into two types:

- **Build plugins:** Run during the build.
- **Reporting plugins:** Run while generating the project site.

## Multi-Module Maven Projects

Multi-module management divides a project into modules, each responsible for a specific function. A multi-module Maven project has multiple `pom.xml` files in different directories.

Multi-module projects can make development and maintenance easier, and offer these benefits:

1. Reduce coupling between code (moving from class-level coupling to JAR-level coupling).
2. Reduce duplication and improve reuse.
3. Make modules self-describing through their names or documentation.
4. Define code boundaries so developers can identify their responsibilities by module.

In a multi-module project, one parent module contains the child modules. The parent usually contains only a `pom.xml`, which defines shared dependency versions, child modules, and plugins. If a dependency is used by only one child, declare it in that child's POM to keep the parent POM from becoming cluttered.

As shown below, the Dubbo project is divided into modules such as `dubbo-common` (shared logic), `dubbo-remoting` (remote communication), and `dubbo-rpc` (remote procedure calls).

![](https://oss.javaguide.cn/github/javaguide/tools/maven/dubbo-maven-multi-module.png)

## Recommended Articles

- [How to Resolve Maven Transitive Dependencies](https://mp.weixin.qq.com/s/flniMiP-eu3JSBnswfd_Ew) — Alibaba Developers, 2022
- [Using Java Build Tools Effectively: Maven](https://mp.weixin.qq.com/s/Wvq7t2FC58jaCh4UFJ6GGQ) — Alibaba Developers, 2022
- [A Story About Maven Repackaging](https://mp.weixin.qq.com/s/xsJkB0onUkakrVH0wejcIg) — Alibaba Developers, 2022

## References

- _Maven: The Definitive Guide_ (Chinese edition)
- [Introduction to Repositories](https://maven.apache.org/guides/introduction/introduction-to-repositories.html) — Maven documentation
- [Introduction to the Build Lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html#Lifecycle_Reference) — Maven documentation
- [Maven Dependency Scopes](https://www.mvnbook.com/maven-dependency.html)
- [Resolving Maven Dependency Conflicts](https://www.cnblogs.com/qdhxhz/p/16363532.html)
- Multi-Module Project with Maven：<https://www.baeldung.com/maven-multi-module>

<!-- @include: @article-footer.snippet.md -->
