---
title: How InnoDB Implements MVCC
description: Understand InnoDB MVCC, including hidden columns, undo log version chains, Read Views, snapshot reads, and current reads.
category: Database
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MVCC, multi-version concurrency control, InnoDB, snapshot read, current read, Read View, undo log, hidden columns, transaction isolation
---

## Multi-Version Concurrency Control (MVCC)

MVCC is a concurrency control mechanism that preserves consistency and isolation while transactions read and write concurrently. InnoDB maintains multiple versions of each row. When a transaction modifies a row, InnoDB **updates the current row in place** and stores the **previous version in the undo log**. Other transactions use a **Read View** and the undo log version chain for snapshot reads, avoiding blocking reads on writes.

1. Read operations (`SELECT`):

Transactions use snapshot reads to avoid seeing changes that other transactions have not committed. In simplified terms:

- The transaction finds matching rows and selects a visible version.
- If a row has multiple versions, it selects the latest version visible to its snapshot.
- Concurrent changes do not affect the snapshot being read.

2. Write operations (`INSERT`, `UPDATE`, `DELETE`):

Write operations create a new row version:

- The transaction modifies the row and associates the change with its transaction ID.
- Other transactions use that ID to determine whether the version is visible.
- Previous versions remain available for snapshot reads.

3. Commit and rollback:

- Committed changes become visible to other transactions.
- Rolled-back changes are undone and remain invisible to other transactions.

4. Version cleanup:

MVCC periodically removes old versions that are no longer needed, preventing unbounded growth and reclaiming space.

MVCC uses row versions and snapshot reads for concurrency control. Reads use visible versions, while writes create new versions and preserve older ones as needed. This allows transactions to run concurrently while maintaining isolation and consistency.

## Consistent Nonlocking Reads and Locking Reads

### Consistent nonlocking reads

One way to implement [**consistent nonlocking reads**](https://dev.mysql.com/doc/refman/5.7/en/innodb-consistent-read.html) is to add a version or timestamp column and update it whenever the row changes. A query compares the visible version with the row's version to determine whether the row is visible.

In InnoDB, [multi-versioning](https://dev.mysql.com/doc/refman/5.7/en/innodb-multi-versioning.html) implements nonlocking reads. If another transaction is deleting or updating a row, the read does not wait for its row lock to be released. Instead, InnoDB reads a snapshot of the row, known as a **snapshot read**.

Under `Repeatable Read` and `Read Committed`, a plain `SELECT` (excluding `SELECT ... LOCK IN SHARE MODE` and `SELECT ... FOR UPDATE`) uses consistent nonlocking reads through MVCC. Under `Repeatable Read`, MVCC provides repeatable reads and prevents some phantom reads.

### Locking reads

The following are [**locking reads**](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html):

- `select ... lock in share mode`
- `select ... for update`
- `INSERT`, `UPDATE`, and `DELETE` operations

Locking reads return the latest row version, also called a **current read**, and lock the rows they read:

- `SELECT ... LOCK IN SHARE MODE`: Acquires an `S` lock. Other transactions can also acquire `S` locks; an `X` lock request is blocked.

- `SELECT ... FOR UPDATE`, `INSERT`, `UPDATE`, and `DELETE`: Acquire `X` locks, blocking other transactions from acquiring locks on those rows.

Consistent nonlocking reads can read a snapshot even when another transaction holds an `X` lock on the current row. Under `Repeatable Read`, MVCC prevents some phantom reads: a consistent read uses the Read View created by the first read, so rows inserted later are not visible. A current read always sees the latest data, so an insert between two reads can cause a phantom. **For current reads under `Repeatable Read`, InnoDB uses next-key locks to prevent inserts into the scanned gaps.**

## InnoDB's MVCC implementation

`MVCC` relies on **hidden columns, Read Views, and undo logs**. InnoDB uses a row's `DB_TRX_ID` and the Read View to determine visibility. If a version is not visible, `DB_ROLL_PTR` locates an earlier version in the undo log. Transactions can see different versions; within a transaction, reads see changes committed before its Read View was created, plus the transaction's own changes.

### Hidden columns

Internally, InnoDB adds three [hidden columns](https://dev.mysql.com/doc/refman/5.7/en/innodb-multi-versioning.html) to each row:

- `DB_TRX_ID` (6 bytes): The ID of the transaction that last inserted or updated the row. A `DELETE` is internally treated as an update that sets the `deleted_flag` in the record header.
- `DB_ROLL_PTR` (7 bytes): A rollback pointer to the row's undo log. It is null if the row has not been updated.
- `DB_ROW_ID` (6 bytes): Used to create the clustered index if no primary key or unique, non-null index is defined.

### Read View

```c
class ReadView {
  /* ... */
private:
  trx_id_t m_low_limit_id;      /* Transactions with IDs at or above this value are invisible. */

  trx_id_t m_up_limit_id;       /* Transactions with IDs below this value are visible. */

  trx_id_t m_creator_trx_id;    /* ID of the transaction that created this Read View. */

  trx_id_t m_low_limit_no;      /* Transaction number; undo logs below it can be purged. */

  ids_t m_ids;                  /* Active transactions when the Read View was created. */

  m_closed;                     /* Whether the Read View is closed. */
}
```

[`Read View`](https://github.com/facebook/mysql-8.0/blob/8.0/storage/innobase/include/read0types.h#L298) determines row visibility. It stores the other active transactions whose changes are currently invisible to this transaction.

Its main fields are:

- `m_low_limit_id`: The largest transaction ID seen so far plus one (the next ID to be assigned). Versions with IDs at or above this value are invisible.
- `m_up_limit_id`: The smallest transaction ID in the active transaction list, `m_ids`. If `m_ids` is empty, this equals `m_low_limit_id`. Versions with lower IDs are visible.
- `m_ids`: IDs of other active, uncommitted transactions when the Read View was created. Changes from these transactions remain invisible to this transaction. The list excludes the current transaction and committed transactions.
- `m_creator_trx_id`: ID of the transaction that created the Read View.

**Transaction visibility diagram** ([source](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/#MVCC-1)):

![trans_visible](./images/mvvc/trans_visible.png)

### Undo logs

Undo logs serve two main purposes:

- Restore data when a transaction rolls back.
- Support `MVCC`: if another transaction holds a row lock or the current version is invisible, a read can use an earlier version from the undo log.

**InnoDB uses two types of undo logs: `insert undo log` and `update undo log`.**

1. **`insert undo log`**: Created by an `INSERT`. Since inserted rows are visible only to the transaction that created them, this undo log can be discarded after commit without a purge operation.

**Initial row state during `INSERT`:**

![](./images/mvvc/317e91e1-1ee1-42ad-9412-9098d5c6a9ad.png)

2. **`update undo log`**: Created by an `UPDATE` or `DELETE`. It may be needed by MVCC, so it cannot be discarded at commit. It is added to the undo log list and later removed by the purge thread.

**After the first update:**

![](./images/mvvc/c52ff79f-10e6-46cb-b5d4-3c9cbcc1934a.png)

**After the second update:**

![](./images/mvvc/6a276e7a-b0da-4c7b-bdf7-c0c7b7b3b31c.png)

Updates to the same row, by one or more transactions, form an undo log chain. The head points to the latest version; the tail points to the oldest version.

### Visibility algorithm

A consistent read uses a snapshot (Read View). **The snapshot records the IDs of active (uncommitted) transactions**—in other words, the transactions whose changes should not be visible to this transaction (`m_ids`). When reading a row, InnoDB compares its `DB_TRX_ID` with Read View fields and the current transaction ID to determine visibility. Read View creation timing depends on the isolation level, as described below.

The [comparison algorithm](https://github.com/facebook/mysql-8.0/blob/8.0/storage/innobase/include/read0types.h#L161) is as follows ([diagram source](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/#MVCC-1)):

![](./images/mvvc/8778836b-34a8-480b-b8c7-654fe207a8c2.png)

1. If `DB_TRX_ID < m_up_limit_id`, the transaction that last modified the row committed before this snapshot was created, so the row is visible.

2. If `DB_TRX_ID >= m_low_limit_id`, the row was modified after this snapshot was created, so it is invisible. Continue at step 5.

3. If `m_ids` is empty, the transaction that modified the row committed before the snapshot was created, so the row is visible.

4. If `m_up_limit_id <= DB_TRX_ID < m_low_limit_id`, the transaction may have been active or committed when the snapshot was created. Search the ordered active transaction list `m_ids` (the source uses binary search).

   - If `DB_TRX_ID` is in `m_ids`, the transaction was uncommitted when the snapshot was created or modified the row afterward. The row version is invisible. Continue at step 5.

   - If it is not in the list, that transaction committed after modifying the row but before this snapshot was created, so the row is visible.

5. Follow the row's `DB_ROLL_PTR` to the previous version in the `undo log`. Restart at step 1 with that version's `DB_TRX_ID` until a visible version is found or no version remains.

## MVCC under RC and RR

Under `Read Committed` (`RC`) and `Repeatable Read` (`RR`, InnoDB's default isolation level), InnoDB uses MVCC for consistent nonlocking reads. The isolation levels differ in when they create a Read View:

- Under `RC`, a new Read View (`m_ids` list) is created before **each `SELECT`**.
- Under `RR`, a Read View is created only before the **first `SELECT`** after the transaction begins.

## How MVCC prevents non-repeatable reads

Both `RC` and `RR` use MVCC snapshots, but **their Read View creation timing differs**. Under `RR`, this provides repeatable reads.

For example:

![](./images/mvvc/6fb2b9a1-5f14-4dec-a797-e4cf388ed413.png)

### Read View creation under RC

**1. At time T4, the version chain for row `id = 1` is:**

![](./images/mvvc/a3fd1ec6-8f37-42fa-b090-7446d488fd04.png)

Under `RC`, each query creates a new Read View. Transactions 101 and 102 are still active, so transaction 103's Read View has **`m_ids: [101, 102]`**, `m_low_limit_id = 104`, `m_up_limit_id = 101`, and `m_creator_trx_id = 103`.

- The latest row has `DB_TRX_ID = 101`. Since `m_up_limit_id <= 101 < m_low_limit_id`, check `m_ids`; because 101 is present, this version is invisible.
- Follow `DB_ROLL_PTR` to the previous version. Its `DB_TRX_ID` is also 101, so it is invisible.
- The next version has `DB_TRX_ID = 1`, which is less than `m_up_limit_id`; it is visible. Transaction 103 reads `name = Caihua`.

**2. At time T6, the version chain is:**

![](./images/mvvc/528559e9-dae8-4d14-b78d-a5b657c88391.png)

Under `RC`, a new Read View is created. Transaction 101 has committed, but 102 is still active, so **`m_ids: [102]`**, `m_low_limit_id = 104`, `m_up_limit_id = 102`, and `m_creator_trx_id = 103`.

- The latest row has `DB_TRX_ID = 102`. Since `m_up_limit_id <= 102 < m_low_limit_id` and 102 is in `m_ids`, this version is invisible.

- The previous version has `DB_TRX_ID = 101`, which is less than `m_up_limit_id`, so it is visible. At T6, transaction 103 reads `name = Li Si`, unlike at T4; this is a non-repeatable read.

**3. At time T9, the version chain is:**

![](./images/mvvc/6f82703c-36a1-4458-90fe-d7f4edbac71a.png)

The new Read View has an empty **`m_ids`** because transactions 101 and 102 have committed. Thus `m_up_limit_id = m_low_limit_id = 104`. The latest version has transaction ID 102, so it is visible and the query returns `name = Zhao Liu`.

> **Summary:** Under `RC`, a new Read View is created for each query, which allows non-repeatable reads.

### Read View creation under RR

Under `RR`, a Read View (`m_ids` list) is created only for the first read after the transaction begins.

**1. At T4, the version chain is:**

![](./images/mvvc/0e906b95-c916-4f30-beda-9cb3e49746bf.png)

The current `SELECT` creates a Read View with **`m_ids: [101, 102]`**, `m_low_limit_id = 104`, `m_up_limit_id = 101`, and `m_creator_trx_id = 103`.

The visibility checks are the same as under `RC`:

- The latest row has `DB_TRX_ID = 101`. Since 101 is in `m_ids`, this version is invisible.
- The previous version also has `DB_TRX_ID = 101`, so it is invisible.
- The next version has `DB_TRX_ID = 1`, which is less than `m_up_limit_id`; it is visible. Transaction 103 reads `name = Caihua`.

**2. At time T6:**

![](./images/mvvc/79ed6142-7664-4e0b-9023-cf546586aa39.png)

Under `RR`, the existing Read View is reused: **`m_ids: [101, 102]`**, `m_low_limit_id = 104`, `m_up_limit_id = 101`, and `m_creator_trx_id = 103`.

- The latest row has `DB_TRX_ID = 102`. Since 102 is in `m_ids`, this version is invisible.

- The previous version has `DB_TRX_ID = 101`, so it is invisible.

- The next previous version also has `DB_TRX_ID = 101`, so it is invisible.

- The next version has `DB_TRX_ID = 1`, which is less than `m_up_limit_id`; it is visible. Transaction 103 reads `name = Cauliflower`.

**3. At time T9:**

![](./images/mvvc/cbbedbc5-0e3c-4711-aafd-7f3d68a4ed4e.png)

The situation is unchanged from T6. The existing Read View still uses **`m_ids: [101, 102]`**, so the query still returns `name = Caihua`.

## How MVCC and next-key locks prevent phantom reads

Under `RR`, InnoDB uses `MVCC` and `next-key locks` to prevent phantom reads:

**1. A plain `SELECT` uses an MVCC snapshot read.**

For snapshot reads under `RR`, the first query creates a Read View that remains in use until commit. Later updates and inserts from other transactions are invisible, providing repeatable reads and preventing phantom rows in snapshot reads.

**2. `SELECT ... FOR UPDATE`, `LOCK IN SHARE MODE`, `INSERT`, `UPDATE`, and `DELETE` use current reads.**

Current reads return the latest data. An insert by another transaction within the query range can therefore cause a phantom. InnoDB uses [next-key locks](https://dev.mysql.com/doc/refman/5.7/en/innodb-locking.html#innodb-next-key-locks) to prevent this: they lock both matching rows and the gaps between them, blocking inserts into the scanned range.

## References

- _InnoDB Storage Engine, 2nd Edition_
- [The relationship between InnoDB transaction isolation levels and locks](https://tech.meituan.com/2014/08/20/innodb-lock.html)
- [How MySQL transactions and MVCC implement isolation levels](https://blog.csdn.net/qq_35190492/article/details/109044141)
- [InnoDB transaction analysis: MVCC](https://leviathan.vip/2019/03/20/InnoDB%E7%9A%84%E4%BA%8B%E5%8A%A1%E5%88%86%E6%9E%90-MVCC/)

<!-- @include: @article-footer.snippet.md -->
