---
title: "MySQL Backup and Recovery: mysqldump, XtraBackup, Binlogs, and PITR"
description: A practical guide to MySQL backups and recovery with mysqldump, MySQL Shell, Percona XtraBackup, binlogs, PITR, RTO/RPO, and restore drills.
category: Database
tag:
  - MySQL
  - Backup and recovery
head:
  - - meta
    - name: keywords
      content: MySQL backup, MySQL recovery, mysqldump, mysqlbinlog, MySQL Shell, Percona XtraBackup, binlog, PITR, full backup, incremental backup, logical backup, physical backup, RTO, RPO
---

The most serious production database incidents often aren't caused by a MySQL process crash.

A crashed process can be restarted, and a failed primary can be replaced by a replica. The harder problems are deleted data, incorrect script changes, disk failures, or missing tables after migration. Replication, redo logs, and undo logs cannot solve these problems; a backup and recovery plan can.

This guide covers MySQL backup and recovery only. Commands are based mainly on MySQL 8.4 LTS and the MySQL 9.7 documentation available as of 2026-06-25. Option names, privilege requirements, and tool compatibility vary by version; check `mysqldump --help`, `mysqlbinlog --help`, and the documentation for your environment before using these commands in production.

## What Does a Backup Protect Against?

Separate these related concepts:

- **Crash recovery**: After an unexpected shutdown, InnoDB uses redo and undo logs to restore a consistent state. This handles engine consistency after a crash or restart.
- **Replication / high availability**: Routes traffic to a replica or new primary when the primary is unavailable. This improves availability, but erroneous writes are usually replicated too.
- **Backup and recovery**: Restores a historical copy and replays binlogs to a target point in time. It addresses data loss, accidental changes, disk failure, migration, and retention requirements.

Replication does not replace backups.

If `DROP TABLE` succeeds on the primary, it will likely be replicated. Faster replication also spreads mistakes faster. Backups preserve an independent historical state that can be restored from before the incident.

## RTO and RPO Define the Backup Strategy

Don't plan backups only by asking how often to run them. Start with two questions:

- **RPO (Recovery Point Objective)**: How much data loss is acceptable?
- **RTO (Recovery Time Objective)**: How long can service recovery take?

If losing one day's data is acceptable, a daily full backup may be enough. For orders, payments, or inventory where only a few minutes of data loss is acceptable, retain binlogs for incremental recovery. If the database is hundreds of gigabytes and the RTO is 30 minutes, consider physical backups, prewarmed replicas, restore drills, and a failover procedure.

A common setup is:

- Run full backups daily or weekly.
- Enable binlogs and retain them long enough to meet the RPO.
- Store backups and binlogs on separate disks and in separate failure domains.
- Regularly restore a backup to a new machine and record the recovery time.

Retaining binlogs for 30 days does not guarantee a seconds-level RPO. Recovery depends on the latest complete, readable binlog copy stored in a separate failure domain. In production, also monitor `sync_binlog`, `innodb_flush_log_at_trx_commit`, archive lag, archive process interruptions, and binlog continuity. MySQL 8.4 defaults both `sync_binlog` and `innodb_flush_log_at_trx_commit` to `1`, favoring durability. If these settings are relaxed for performance, account for possible loss of recent transactions in the RPO.

For a minutes- or seconds-level RPO, monitor not only how many days of binlogs remain on disk, but also how long ago the latest binlog was safely archived.

Recovery speed depends on data volume, disk performance, index count, network bandwidth, and import method. Without restore drill results, an RTO is only an estimate.

## Backup Types

MySQL backups are commonly classified in three ways, each answering a different question.

By database availability during backup:

| Type | Description                                                         | Use case                                                     |
| ---- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| Cold | Copy data files after stopping MySQL                                | Small systems with a sufficient maintenance window           |
| Warm | Back up while MySQL runs, possibly locking or affecting writes      | Systems that can tolerate a brief impact                     |
| Hot  | Back up while MySQL runs, minimizing disruption to reads and writes | Production or large databases with short maintenance windows |

By backup contents:

| Type     | Description                                            | Examples                                    |
| -------- | ------------------------------------------------------ | ------------------------------------------- |
| Logical  | Exports SQL, CSV, or other logical data                | `mysqldump`, MySQL Shell Dump Utilities     |
| Physical | Copies data files, log files, and other physical files | Percona XtraBackup, MySQL Enterprise Backup |

By scope:

| Type                | Description                                             |
| ------------------- | ------------------------------------------------------- |
| Full backup         | Backs up all data at a point in time                    |
| Incremental backup  | Backs up data or logs changed since the previous backup |
| Differential backup | Backs up data changed since the last full backup        |

These categories often come up in interviews, but in production the key question is whether the backup can restore the required data. The categories guide tool selection; a successful restore is what matters.

## Logical Backups with mysqldump

`mysqldump` is MySQL's built-in logical backup tool. It exports SQL statements that recreate schemas and data. It is simple, portable, easy to inspect, and useful for migration. For large datasets, backups can be slow and restores even slower because MySQL must execute the SQL, write the data, and build indexes again.

The MySQL documentation notes that `mysqldump` is not a fast solution for large-scale backup and recovery. Physical backups are usually a better fit for large datasets.

A production-oriented full InnoDB backup can use:

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --all-databases \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  > mysql-full-backup.sql
```

Key options:

- `--single-transaction`: Starts a consistent read transaction before the backup and is suitable for InnoDB tables. It usually avoids holding table locks throughout the export. However, this command also uses `--source-data=2`, so `mysqldump` briefly acquires a global read lock at startup to align the snapshot with the binlog position. It avoids long write blocks; it is not completely lock-free. Nontransactional tables such as MyISAM and MEMORY may change during the backup.
- `--routines` and `--events`: Include stored procedures, functions, and events. MySQL 8.4 documents that these definitions are stored in the data dictionary; `--all-databases` does not include them automatically.
- `--triggers`: Triggers are included by default. Listing this option explicitly makes the backup script's intent clear.
- `--source-data=2`: Writes the current binlog filename and position to the dump as an SQL comment. In current documentation, the older `--master-data` option is a deprecated alias for `--source-data`.

To back up one database:

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  order_db \
  > order_db.sql
```

This exports objects from `order_db`, but does not add `CREATE DATABASE order_db` and `USE order_db` statements. Create the database before restoring, or use `--databases order_db` when backing up:

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  --source-data=2 \
  --databases order_db \
  > order_db.sql
```

`--databases` adds `CREATE DATABASE` and `USE` to the dump. To import into an existing database with the same name, use the first form and specify the target database in the restore command.

Compress large backup files as they are created:

```bash
mysqldump \
  --host=127.0.0.1 \
  --user=backup_user \
  --password \
  --single-transaction \
  --routines \
  --events \
  --triggers \
  order_db | gzip > order_db.sql.gz
```

Restore an uncompressed dump with:

```bash
mysql --host=127.0.0.1 --user=root --password < mysql-full-backup.sql
```

Restore a compressed dump with:

```bash
mysql --host=127.0.0.1 --user=root --password \
  -e "CREATE DATABASE IF NOT EXISTS order_db"

gunzip -c order_db.sql.gz | mysql --host=127.0.0.1 --user=root --password order_db
```

Common `mysqldump` pitfalls:

- Insufficient privileges can omit views, triggers, stored procedures, or events.
- With `--single-transaction`, DDL such as `ALTER TABLE`, `DROP TABLE`, or `TRUNCATE TABLE` during the backup may cause failure or unexpected contents.
- Without a recorded binlog position, point-in-time recovery cannot continue from the full backup.
- When restoring to a GTID-enabled environment, do not rely blindly on the default `--set-gtid-purged=AUTO`. If GTID is enabled on the source, the dump may contain `SET @@GLOBAL.gtid_purged` and `SET @@SESSION.sql_log_bin=0`. A single-database dump may also include GTIDs for transactions from other databases in the source instance's `gtid_executed` set. For test or temporary databases, or targets with existing GTID history, explicitly evaluate `--set-gtid-purged=OFF`. A new replication node may need the GTIDs preserved. Choose deliberately rather than copying the default.
- `--source-data=2` records an instance-level binlog position, not an incremental log limited to one database. Single-database PITR is more complex than instance-level PITR. Account for cross-database transactions, stored procedures, triggers, and `binlog_format`; do not replay the entire instance binlog into a target database without filtering and validation.

`mysqldump` is convenient for small databases, tests, cross-version migrations, and limited exports. Restoring a production database of hundreds of gigabytes from a dump can take too long.

## MySQL Shell Dump Utilities: Parallel Logical Backups

If you want portable logical backups but need faster exports and imports than `mysqldump` provides, consider MySQL Shell Dump Utilities.

MySQL Shell provides these `util` functions:

```javascript
util.dumpInstance("/backup/mysql/instance", { threads: 8 });
util.dumpSchemas(["order_db"], "/backup/mysql/order_db", { threads: 8 });
util.dumpTables("order_db", ["orders", "order_item"], "/backup/mysql/orders", {
  threads: 8,
});
util.loadDump("/backup/mysql/order_db", { threads: 8 });
```

These utilities still produce logical backups, but support parallel dump and load, compression, progress reporting, checksums, and object storage. The documented default for `threads` is 4; increase it based on server load, network capacity, and target write throughput.

They are not a replacement for physical backups. They export logical objects and data, so restores still rebuild tables, indexes, and other objects. For large databases with a tight RTO, physical backups are usually more reliable.

## Incremental Recovery with Binlogs

A full backup restores data only to the time it was taken. Use binlogs to recover to a later point in time.

Binlogs record data-changing events and support both replication and point-in-time recovery (PITR). PITR typically restores a full backup, then replays binlogs from the recorded position until the target time or position.

A simplified example:

1. A full backup runs at 02:00 and records `binlog.000120` at position `154`.
2. At 10:21, someone accidentally deletes rows from `order_item`.
3. Restore the 02:00 full backup.
4. Replay `binlog.000120` and later logs with `mysqlbinlog`, stopping before the deletion.

To stop replay at a time:

```bash
mysqlbinlog \
  --start-position=154 \
  --stop-datetime="2026-06-25 10:20:59" \
  binlog.000120 binlog.000121 \
  | mysql --binary-mode --host=127.0.0.1 --user=root --password
```

Stopping by time helps narrow the range, but is not an exact business timestamp. `mysqlbinlog` interprets `--stop-datetime` in the local time zone of the machine running the command and stops at the first event with a timestamp at or after the target. For production recovery, first inspect a time-bounded binlog segment, find the event or transaction boundary for the mistake, then use `--stop-position` for the final replay.

If the event position is known, stopping by position is more precise:

```bash
mysqlbinlog \
  --start-position=154 \
  --stop-position=987654 \
  binlog.000120 \
  | mysql --binary-mode --host=127.0.0.1 --user=root --password
```

When multiple binlog files are specified, `--start-position` applies only to the first file and `--stop-position` only to the last; intermediate files are processed in full. Positions are byte offsets, not event numbers, and must point to valid event boundaries.

`mysql --binary-mode` matters. The documentation notes that if binlog output contains null bytes such as `\0`, the `mysql` client may not parse it correctly without this option.

Modern MySQL commonly uses row-based binlogs. These record row changes, not necessarily the original SQL. To inspect row events as readable comments, use:

```bash
mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000120 > binlog.000120.readable.sql
```

This output is mainly for manual inspection. The documentation warns that `--base64-output=AUTO` is the safe default when re-executing `mysqlbinlog` output; modes such as `DECODE-ROWS` should not be used for production replay.

Binlog recovery requires:

- Binary logging must be enabled in advance.
- Binlog retention must meet the RPO.
- The full backup must include the starting binlog file and position, or GTID information.
- Test recovery on an isolated instance before replaying uncertain binlogs into production.

Back up the binlog files themselves as well. The MySQL documentation gives this example for continuously copying binlogs:

```bash
mysqlbinlog \
  --read-from-remote-server \
  --host=127.0.0.1 \
  --user=binlog_backup \
  --password \
  --raw \
  --stop-never \
  --connection-server-id=330610 \
  --result-file=/backup/mysql/binlog/ \
  binlog.000999
```

This command fetches binlogs in raw binary format and waits for new events after reaching the end of the current log. Unlike a replication replica, `mysqlbinlog` does not automatically reconnect after a disconnect, so production scripts need process supervision, alerts, and restart handling.

For continuous binlog copying, also consider:

- The account used for remote binlog access needs replication privileges. MySQL 8.4 documents `REPLICATION SLAVE` for `--read-from-remote-server`; requirements may vary by version, so check the current documentation when creating the account.
- `--stop-never` keeps `mysqlbinlog` connected to the source using a server ID. Set `--connection-server-id` explicitly in production to avoid conflicts with replicas or other `mysqlbinlog` processes.
- In `--raw` mode, files named after the source binlogs are written to the current directory and may overwrite existing files. Use `--result-file` to set a separate directory or prefix, and monitor its permissions and capacity.
- If the source encrypts binlogs, copies retrieved by `mysqlbinlog` are stored unencrypted at the backup destination. Use TLS for transmission, and encrypt the backup directory with access and deletion controls.

## Physical Backups with XtraBackup

Logical backups export SQL; physical backups copy MySQL data and log files. Physical backups become more advantageous as data grows: backup and restore are closer to file copying and do not require replaying large numbers of `INSERT` statements.

Percona XtraBackup is a commonly used open-source physical backup tool. It can back up InnoDB and XtraDB data while MySQL is running, making it useful for production hot backups. However, hot backup support mainly applies to transactional engines such as InnoDB. Percona notes that copying non-InnoDB data locks InnoDB tables, so assess the impact on instances using multiple storage engines.

A minimal full backup:

```bash
xtrabackup --backup --target-dir=/data/backups/mysql/base
```

The backup cannot be started immediately. Prepare it first to bring the data files to a consistent state:

```bash
xtrabackup --prepare --target-dir=/data/backups/mysql/base
```

`--prepare` applies redo and undo information to make the backup files consistent. Do not interrupt this step. If you will apply incremental backups afterward, follow Percona's instructions and use `--apply-log-only` to preserve the state before uncommitted transactions are rolled back.

To restore, stop MySQL and make sure the target `datadir` is empty:

```bash
systemctl stop mysqld

mv /var/lib/mysql /var/lib/mysql.bak.$(date +%F-%H%M%S)
install -d -o mysql -g mysql /var/lib/mysql

xtrabackup --copy-back --target-dir=/data/backups/mysql/base

chown -R mysql:mysql /var/lib/mysql

systemctl start mysqld
```

The commands are straightforward; version compatibility is the main risk. Percona documents that XtraBackup 8.4 supports only MySQL 8.4 and Percona Server for MySQL 8.4, not MySQL 8.0 or 9.x. For MySQL 8.0, check the support matrix for the XtraBackup 8.0 series. Do not assume versions are compatible because their numbers look close.

XtraBackup also supports incremental backups based on a full backup:

```bash
xtrabackup \
  --backup \
  --target-dir=/data/backups/mysql/inc1 \
  --incremental-basedir=/data/backups/mysql/base
```

The prepare order, merge process, and restore steps for incremental chains are easy to get wrong. Until the team has practiced them, first ensure that full physical backups plus binlogs can be restored, then add incremental backups if data volume and backup windows require them.

For PITR after an XtraBackup restore, use the recorded starting point rather than guessing. The backup directory's `xtrabackup_binlog_info` file records the binlog filename and position:

```bash
cat /data/backups/mysql/base/xtrabackup_binlog_info
```

After restoring the full physical backup, use `mysqlbinlog` to replay later logs from that position.

## Choosing Between Logical and Physical Backups

Choose based on data volume, recovery targets, and operational experience.

| Scenario                                                                    | Suitable method                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Small or test databases, single-table exports, cross-environment migrations | `mysqldump`                                                   |
| Need to inspect or edit backup contents                                     | `mysqldump`                                                   |
| Medium-scale logical migration with parallel import and export              | MySQL Shell Dump Utilities                                    |
| Large database, short recovery window, mostly InnoDB tables                 | XtraBackup or MySQL Enterprise Backup                         |
| Point-in-time recovery                                                      | Full backup + binlog                                          |
| Managed cloud database                                                      | Prefer provider snapshots or PITR, then verify with an export |

Keep tool selection practical. `mysqldump` works well for small databases and is easy to script and troubleshoot. As data grows, SQL restore times become more significant, making physical backups a practical choice.

One of the worst approaches is relying on a single backup type without ever testing a restore.

## How to Run a Restore Drill

A successful backup script only proves that a file was created. A restore drill proves whether it is usable.

A minimal drill:

1. Prepare an isolated machine and install the same major MySQL version.
2. Retrieve the latest full backup and its binlogs. Verify access to decryption keys, accounts, certificates, and object storage.
3. Restore the full backup and record the time.
4. Replay binlogs to the target time and record the time.
5. Verify key table counts, business queries, stored procedures, events, triggers, accounts, roles, and privileges.
6. Check `charset`, `collation`, `time_zone`, `sql_mode`, read-only settings, and network isolation to prevent live traffic from reaching the restored instance.
7. Connect the application to the restored instance and run read-only smoke checks.
8. Record the actual RTO, recovery point, failed steps, and manual actions.

Do not stop verification at confirming that MySQL starts. Check at least the following:

```sql
-- Row counts in key tables
SELECT COUNT(*) FROM order_db.orders;

-- Most recent write time
SELECT MAX(created_at) FROM order_db.orders;

-- Stored procedures and functions
SHOW PROCEDURE STATUS WHERE Db = 'order_db';
SHOW FUNCTION STATUS WHERE Db = 'order_db';

-- Events
SHOW EVENTS FROM order_db;

-- Triggers
SHOW TRIGGERS FROM order_db;

-- Accounts, roles, and privileges
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'app_user'@'%';

-- Key environment settings
SELECT
  @@character_set_server,
  @@collation_server,
  @@time_zone,
  @@sql_mode,
  @@read_only,
  @@super_read_only;
```

Prioritize reconciliation, transaction history, and inventory tables. Restore drills should expose problems early, such as missing objects, missing binlog files, unrecoverable privileges, or unexpectedly long imports.

## Common Misconceptions

**Myth 1: A replica removes the need for backups.**

A replica can take over traffic, but cannot protect against accidental changes. Once incorrect SQL is replicated, the replica is affected too. A delayed replica may provide time to respond, but it does not replace an offline backup.

**Myth 2: Back up data but not binlogs.**

This limits recovery to the time of the full backup. Writes made afterward are lost, so the backup interval determines the RPO.

**Myth 3: Store backups on the database server.**

A disk failure, site outage, or accidental directory deletion can destroy both. Copy backups to separate storage; critical systems should consider another site or object storage.

**Myth 4: Backup scripts do not need failure alerts.**

Old files in a backup directory do not prove the latest backup succeeded. Check the exit code, file size, timestamp, and checksum, and alert someone on failure.

**Myth 5: Restores do not need testing.**

Untested backups seem convenient until an incident makes them costly. The longer restore steps go untested, the more likely version, privilege, path, disk space, or tool option issues will block recovery.

**Myth 6: A valid checksum proves a backup can be restored.**

A checksum only suggests that a file was not corrupted during copying or storage. It does not prove that SQL can be imported, a physical backup can start, privilege objects are complete, or the binlog chain is continuous. Restore drills demonstrate recoverability.

**Myth 7: Anyone can modify or delete backup files.**

If backups share production credentials or routine scripts can overwrite or delete them, accidental deletion, ransomware, or a script bug could destroy both. Critical systems should keep at least one versioned or immutable copy across accounts and failure domains, with deletion restricted.

## A Practical Baseline

If you do not have an existing plan, start here:

- For small databases that mainly use InnoDB, run a daily full backup with `mysqldump --single-transaction --routines --events --triggers --source-data=2`. Retain backups for 7–30 days and retain binlogs for at least the same period.
- For larger datasets, run full XtraBackup backups daily or weekly. Add incremental backups if write volume and backup windows require them; back up binlogs separately.
- Calculate checksums after backup, then copy files to separate storage. For critical systems, keep another encrypted, versioned, or immutable copy in a separate account.
- Monitor the latest usable full backup, latest archived binlog, binlog continuity, and archive process health.
- Run a restore drill at least monthly, and before major sales events, migrations, or version upgrades for critical systems.
- Maintain a recovery runbook with owners, backup locations, decryption steps, restore commands, binlog starting-point lookup, isolated recovery setup, validation queries, and rollback instructions.

These intervals are starting points, not universal rules. Financial, order, payment, and medical systems usually have stricter RPO/RTO requirements; internal reporting and log analytics may allow more flexibility. Set the backup strategy according to business impact, not an online template.

## References

- [MySQL Reference Manual：mysqldump](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
- [MySQL Reference Manual：mysqlbinlog](https://dev.mysql.com/doc/refman/8.4/en/mysqlbinlog.html)
- [MySQL Reference Manual：Using mysqlbinlog to Back Up Binary Log Files](https://dev.mysql.com/doc/refman/8.4/en/mysqlbinlog-backup.html)
- [MySQL Reference Manual：Point-in-Time Recovery](https://dev.mysql.com/doc/refman/8.4/en/point-in-time-recovery-binlog.html)
- [MySQL Reference Manual：Binary Logging Options and Variables](https://dev.mysql.com/doc/refman/8.4/en/replication-options-binary-log.html)
- [MySQL Shell 8.4：Instance Dump Utility, Schema Dump Utility, and Table Dump Utility](https://dev.mysql.com/doc/mysql-shell/8.4/en/mysql-shell-utilities-dump-instance-schema.html)
- [MySQL Shell 8.4：Dump Loading Utility](https://dev.mysql.com/doc/mysql-shell/8.4/en/mysql-shell-utilities-load-dump.html)
- [MySQL Reference Manual：MySQL Releases: Innovation and LTS](https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html)
- [Percona XtraBackup 8.4 Documentation](https://docs.percona.com/percona-xtrabackup/8.4/index.html)
- [Percona XtraBackup 8.4：Prepare a full backup](https://docs.percona.com/percona-xtrabackup/8.4/prepare-full-backup.html)
- [Percona XtraBackup 8.4：Index of files created by Percona XtraBackup](https://docs.percona.com/percona-xtrabackup/8.4/xtrabackup-files.html)
- [Percona XtraBackup 8.0 Supported Versions](https://docs.percona.com/percona-xtrabackup/8.0/supported-versions.html)

<!-- @include: @article-footer.snippet.md -->
