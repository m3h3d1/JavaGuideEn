---
title: "Operating System Filesystems: Inodes, VFS, Page Cache, and Journaling"
description: Common filesystem interview topics, from files and directories to inodes, dentries, file descriptors, VFS, block allocation, free-space management, hard and symbolic links, Page Cache, fsync, and journaling filesystems.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Linux
head:
  - - meta
    - name: keywords
      content: filesystems,operating system filesystems,filesystem interview questions,Linux filesystem,inode,dentry,VFS,file descriptor,hard link,symbolic link,Page Cache,fsync,ext4,journaling filesystem,operating system interview questions
---

A simple file-saving interface might take a path, `open` a file, `write` the data, then `close`. With few files, little concurrency, and no machine failures, this seems straightforward.

Interview follow-ups quickly complicate the picture. What does the fd returned by `open()` point to? Is the filename stored in the inode? Why do two hard links refer to the same content? Does a successful `write()` mean the data is on disk? Why can `df -h` still show a full disk after a log file is deleted?

These questions involve the filesystem. It resolves paths to file objects, locates the data block that contains a file's Nth byte, and handles permissions, caching, deletion, renaming, and crash recovery.

The key concepts are inode, dentry, VFS, Page Cache, and journaling. Let's start with what a filesystem manages.

## What Does a Filesystem Manage?

When writing code, we see paths, filenames, directories, `read`, and `write`. A filesystem on a local block device works with logical blocks, sectors, and device I/O, organizing these low-level resources into files, directories, and metadata.

Not every filesystem is backed by a local disk. `tmpfs` primarily uses memory, `procfs` exposes kernel state, and NFS connects a remote filesystem to the local directory tree. VFS provides a common file interface over these implementations.

A filesystem does more than store file contents. It handles four main tasks:

![Overview of filesystem responsibilities](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-system-responsibilities.webp)

- **Naming:** Find a file by path and filename, such as `/var/log/app.log`.
- **Organization:** Use a directory tree to group files.
- **Location:** Map the Nth byte of a file to a data block on a disk or SSD.
- **Protection:** Record permissions, owners, and timestamps, and check them during access.

Without a filesystem, applications would have to track which blocks belong to each file and implement deletion, growth, permissions, and crash recovery themselves. A filesystem provides a common interface, so applications can read and write through file descriptors.

This article focuses on Linux/Unix-style filesystems. NTFS, APFS, Btrfs, XFS, and ext4 differ in implementation, but all must address files, directories, metadata, caching, allocation, and recovery.

## What Are Files and Directories?

In Unix/Linux, a regular file can be viewed as a sequence of bytes with a name and metadata, usually stored on persistent storage. VFS also exposes directories, devices, FIFOs, sockets, and pseudo-filesystem objects through similar file interfaces.

“Everything is a file” is best understood as Linux making different resources accessible through file descriptors and common I/O interfaces. It does not mean every object is stored on disk. Pipe data lives in kernel buffers, and much of `/proc` is generated dynamically by the kernel.

A directory is also a file, but its data has a special format. In Unix-style filesystems such as ext4, directory data mainly maps filenames to inode numbers. To resolve a path, the filesystem walks the directory tree one component at a time:

```text
/home/guide/a.txt
  -> look up the root directory /
  -> find home
  -> enter home and find guide
  -> enter guide and find a.txt
```

The directory tree organizes files. Mounting attaches multiple filesystems to this tree. For example, after mounting `/dev/sda2` at `/data`, accessing `/data/app.log` accesses a file on that filesystem.

Directories have data blocks and inodes too, but user-space programs generally do not read a directory like a regular file. They use directory traversal interfaces such as `readdir()` and `getdents()`.

## How Are Inodes, Dentries, and Filenames Related?

Understanding inodes is central to Linux/Unix filesystems.

An **inode** stores file metadata, commonly including file type, permissions, owner, size, timestamps, link count, and references to data blocks.

An inode usually does not store a filename. Names belong to directory entries, so one inode can have multiple filenames. Regular-file data usually lives in separate data blocks or extents, with the inode storing the mapping. Some filesystems support inline data; ext4, for example, can store a very small file's contents or a short symbolic-link target directly in the inode.

Linux VFS also keeps dentries in memory. A dentry represents a component in a path and caches name lookups. It usually points to an inode, but it can also be a negative dentry representing a name that does not exist. A simplified view:

- **Filename:** Stored in a directory entry on disk.
- **Dentry:** In-memory path component and lookup cache maintained by VFS.
- **Inode:** Represents a filesystem object and stores or links to its metadata and data mapping.
- **Data blocks or extents:** Store regular-file contents.

This is also why renaming a file is usually fast. When `mv a.txt b.txt` happens within one filesystem, the filesystem often changes a directory entry; it does not move the file contents.

![Relationship between filenames, dentries, and inodes](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-inode-dentry-relation.webp)

Use these commands to inspect the information:

```bash
# Show inode numbers
ls -li app.log

# Show file metadata
stat app.log

# Show filesystem inode usage
df -i
```

On filesystems such as ext4 that create an inode table in advance, inodes can run out before data blocks. A server may have free disk space but still fail to create files with `No space left on device` if many small files have exhausted the inode supply. Inode allocation varies by filesystem, so interpret `df -i` accordingly.

## What Happens When You `open` a File?

When an application calls `open()`, the kernel does not read the whole file into memory. It generally:

1. Resolves the path to directory entries and an inode.
2. Checks permissions, open flags, and file type.
3. Creates a kernel open-file object that records the file offset and status flags.
4. Allocates the smallest available nonnegative integer in the process's file descriptor table: the fd.

The Linux man-pages explain that `open()` returns an index in the process's file descriptor table. Each `open()` also creates a system-wide open file description that records the file offset and status flags.

These structures are easy to confuse:

![From a path to a file descriptor](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-path-to-fd.webp)

| Structure             | Scope                 | What it records                                  |
| --------------------- | --------------------- | ------------------------------------------------ |
| File descriptor table | One per process       | References from fds to open-file objects         |
| Open-file object      | System-wide           | Current offset, open state, and read/write flags |
| Inode table/cache     | Filesystem and kernel | File metadata and data-block locations           |

After `dup()` or `fork()`, multiple fds may refer to the same open-file object and therefore share the file offset. If two processes call `open()` separately on the same file, they usually get distinct open-file objects with separate offsets.

This explains why a process can keep writing to a file after it has been deleted by name. `unlink()` removes the directory name and decrements the inode's link count. The data blocks are reclaimed only after the last hard link has been removed and all open-file, memory-mapping, and other kernel references have been released.

## How Are Files Stored on Disk?

Disks and SSDs usually read and write data in blocks. A filesystem divides a partition or volume into blocks and manages them with metadata structures. An ext-family filesystem may contain:

- **Superblock:** Filesystem-wide information such as block size, inode count, free-block count, and mount state.
- **Inode area:** Inodes.
- **Data area:** Regular-file and directory contents.
- **Bitmaps or other free-space structures:** Which inodes and data blocks are in use.

Textbooks commonly describe contiguous, linked, and indexed file allocation. These models help explain design tradeoffs.

**Contiguous allocation** stores a file in a sequence of adjacent blocks. Sequential and random access are straightforward because the start block and length locate the data. File growth is difficult, and repeated creation and deletion can leave external fragmentation.

**Linked allocation** allows file blocks to be scattered, with each block pointing to the next. It is easy to extend a file but poor for random access: reading block 1000 may require following pointers from block 1. FAT stores these pointers in a file allocation table, which improves some lookups but creates metadata that must also be maintained.

**Indexed allocation** stores the addresses of a file's data blocks in an index block. To read block `i`, the filesystem looks up entry `i` and then reads the corresponding data block. This supports random access and avoids the external fragmentation of contiguous allocation, at the cost of extra index storage.

Classic ext2/ext3 use direct block pointers and single-, double-, and triple-indirect blocks to locate file data. ext4 usually uses an extent tree. An extent records a logical start, physical start, and length for a run of contiguous physical blocks. For a large contiguous file, this needs much less mapping metadata than storing an address for every block.

![Methods for locating file data blocks](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-block-allocation.webp)

Other modern filesystems combine B-trees, extents, delayed allocation, copy-on-write, and other techniques. Direct and indirect block pointers are not a universal design for modern filesystems.

## How Is Free Space Managed?

When a file is deleted, its blocks must be returned to the filesystem. When a file is written, the filesystem needs to find available blocks. Common approaches include:

- **Free-space table:** Record the start and length of each contiguous free region. Useful for contiguous allocation, but the table becomes complex as fragmentation increases.
- **Free list:** Link free blocks together. Simple for allocating and freeing individual blocks, but finding a contiguous region is difficult.
- **Bitmap:** Use one bit per block, with 0 for free and 1 for used. A bitmap can be scanned to find contiguous free blocks with manageable space overhead.
- **Grouped linking:** Store a group of free-block addresses in one block and link it to the next group. This was common in early Unix systems.

Bitmaps are common. A 1 TiB filesystem with 4 KiB blocks has `2^28` blocks. One bit per block needs about 32 MiB. This is a reasonable cost for tracking block state clearly.

Real filesystems also use allocation policies to reduce fragmentation. They may place files in one directory and extents from a large file near each other to improve sequential reads. SSDs do not have mechanical seek delays, but sequential writes, write amplification, erase blocks, and TRIM still affect performance and lifetime.

## What Problem Does VFS Solve?

Linux supports many filesystems, including ext4, XFS, Btrfs, tmpfs, procfs, and NFS. Applications cannot implement separate functions such as `open_ext4()` and `open_xfs()` for each one.

VFS (Virtual File System) is the abstraction layer between applications and concrete filesystem implementations. Applications use common operations such as `open`, `read`, `write`, and `close`; VFS forwards them to the implementation for the target file.

The Linux VFS documentation describes these objects:

- **superblock:** Represents a mounted filesystem.
- **inode:** Represents an object in a filesystem, such as a regular file, directory, or FIFO.
- **dentry:** Represents a directory entry in a path and usually points to an inode.
- **file:** Represents an open file and is the kernel object behind an fd.

With VFS, `cat /proc/cpuinfo`, `cat /var/log/app.log`, and reading a file on NFS use the same user-space interfaces. The differences are handled by the concrete filesystem implementations below VFS.

## How Do Hard Links and Symbolic Links Differ?

Both kinds of link let a path refer to a file, but they point to different things.

| Property                         | Hard link                                                                         | Symbolic link                                  |
| -------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| Refers to                        | The same inode                                                                    | Another path                                   |
| Creates a new inode?             | No new inode for the target; adds a directory entry and increments its link count | The link is a separate file with its own inode |
| After removing the original name | Data remains while another hard link exists                                       | May become a dangling link                     |
| Can cross filesystems?           | No                                                                                | Yes                                            |
| Can link directories?            | Linux does not allow ordinary hard links to directories                           | Yes                                            |

![Hard links and symbolic links](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-hardlink-symlink.webp)

Hard links cannot cross filesystems because an inode number is meaningful only within its filesystem. Another filesystem has its own inode table, so the same number does not identify the same file.

Try these commands:

```bash
echo hello > a.txt
ln a.txt hard.txt
ln -s a.txt soft.txt

ls -li a.txt hard.txt soft.txt
```

`a.txt` and `hard.txt` have the same inode number; `soft.txt` has a different one. After deleting `a.txt`, `hard.txt` can still read the contents, while `soft.txt` refers to a path that no longer exists.

## Why Does Page Cache Affect File I/O Performance?

Direct disk access is slow, so Linux uses **Page Cache** to keep some file data in memory.

When reading a file, the kernel can copy data directly from memory if the requested page is already in Page Cache. Otherwise, it reads the page from disk into Page Cache and then returns the data to the application.

For buffered I/O on regular files, a successful `write()` usually means the kernel accepted the data, often placing it in Page Cache as a dirty page. It does not guarantee that the entire request was written or that the data is persistent on the device. Callers must handle partial writes and check errors from `fsync()`, `fdatasync()`, and `close()` when durability matters.

`fdatasync()` synchronizes file data and metadata needed for subsequent data reads, such as file size. `fsync()` synchronizes file data and a broader set of associated metadata. This describes ordinary buffered I/O; paths such as `O_DIRECT`, `O_SYNC`, and DAX change the details.

The tradeoff is crash risk. If the machine loses power after a process writes a file, writes that already returned successfully may not have reached persistent storage. Stronger durability requires `fsync()`, `fdatasync()`, or open flags with synchronous semantics, which make the application wait for storage and can reduce throughput.

One easily missed point: `fsync(fileFd)` synchronizes the file itself, but may not persist a filename change in its parent directory. To make a new directory entry durable after file creation, `rename()`, or `unlink()`, open the parent directory and call `fsync()` on its fd too.

A common safe replacement sequence is to create a temporary file in the same directory, write the complete contents, call `fsync()` on the temporary file, atomically replace the target with `rename()`, then call `fsync()` on the parent directory. A same-filesystem `rename()` atomically changes the name, but an atomic namespace operation is not automatically durable across a power failure.

Databases, message queues, and logging systems all deal with this. Some try to persist each transaction commit; others accept a short window of possible data loss in exchange for throughput. The right choice depends on the recovery point the application can tolerate.

![File write and persistence path](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/file-write-persistence.webp)

## How Do Journaling Filesystems Reduce Crash Damage?

A crash during a filesystem update can leave inconsistent structures. Creating a file, for example, may require allocating an inode and data blocks, then updating a directory entry and bitmaps. A power failure after only some of these updates can leave the filesystem inconsistent.

A journaling filesystem first writes planned metadata changes to a journal, then updates their final locations. During recovery, it scans the journal and replays fully committed transactions that were not completely written back. Transactions without a commit record or with a failed checksum are discarded. Journaling aims to prevent filesystem structures from being left half-updated.

ext4 documents three data modes:

- **`data=writeback`:** Journals metadata only and does not ensure related data blocks are written before metadata. It is often faster, but after a crash a newly written file may contain old data.
- **`data=ordered`:** The default mode. Related data blocks are written to the main filesystem before metadata is committed to the journal. The file data itself is not journaled, but this reduces the risk of metadata pointing to unwritten data.
- **`data=journal`:** Writes both data and metadata to the journal before their final locations. This provides stronger crash consistency for journaled data, at the cost of write amplification and performance.

Journaling protects filesystem structure; it does not guarantee that an application will never lose business data. Applications still need to use `fsync()` correctly and handle renames, temporary files, and directory synchronization.

## Where Should You Look When Filesystem Performance Is Poor?

Do not focus only on disk capacity. These checks are often useful.

**Check whether inodes are exhausted:**

```bash
df -i
```

With many small files, inodes may run out before disk capacity.

**Check for file descriptor leaks:**

```bash
ulimit -n
cat /proc/<pid>/limits
lsof -p <pid>
ls /proc/<pid>/fd | wc -l
```

When a service reports `Too many open files`, check its fd limit and current fd count, then look for unclosed connections, log files, and temporary files. Distinguish `EMFILE`, which means the current process reached its fd limit, from `ENFILE`, which means the system-wide number of open files reached its limit.

In multithreaded programs, prefer atomic close-on-exec options such as `O_CLOEXEC` when creating fds. This prevents descriptors from leaking to a new program after `exec()`.

**Check Page Cache and memory pressure:**

```bash
free -h
vmstat 1
```

These commands help assess cache size, memory pressure, paging, and I/O activity, but do not directly report the Page Cache hit rate. Linux uses free memory for cache, so a large `buff/cache` value is not necessarily bad. Look for application I/O waits, heavy writeback, and repeated cache reclaim due to memory pressure.

To inspect cached pages for specific files, newer Linux versions provide `cachestat()`. eBPF-based tools such as `cachestat` may also help, but assess their collection overhead before using them in production.

**Check whether a disk is busy:**

```bash
iostat -x 1
```

For traditional serial devices, a sustained `%util` near 100% may indicate a busy device. For NVMe SSDs, RAID, and other devices that process requests in parallel, `%util` is not a direct measure of saturation. Also examine `await`, `r_await`, `w_await`, `aqu-sz`, throughput, IOPS, and application latency.

**Investigate when `df` is full but `du` cannot find a large file:**

```bash
lsof +L1
ls -l /proc/<pid>/fd
```

`du` walks named files in directories, while `df` reports blocks allocated by the filesystem. If a large log has been `unlink()`ed while a process still has it open, it no longer appears in directory traversal, so `du` misses it. The blocks are not released yet, so `df` still reports high usage. Usually, ask the process to reopen its log or restart the service normally. Do not perform unverified destructive operations on `/proc/<pid>/fd/*`.

Filesystem behavior varies with filesystem type, kernel version, mount options, and hardware caching. For example, Linux `O_DIRECT` has alignment requirements that vary by filesystem and kernel. For performance analysis, check the current `mount` options and `uname -a`, and use `fio` or a representative workload instead of relying only on textbook rules.

## How to Explain Filesystems in an Interview

If asked “What is a filesystem?”, explain that it organizes storage blocks as files and directories. It manages names, directories, metadata, data-block allocation, free space, permissions, caching, and crash recovery.

For Linux, add inode, dentry, file, and superblock. Filenames are stored in directory entries; inodes contain file metadata and data-block mappings. `open()` resolves a path and checks permissions before returning an fd. The fd refers to an open-file object, and reads and writes go through VFS to the concrete filesystem.

If asked about hard and symbolic links, say that multiple directory entries for hard links point to the same inode, while a symbolic link is a separate file whose contents are a target path.

If asked why data can be lost after a successful write, explain Page Cache and writeback: `write()` usually means the data entered the kernel cache, not that it is persistent. Stronger durability requires `fsync()`, journaling, and a correct write order.
