---
title: Common Java Utility Libraries
description: Recommended Java libraries for Lombok, Guava, Jackson, Hibernate Validator, Tika, PDFBox, and more.
category: Open-Source Projects
icon: "mdi:library-outline"
---

This page covers Java libraries added as Maven or Gradle dependencies. For GUI applications, command-line tools, and platforms that must be installed or deployed separately, see [Developer Tools](./tools.md).

## General Utilities

- [Lombok](https://github.com/rzwitserloot/lombok): Generates boilerplate such as getters, setters, `equals`, `hashCode`, `toString`, constructors, and logging fields through annotations. It uses compile-time annotation processing, so teams should align IDE plugins and build configuration before adopting it.
- [Guava](https://github.com/google/guava "guava"): Google's Java core library, with `Multimap`, `Multiset`, `BiMap`, immutable collections, and I/O, hashing, and string utilities.
- [Hutool](https://github.com/looly/hutool "hutool"): A broad Java utility library for files, strings, dates, cryptography, caching, and logging. It has many modules; add only what you need instead of treating it as the default solution for every problem.

## JSON Processing

- [Jackson Databind](https://github.com/FasterXML/jackson-databind): Jackson's general-purpose data-binding module for converting between JSON and Java objects. When upgrading, check the Jackson BOM and security advisories, and avoid mixing module versions.
- [Gson](https://github.com/google/gson): Google's Java library for JSON serialization and deserialization. Its simple API suits projects that want a small dependency footprint.

## Validation

- [Hibernate Validator](https://github.com/hibernate/hibernate-validator): The reference implementation of Jakarta Validation. Use annotations to declare constraints on fields, method parameters, and return values.

## Diagnostics and Performance

- [Arthas](https://github.com/alibaba/arthas "arthas"): Alibaba's Java diagnostics tool for monitoring and troubleshooting running applications. Its commands help investigate performance issues, resource usage during startup, and class-loading time.
- [Async Profiler](https://github.com/async-profiler/async-profiler): A low-overhead Java profiler for collecting and analyzing performance data asynchronously.

## File and Media Processing

### Document Parsing

- [Tika](https://github.com/apache/tika): Detects file types and extracts metadata and text from more than a thousand formats, including PPT, XLS, and PDF.

### Image and Media Metadata

- [TwelveMonkeys ImageIO](https://github.com/haraldk/TwelveMonkeys): Adds ImageIO plugins and extensions for formats such as TIFF, WebP, and PSD.
- [metadata-extractor](https://github.com/drewnoakes/metadata-extractor): Extracts EXIF, IPTC, XMP, ICC, and other metadata from images, video, and audio.

### Excel

- [FastExcel](https://github.com/fast-excel/fastexcel): A high-performance, low-memory Java library for reading and writing Excel files.
- [Excel Spring Boot Starter](https://github.com/pig-mesh/excel-spring-boot-starter): A Spring Boot starter based on FastExcel that simplifies Excel file operations.

### PDF

For basic PDF creation, consider OpenPDF. For parsing, conversion, and text extraction, consider Apache PDFBox. iText has more features, but its community edition uses the AGPL license. Closed-source commercial projects should review the commercial licensing requirements.

- [x-easypdf](https://gitee.com/dromara/x-easypdf): A PDF-generation framework based on PDFBox and FOP, with export and editing features for common document-generation needs.
- [iText](https://github.com/itext/itext7): A Java library for creating, editing, and enhancing PDF documents. Its community edition uses the AGPL license; closed-source commercial projects generally need a commercial license.
- [OpenPDF](https://github.com/LibrePDF/OpenPDF): A PDF library under dual LGPL/MPL licensing, derived from an early version of iText. It suits common PDF creation and editing tasks.
- [Apache PDFBox](https://github.com/apache/pdfbox): An Apache-licensed library for creating, parsing, converting, and extracting text from PDFs. It is feature-rich, though its API takes time to learn.
- [Apache FOP](https://github.com/apache/xmlgraphics-fop): Converts XSL-FO (Extensible Stylesheet Language Formatting Objects) into PDF and other output formats.

## SMS and Email

- [SMS4J](https://github.com/dromara/SMS4J): An SMS integration framework that simplifies connecting to multiple SMS SDKs.
- [Simple Java Mail](https://github.com/bbottema/simple-java-mail): A lightweight Java email library supporting attachments, embedded images, signatures, and encryption.

## Cryptography

- [Bouncy Castle for Java](https://github.com/bcgit/bc-java): The Java distribution of Bouncy Castle, with cryptographic algorithms, certificates, CMS, OpenPGP, and other features. Avoid assembling cryptographic implementations yourself. Check the license, compliance requirements, and security updates before choosing a version.

## Other Libraries

- [oshi](https://github.com/oshi/oshi "oshi"): A JNA-based Java library for retrieving operating-system and hardware information.
- [ip2region](https://github.com/lionsoul2014/ip2region): An offline IP geolocation library with clients in multiple languages and a compact data file. Geolocation has accuracy limits and should not be the sole basis for identity or compliance decisions.
- [Agrona](https://github.com/real-logic/agrona): High-performance Java data structures, including buffers, lists, maps, and a scalable timer wheel, plus utility methods.
