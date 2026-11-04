---
title: Recommended Open-Source Big Data Projects
description: Recommended open-source big data projects for computing, storage, data integration, and lakehouse architectures, including Hadoop, Spark, Flink, Beam, SeaTunnel, Iceberg, Hudi, and Paimon.
category: Open-Source Projects
icon: "mdi:database-search-outline"
---

Big data projects cover computing, storage, data integration, and lakehouse architectures, so they should not be compared only by popularity. First identify the problem you need to solve, then choose a project at the appropriate layer.

## Distributed Computing

- [Apache Hadoop](https://github.com/apache/hadoop): A foundational distributed storage and batch-processing ecosystem with core modules such as HDFS, MapReduce, and YARN.
- [Apache Spark](https://github.com/apache/spark): A unified analytics engine for large-scale data processing, covering batch processing, stream processing, SQL, and machine learning.
- [Apache Flink](https://github.com/apache/flink): A stateful computing framework for bounded and unbounded data streams, commonly used for real-time processing and unified stream and batch workloads.
- [Apache Beam](https://github.com/apache/beam): A programming model for describing batch and stream processing jobs. Different runners can execute the same pipeline on engines such as Flink and Spark.
- [Apache Storm](https://github.com/apache/storm): A distributed real-time computing system useful for learning about early stream-processing architectures. For new projects, also compare Flink and Spark Structured Streaming.

## Distributed Storage

- [Apache HBase](https://github.com/apache/hbase): Distributed column-family storage built on the Hadoop ecosystem, suited to workloads that require large-scale random reads and writes.

## Data Integration

- [Apache SeaTunnel](https://github.com/apache/seatunnel): A distributed data integration tool with connectors for many sources, supporting both batch and real-time synchronization.
- [Flink CDC](https://github.com/apache/flink-cdc): A Flink-based streaming data integration tool for capturing database changes and building real-time data pipelines.
- [Apache Flume](https://github.com/apache/flume): A distributed system for collecting, aggregating, and transferring log data. It is still maintained, but focuses mainly on traditional log collection. Evaluate it alongside Kafka Connect, SeaTunnel, and similar tools for new projects.

## Lakehouse Table Formats

- [Apache Iceberg](https://github.com/apache/iceberg): An open table format for large analytic datasets, with schema evolution, partition evolution, snapshots, and more.
- [Apache Hudi](https://github.com/apache/hudi): An incremental processing platform for data lakes, focused on updates, deletes, change streams, and incremental queries.
- [Apache Paimon](https://github.com/apache/paimon): A table format for real-time lakehouses, supporting both streaming and batch reads and writes with Flink and Spark. Suitable for workloads that need real-time updates.
