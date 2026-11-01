---
title: "Virtual Memory: Address Translation, TLBs, Page Faults, and Page Replacement"
description: Common virtual memory interview topics, from process isolation and virtual-to-physical address translation to segmentation, paging, multilevel page tables, TLBs, page faults, page replacement, Belady's anomaly, mmap, COW, and JVM huge pages.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Memory Management
head:
  - - meta
    - name: keywords
      content: virtual memory,virtual address,physical address,MMU,page table,multilevel page table,TLB,page fault,page replacement,CLOCK algorithm,Belady's anomaly,mmap,COW,operating system interview questions
---

When you open a task manager, you may see something counterintuitive: each process appears to have a large amount of its own memory. Addresses in different processes may look similar, but the processes do not interfere with each other. A browser, IDE, and database can run at the same time, each appearing to have a clean, continuous, private address space.

This works because the operating system adds a translation layer.

Programs use virtual addresses. The kernel and hardware together decide where those addresses map in physical memory. Virtual memory explains how this translation works, how processes stay isolated, and how the system can move some data to disk when physical memory is limited.

## What If There Were No Virtual Memory?

Consider a simple example. Many people have used a microcontroller, where there may be no complex operating system and the CPU accesses physical addresses directly. If two programs run at once, they can overwrite each other's data: program A writes to address 2000, and program B happens to store data at the same address.

Both programs refer directly to the same physical address space, so neither is isolated from the other.

The operating system adds a layer of protection by giving each process its own **virtual addresses**. A process works only with its virtual addresses and does not need to know which physical memory locations back them. The operating system manages that mapping.

This gives us two terms:

- An address used by a program is a **virtual address**.
- An address that identifies a location in RAM is a **physical address**.

When a process accesses a virtual address, the CPU's memory management unit (MMU) translates it to a physical address using the mapping. The same virtual address in two processes can map to entirely different physical addresses.

![Different processes can map the same virtual address to different physical pages through the MMU and page tables](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-virtual-physical-mapping.png)

The benefits of virtual memory can be summarized in three points:

- **Process isolation:** Each process has its own page tables and cannot directly access another process's physical memory.
- **Address spaces larger than physical memory:** Programs have locality, so pages that are not currently needed can be stored on disk and brought back later. A process can therefore appear to have more memory than the machine has in RAM.
- **A uniform, continuous address space:** Each process sees a continuous range of virtual addresses, while its physical pages can be scattered in RAM. The mapping connects them.

The central question is how virtual addresses map to physical addresses. Two classic approaches are **segmentation and paging**.

## How Does Segmentation Work?

Segmentation was introduced early and follows a programmer's intuition. A program contains logical regions such as code, data, stack, and heap, each with different permissions and lifetimes. Segmentation divides memory into these regions.

A segmented virtual address contains a **segment selector** and an **offset within the segment**.

The selector is stored in a segment register. Its segment number indexes a segment table containing the segment's base address, limit (length), and privilege level.

Translation is straightforward: use the segment number to find the base address, then check that the offset does not exceed the segment limit. In a model using segmentation without paging, the physical address is the base plus the offset. For example, segment 3 with base address 7000 and offset 500 maps to physical address 7500. If paging is enabled too, this calculation produces a linear address that must then be translated through the page tables.

![Segmented address translation using the segment number and offset](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-segmentation.png)

Segmentation lets programs avoid dealing directly with physical addresses, but has two main drawbacks.

**First, it causes external fragmentation.** Segments have variable lengths, so scattered gaps can appear between them. Suppose physical memory contains four segments: A uses 256 MB, B uses 128 MB, C uses 256 MB, and D uses 128 MB. If B and D are freed, there are 256 MB free in total, but C separates it into two 128 MB regions. A new 200 MB contiguous segment will not fit.

**Second, compaction is expensive.** To combine scattered free space into one region, the system must move active segments and lay them out contiguously. If moving them also involves swapping segments to disk and back, that adds substantial I/O. Moving large variable-sized regions is costly and can stall the system.

The core difficulty is that segments are large and variable in size, making fragmentation and compaction hard to control.

## How Does Paging Work?

Paging divides virtual and physical memory into fixed-size units called **pages** and **page frames**. A common default page size on Linux is 4 KB.

Page tables map virtual pages to physical page frames, and the MMU performs the translation. The basic steps are:

- Split the virtual address into a page number and an offset within the page.
- Look up the physical page-frame number using the page number.
- Combine the frame number with the offset to form the physical address.

![Paging translates a virtual page number and offset to a physical page frame](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-paging.png)

Fixed-size pages avoid the gaps between variable-sized segments, so paging largely **eliminates external fragmentation** caused by contiguous allocation. The tradeoff is internal fragmentation: even a process that uses only a few bytes of a page occupies the whole page. This waste is usually manageable and easier to handle than external fragmentation.

Paging also uses a smaller unit for reclaim. When physical memory is low, the operating system can move less-used pages to disk (Swap Out) and bring them back when needed (Swap In), instead of moving a whole variable-sized segment.

Paging does not guarantee low disk pressure. A large number of major page faults or thrashing can still overwhelm a system with page-level I/O.

Programs also do not need to load every page into memory at startup. The system can prepare virtual-to-physical mappings and load a page only when the program accesses it. This is the basis of **demand paging**.

## Segmented Paging: Combining Both Approaches

Segmentation and paging can be combined. **Segmented paging** first divides a program into logical segments, then divides each segment into fixed-size pages. An address contains a segment number, a page number within that segment, and an offset. Each process has a segment table, and each segment has a page table; the segment-table entry points to the start of that page table.

The tradeoff is more address-translation work. A translation may require three memory accesses:

1. Read the segment table to find the page table.
2. Read the page table to find the physical page frame.
3. Access the requested data using the frame and offset.

Some history explains why Linux on x86 appears to use both segmentation and paging. Intel introduced segmented memory management with the 80286 and added paging with the 80386. Paging sits on top of segmentation: a logical address is translated through segmentation into a linear address, often called a virtual address, and paging translates that into a physical address. Linux has to work with this hardware design.

32-bit x86 Linux typically uses a flat memory model: the main code and data segments have a base of zero, so logical and linear addresses have the same numeric value, and paging handles most memory management. In x86-64 long mode, the role of CS, SS, DS, and ES segmentation is largely reduced, though FS and GS can still use nonzero bases. They are commonly used for thread-local storage and per-CPU kernel data.

## Why Is a Single-Level Page Table Not Enough?

The first practical problem with paging is space.

For a 32-bit address space with 4 KB pages (`2^12` bytes), each process has 4 GB of virtual address space and about one million (`2^20`) pages. With 4-byte page-table entries, one process's page table takes 4 MB.

That may not sound huge, but **each process has its own page table**. A hundred processes would need 400 MB just for page tables. The cost is greater in a 64-bit address space.

A single-level page table must also cover the whole virtual address space. Even if a process uses only a small part of that space, it still needs entries for all of it, most of them empty.

## How Do Multilevel Page Tables Save Space?

Multilevel page tables solve this by **creating lower-level tables only for address ranges that are actually used**.

For a 32-bit address space with 4 KB pages, divide the million page-table entries into levels. A first-level page directory has 1024 entries, each pointing to a second-level table with 1024 entries. Together, these cover the million entries.

Does an extra level use more memory? If the entire 4 GB virtual address space is mapped, it can. In practice, a process usually uses only part of it. The first-level table covers the whole space but takes just 4 KB; second-level tables are created only when needed.

For example, if 20% of first-level entries are in use, the page tables use `4 KB + 20% × 4 MB`, or about 0.804 MB. That is much less than a 4 MB single-level table. The saving comes from locality: programs usually access only a small region of their address space at a given time.

Two levels are not enough for a 64-bit address space. Linux's generic page-table abstraction currently defines five levels:

- Page Global Directory (PGD)
- Page 4th Directory (P4D)
- Page Upper Directory (PUD)
- Page Middle Directory (PMD)
- Page Table Entry (PTE)

![Multilevel page tables use PGD, PUD, PMD, and PTE levels, creating lower-level tables only for used ranges](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-multi-level-page-table.png)

On x86-64 systems using four-level hardware paging, the P4D level is folded and does not take part in address translation. That is why you may hear about “four-level page tables,” even though Linux defines five levels.

Most x86-64 systems use four-level paging with 48-bit virtual addresses, covering 256 TB. A typical 64-bit address is split into 16 sign-extension bits, then 9 bits each for PGD, PUD, PMD, and PTE (512 entries per level), and a 12-bit page offset for a 4 KB page. Each page-table entry is 8 bytes, so 512 entries occupy 4 KB, exactly one page.

For a larger address space, x86-64 provides five-level paging (LA57), expanding the canonical linear address from 48 to 57 bits and supporting up to 52 physical address bits. Linux has supported five-level paging since version 4.14 (2017); whether it is enabled depends on the CPU and kernel configuration. Intel's third-generation Xeon Scalable processors (Ice Lake server, released in 2021) support 57-bit virtual and 52-bit physical addresses. Linux documentation notes that five-level paging can provide up to 56 bits of user virtual address space. To avoid breaking programs that use high pointer bits for tagging, the kernel does not normally allocate addresses above 47 bits unless an application explicitly requests a high address. Four-level paging remains more common on ordinary machines.

## What Does the TLB Do?

Multilevel page tables save memory but can take more time to look up. A 64-bit system may need to check four levels. If every memory access also required four or five page-table accesses, the cost would be high.

Locality helps here too. Programs tend to reuse a small set of pages over short periods. The CPU caches frequently used page-table entries in hardware called the **TLB (Translation Lookaside Buffer)**, which is part of the MMU.

When translating an address, the CPU checks the TLB first:

- **TLB hit:** It gets the physical page number immediately and skips the multilevel page-table walk.
- **TLB miss:** It reads the page tables in memory, then caches the result in the TLB for future accesses.

![The CPU checks the TLB first and walks the multilevel page table on a miss](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-tlb-cache.png)

Because programs repeatedly access a set of hot pages, the TLB hit rate is often high. It absorbs much of the lookup cost introduced by multilevel page tables.

## What Happens During a Page Fault?

Demand paging means a virtual page may not yet be in physical memory when a process accesses it. If the MMU cannot complete address translation or a permission check, the CPU raises a Page Fault and transfers control to the kernel's page-fault handler. Some Chinese materials call it a “page-fault interrupt,” but architecturally it is a synchronous exception caused by the current memory-access instruction, not a hardware interrupt from a device.

The handling path is:

1. The CPU looks up the virtual address and raises a Page Fault when translation or permission checks cannot be completed.
2. The kernel checks whether the access is valid. An invalid address, such as a wild pointer, causes a segmentation fault; the process is usually terminated.
3. For a valid access, the kernel finds a free physical page frame. If none is available, it reclaims or replaces a victim page. A clean file page can be discarded and read from the file again; a dirty file page must be written back; an anonymous page may be written to Swap if Swap is enabled. Whether disk writes are needed depends on the page type and whether it is dirty.
4. The kernel reads the requested page from a file or Swap, updates the page table to point to the physical frame, then returns.
5. The CPU retries the instruction that caused the fault, which can now complete.

![Page Fault handling checks access, allocates or replaces a frame, updates the page table, and retries the instruction](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-page-fault.png)

Linux performance statistics distinguish two main types of page faults, exposed as `ru_minflt` and `ru_majflt` by `getrusage`:

- **Minor Page Fault:** The page is already in physical memory, but the current process has not yet mapped it, as can happen with a shared library. A COW page copy is also usually counted as a minor fault because it does not need to read from disk. The cost is relatively low.
- **Major Page Fault:** The page is not in memory and must be read from a file or Swap, which is more expensive.

An invalid address, such as a wild pointer, also raises a page-fault exception and enters the kernel. The kernel usually responds with `SIGSEGV`. This is an error path, not a third performance category alongside minor and major faults.

If physical memory is extremely tight and the system spends most of its time swapping pages in and out instead of doing useful work, it is in **thrashing**.

## Page Replacement: Which Page Should Be Evicted?

When physical memory is full and a new page must be loaded, the system must choose a page to evict. A good choice reduces future faults; a poor one evicts a page that is needed again immediately.

Common algorithms include:

**OPT (optimal replacement):** Evict the page that will not be accessed for the longest time. It has the fewest faults in theory, but requires knowing the future, so it is used only as a reference point.

**FIFO (first in, first out):** Keep pages in a queue and evict the one that entered memory first. It is simple, but can evict a hot page just because it has been in memory for a long time.

**LRU (least recently used):** Evict the page that has gone the longest without an access. It uses locality: a recently accessed page is likely to be used again. Its behavior can be close to OPT, but exact implementation is expensive. The system must maintain timestamps or update a list on each access.

**CLOCK (second chance):** An approximation of LRU that avoids its high cost. Each page has a reference bit, and pages form a circular queue. When replacing a page, the pointer checks its bit: if it is 1, the page gets a second chance, the bit is cleared, and the pointer moves on. A page with a clear bit is evicted. This approximates recent use with one bit and a circular scan.

![CLOCK replacement uses a circular queue and reference bit R to give pages a second chance](https://oss.javaguide.cn/github/javaguide/cs-basics/operating-system/virtual-memory-clock-algorithm.png)

**LFU (least frequently used):** Track how often each page is accessed and evict the least frequent one. It tracks frequency rather than recency, so a page that was hot earlier may keep a high count long after it stops being useful. Implementations often use aging to reduce old counts.

| Algorithm | Eviction rule                                 | Cost                    | Behavior             | Practical use                    |
| --------- | --------------------------------------------- | ----------------------- | -------------------- | -------------------------------- |
| OPT       | Page whose next use is farthest in the future | Cannot be implemented   | Theoretical optimum  | Reference only                   |
| FIFO      | Page that entered memory first                | Very low                | May evict a hot page | Implementable                    |
| LRU       | Least recently accessed                       | High (timestamps/list)  | Close to OPT         | Exact software version is costly |
| CLOCK     | Reference bit and circular scan               | Low                     | Approximates LRU     | Common approximation             |
| LFU       | Fewest accesses                               | Medium (needs counters) | Workload-dependent   | Often combined with aging        |

These are textbook algorithms for understanding replacement. Linux does not simply choose among OPT, FIFO, LRU, and CLOCK. It uses mechanisms such as active and inactive LRU lists, workingset detection, and refault tracking. File and anonymous pages have different reclaim behavior, also affected by NUMA, cgroups, and memory watermarks. Saying “Linux uses CLOCK” is imprecise.

## Belady's Anomaly: Can More Memory Make Things Slower?

It seems that more physical page frames should mean fewer page faults. FIFO is a counterexample: **in some cases, adding frames increases the number of page faults**. This is Belady's anomaly, identified by László Bélády in the 1960s.

The classic reference string `1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5` produces:

- 9 faults with 3 page frames.
- 10 faults with 4 page frames.

Adding a page frame increased the number of faults by one.

FIFO does not have the **stack property**: the set of resident pages with `n` frames is not necessarily a subset of the resident pages with `n + 1` frames. Without that inclusion relationship, adding a frame can cause a different page to be evicted.

An algorithm with the stack property has replacement priorities independent of the number of frames. OPT and LRU have this property, so adding frames cannot increase their fault counts. FIFO does not. Whether LFU can exhibit Belady's anomaly depends on its frequency-counting and tie-breaking rules, so it cannot be called immune in general.

Classic CLOCK is also not guaranteed to have LRU's strict stack property. In an extreme case where all reference bits are set, CLOCK can behave like FIFO. So its approximation of LRU does not guarantee immunity to Belady's anomaly. In short: FIFO has reference strings that trigger the anomaly; OPT and LRU do not; and the result for CLOCK and LFU depends on their exact definitions.

The main lesson is that Belady's anomaly is a property of some non-stack algorithms, including FIFO. If adding memory appears to reduce performance, investigate the replacement policy before suspecting faulty memory hardware.

## How Do These Ideas Apply to Real Systems?

Virtual memory appears in many systems beyond operating system textbooks.

**`mmap` and zero-copy:** `mmap()` maps a file into a process's virtual address space, so reading the file becomes memory access. The file is not loaded immediately when the mapping is created; accessing a page triggers a fault and loads it on demand. This can avoid one copy from a kernel buffer to a user buffer, which is why `mmap` is often used in zero-copy designs.

**Redis memory and fragmentation:** Redis is an in-memory database, but its allocations still occupy physical pages. Its allocator, jemalloc by default, allocates from size classes and can waste some space. This resembles page-level internal fragmentation because the allocation unit can exceed actual use, but the allocator is in user space while paging is an operating system mechanism; they are not the same kind of fragmentation. Redis persistence also forks a child process and uses copy-on-write (COW): parent and child initially share physical pages, and a page is copied when one writes to it.

**The JVM heap:** A heap requested by the JVM is part of virtual address space. A large heap expands the range covered by page tables. Huge pages, such as 2 MB pages, can reduce page-table entries and TLB pressure, which may help reduce memory-access overhead during garbage collection. GC scans can jump between objects and have poor locality, increasing cache and TLB misses. They cause more page faults only if the relevant pages are not resident, have been reclaimed, or the system is under memory pressure. This is one reason to consider TLB behavior when tuning a large heap.

Virtual memory sits between hardware page tables and TLBs, and higher-level systems such as databases, JVMs, and zero-copy frameworks. Although it is a low-level concept, it often appears in performance issues.

## How to Explain This in an Interview

If asked “Why do we need virtual memory?”, do not stop at “for isolation.” You can start with this:

Programs use virtual addresses rather than actual RAM addresses. When the CPU accesses memory, the MMU uses page tables to translate a virtual address to a physical address. Each process therefore appears to have its own continuous memory, even though the same numeric address in two processes can map to different physical memory.

Then add the benefits: processes cannot modify one another's data, programs do not need to know where physical memory is located, and the operating system can allocate memory on demand, swap pages, and use COW to avoid unnecessary copying.

If asked what paging solves, compare it with segmentation. Segmentation divides memory into logical regions such as code, data, and stack. Their variable lengths can cause external fragmentation and make compaction difficult. Paging divides virtual and physical memory into fixed-size pages. Page tables record the mapping from virtual page numbers to physical frames. This largely eliminates external fragmentation, though some space inside a page may be wasted as internal fragmentation.

You can mention that multilevel page tables save memory, not make lookups faster: unused address ranges do not need lower-level tables.

For the TLB and page faults, explain the fast path and exception path. The CPU checks the TLB first and gets the physical page number on a hit. On a miss, it walks the multilevel page table. If the page-table entry says the page is not in memory, the CPU raises a Page Fault. The kernel checks whether the access is valid, allocates a frame if appropriate, reclaims an old page if necessary, and loads the page from a file or Swap. It then updates the page table and retries the instruction.

A minor fault usually needs no disk I/O; a major fault does. An invalid address usually results in `SIGSEGV`.

There is no need to memorize every page-replacement algorithm. The key idea is to evict a page that will not be needed soon. OPT is ideal but impractical; LRU approximates it at high cost; CLOCK approximates LRU using reference bits; FIFO is simple but can exhibit Belady's anomaly. Linux does not directly use one textbook algorithm; it approximates reclaim with active/inactive LRU lists, workingset detection, and refault tracking.
