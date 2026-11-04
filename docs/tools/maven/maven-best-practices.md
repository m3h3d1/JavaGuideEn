---
title: Maven Best Practices
description: Common Maven best practices for Java projects, including standard directory layouts, Java versions, dependency management, profiles, Maven Wrapper, CI builds, and plugins.
category: Developer Tools
head:
  - - meta
    - name: keywords
      content: Maven coordinates,Maven repositories,Maven lifecycle,multi-module Maven,Maven Wrapper,dependency management
---

> Translated and edited by JavaGuide. [Original article](https://medium.com/@AlexanderObregon/maven-best-practices-tips-and-tricks-for-java-developers-438eca03f72b).

Maven is a widely used build-automation tool for Java projects. It simplifies builds and helps manage dependencies. See [Maven Fundamentals](./maven-core-concepts.md) for an introduction.

This article focuses on practical issues that can trip up a project: directory layouts, compiler versions, dependencies, environment configuration, Maven Wrapper, CI, and plugin management.

## Follow Maven's Standard Directory Layout

Maven's standard directory layout keeps projects consistent and makes them easier for other developers to understand.

Here is the basic layout:

```groovy
src/
  main/
    java/
    resources/
  test/
    java/
    resources/
pom.xml
```

- `src/main/java`: source code
- `src/main/resources`: application resources
- `src/test/java`: test code
- `src/test/resources`: test resources

This is only the simplest example. Real projects may divide directories further according to their conventions.

## Specify the Java Compilation Version

Don't rely on the default Java version of Maven or its plugins. Declare the target Java version in `pom.xml`. For modern Java projects, prefer `maven.compiler.release`: it corresponds to `javac --release` and is safer than configuring `source` and `target` separately.

Note that `javac --release` has been available since JDK 9. Maven Compiler Plugin 3.13.0 and later also supports `maven.compiler.release` on JDK 8 by translating it to `source` and `target`. If your project uses an older plugin or build environment, configure `source` and `target` explicitly.

For example, to compile against Java 17:

```xml
<properties>
  <maven.compiler.release>17</maven.compiler.release>
</properties>
```

You can also configure Maven Compiler Plugin directly:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.15.0</version>
      <configuration>
        <release>17</release>
      </configuration>
    </plugin>
  </plugins>
</build>
```

Don't use the old `1.8` format for `release`. Use `8` for Java 8, `17` for Java 17, and `21` for Java 21.

## Manage Dependencies Effectively

Dependency management is one of Maven's most powerful features. Define shared dependency versions in the parent POM's `dependencyManagement` section to avoid repeating version numbers across modules and reduce the chance of conflicts.

For example, suppose a parent project has two child modules, A and B, and both use JUnit 5. Define its version in the parent `pom.xml`:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

In each child module's `pom.xml`, reference only the `groupId` and `artifactId`:

```xml
<dependencies>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
  </dependency>
</dependencies>
```

For ecosystems such as Spring Boot and Spring Cloud that provide a BOM, import the official BOM first and omit specific versions from dependencies in your application modules. This avoids compatibility problems caused by manually combining versions.

## Use Profiles for Different Environments

Maven profiles let you configure builds for different environments, such as development, testing, and production. Define profiles in `pom.xml` and activate them with a command-line option:

```xml
<profiles>
  <profile>
    <id>development</id>
    <activation>
      <activeByDefault>true</activeByDefault>
    </activation>
    <properties>
      <environment>dev</environment>
    </properties>
  </profile>
  <profile>
    <id>production</id>
    <properties>
      <environment>prod</environment>
    </properties>
  </profile>
</profiles>
```

Activate the production profile from the command line:

```bash
mvn clean install -P production
```

## Keep `pom.xml` Clean and Organized

A well-organized `pom.xml` is easier to maintain and understand. Here are a few tips:

- Group related dependencies and plugins together.
- Use comments to describe the purpose of a specific dependency or plugin.
- Put shared version numbers in `<properties>`, or manage them centrally in the parent POM's `dependencyManagement` or `pluginManagement` sections.

```xml
<properties>
  <junit.version>5.10.2</junit.version>
  <mockito.version>5.12.0</mockito.version>
</properties>
```

Declare plugin versions explicitly too. Relying on Maven's default plugin versions can lead to different behavior across Maven versions or build environments.

## Use Maven Wrapper

Maven Wrapper lets you run and build a Maven project without installing Maven in advance.

The official Maven documentation describes it this way:

> The Maven Wrapper is an easy way to ensure a user of your Maven build has everything necessary to run your Maven build.

Maven Wrapper ensures that the build uses the intended Maven version. To set it up, run this command from the project directory:

```bash
mvn wrapper:wrapper
```

This generates Maven Wrapper files in the project. You can then use `./mvnw` (or `./mvnw.cmd` on Windows) instead of `mvn` to run Maven commands.

For team projects, commit `mvnw`, `mvnw.cmd`, and the `.mvn/wrapper/` directory. New team members and CI environments can then build with the Maven version specified by the project without installing it separately.

## Automate Builds with Continuous Integration

Integrating a Maven project with a continuous-integration (CI) system such as Jenkins or GitHub Actions lets you build, test, and deploy automatically. CI can catch problems early and provide a consistent build process for the whole team. Here is a simple GitHub Actions workflow for Maven:

```yaml
name: Java CI with Maven

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: "temurin"
          cache: "maven"

      - name: Build with Maven
        run: ./mvnw -B clean verify
```

For CI, `clean verify` is recommended because it runs tests and the necessary verification steps. `install` places build artifacts in the local repository; use it only when a later step needs those locally installed artifacts.

## Extend Maven with Plugins

Many Maven plugins extend its capabilities. Popular plugins include the following (the first three are part of the Maven project; the others are third-party plugins):

- `maven-surefire-plugin`: configure and run unit tests.
- `maven-failsafe-plugin`: configure and run integration tests.
- `maven-javadoc-plugin`: generate Javadoc documentation.
- `maven-checkstyle-plugin`: enforce coding standards and best practices.
- `jacoco-maven-plugin`: measure unit-test coverage.
- `sonar-maven-plugin`: analyze code quality.
- And more...

Here is an example configuration for JaCoCo:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
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

If existing plugins don't meet your needs, you can write your own.

Explore available plugins and configure them in `pom.xml` to improve your development workflow.

## Summary

The goal of Maven is not just to make a project run. It is to give the team a consistent build process across local development, CI, and deployment. In practice, use the standard directory layout, declare Java and plugin versions explicitly, manage dependency versions with a parent POM or BOM, commit Maven Wrapper, and pin the JDK and Maven commands used in CI.
