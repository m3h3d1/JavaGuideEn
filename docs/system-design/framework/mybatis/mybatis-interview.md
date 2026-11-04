---
title: MyBatis Interview Questions and Answers
description: MyBatis execution, Mapper proxies, parameter binding, dynamic SQL, result mapping, caches, batching, plugins, and Spring transactions.
category: Frameworks
icon: "mdi:database-outline"
tag:
  - MyBatis
head:
  - - meta
    - name: keywords
      content: MyBatis interview questions,MyBatis execution,Mapper proxies,#{} and ${},dynamic SQL,first-level cache,second-level cache,pagination,BatchExecutor,MyBatis plugins
---

> This guide was originally compiled from online materials whose sources can no longer be verified. This revision is based primarily on the MyBatis 3.5.x and MyBatis-Spring documentation, with additional coverage of frequently asked questions about caching, batching, Spring transactions, and large result sets.

## MyBatis Fundamentals

### What Is MyBatis, and Why Is It Called a Semi-Automatic ORM?

MyBatis is a persistence framework. It handles repetitive JDBC tasks such as creating connections, setting parameters, executing SQL, iterating over result sets, and closing resources. Developers still write SQL and map parameters and query results to Java objects.

MyBatis is often called a semi-automatic ORM because developers usually control SQL, column mappings, and relationship queries. ORMs such as Hibernate/JPA focus more on generating SQL from entity relationships and mapping metadata, while MyBatis leaves SQL in the developer's hands.

This design suits projects with complex SQL, strict optimization needs, or extensive use of database-specific features. The trade-off is more SQL and mapping code, with developers responsible for dialect migration, relationship loading, and batch operations.

### How Does MyBatis Differ from JPA/Hibernate?

| Comparison         | MyBatis                                                                   | JPA/Hibernate                                                 |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SQL                | Usually written by the developer                                          | Usually generated from mappings                               |
| Control            | Precise control over SQL, indexes, and database-specific features         | Focuses more on the object model and persistence state        |
| Development effort | More SQL and mapping code                                                 | Less code for routine CRUD operations                         |
| Database migration | Handwritten SQL may depend on a specific dialect                          | Standard queries are generally more portable                  |
| Relationships      | Explicit joins or nested queries                                          | Object relationships and fetch strategies                     |
| Common risks       | Scattered SQL, mapping errors, and injection through string concatenation | N+1 queries, over-fetching, and hard-to-control generated SQL |

No approach fits every project. JPA/Hibernate can reduce boilerplate when an application has many simple CRUD operations and a stable domain model. MyBatis can be a better fit for reports, complex queries, and SQL-heavy optimization. Different modules in one system can use different approaches.

### What Are the Core MyBatis Components?

- **`SqlSessionFactoryBuilder`:** Reads the configuration and creates a `SqlSessionFactory`. It can usually be discarded after construction.
- **`SqlSessionFactory`:** Creates `SqlSession` instances. It is relatively expensive to build, so applications usually keep one instance.
- **`SqlSession`:** Executes SQL, manages transactions, and provides Mapper instances. It is not thread-safe and should be scoped to a request, method, or transaction.
- **`Configuration`:** Holds runtime metadata, including global settings, `MappedStatement`, `ResultMap`, `TypeHandler`, and plugins.
- **`MappedStatement`:** Represents a mapped `<select>`, `<insert>`, `<update>`, or `<delete>` statement.
- **`Executor`:** Handles queries, updates, the first-level cache, and transaction-related calls.
- **`StatementHandler`:** Creates and operates on JDBC `Statement` objects.
- **`ParameterHandler`:** Sets parameters on a `PreparedStatement`.
- **`ResultSetHandler`:** Maps a JDBC `ResultSet` to Java objects.

`SqlSource` holds the SQL-generation logic. At execution time, it uses the parameters to create `BoundSql`, which contains the final SQL, parameter mappings, and additional parameters.

### Are `SqlSessionFactory`, `SqlSession`, and Mapper Thread-Safe?

Once built, a `SqlSessionFactory` can be shared across the application. A `SqlSession` contains mutable state such as a database connection, transaction, and first-level cache, so it must not be shared across threads. Mapper proxies obtained from a `SqlSession` have the same lifecycle restriction.

In MyBatis-Spring, injected Mappers are backed by `SqlSessionTemplate`. It is thread-safe, finds the `SqlSession` associated with the current Spring transaction, and manages its lifecycle, including commit, rollback, and closing. A singleton Spring service can inject a Mapper, but should not store a manually created native `SqlSession` in a singleton field.

### ⭐️How Do Mapper Interfaces Work?

MyBatis creates a JDK dynamic proxy for each Mapper interface. A Mapper method call follows this general path:

1. `MapperProxy` intercepts the interface method.
2. MyBatis builds the statement ID from the Mapper's fully qualified name and method name, for example, `com.example.UserMapper.selectById`.
3. `MapperMethod` analyzes the parameters and return type, then calls the corresponding `SqlSession` method, such as `selectOne()`, `selectList()`, or `insert()`.
4. `SqlSession` finds the `MappedStatement` for the statement ID and passes it to `Executor`.
5. `ResultSetHandler` maps query results, which are returned using the type declared by the Mapper method.

Mapper interfaces usually have no implementation class. The fully qualified interface name must match the XML `namespace`, and each method name must match a mapped statement's `id`.

### Can Mapper Interface Methods Be Overloaded?

Java allows overloaded Mapper methods, but MyBatis looks up mapped statements by fully qualified interface name and method name; parameter types are not included in the statement ID. An XML namespace also cannot contain two statements with the same `id`.

Overloaded methods can share a dynamic SQL statement in limited cases, but MyBatis cannot select different SQL based on parameter signatures as the Java compiler does. Parameter names, return types, and dynamic conditions can also conflict. Use distinct method names for distinct queries in application code.

### ⭐️What Happens When MyBatis Executes a Query?

The process has two phases: startup parsing and runtime execution.

At startup:

1. Read the MyBatis configuration and create `Configuration`.
2. Parse Mapper XML or annotations, registering SQL, parameter mappings, and result mappings as `MappedStatement`, `ResultMap`, and `SqlSource` objects.
3. Create the `SqlSessionFactory`; Spring applications also register Mapper proxies.

At runtime:

1. Call the Mapper proxy, which finds the `MappedStatement` by interface and method name.
2. `SqlSource` uses the arguments to create `BoundSql`.
3. `Executor` checks the first-level cache and queries the database on a cache miss.
4. `StatementHandler` creates a JDBC statement, and `ParameterHandler` sets its parameters.
5. JDBC executes the SQL, and `ResultSetHandler` maps the results to objects.
6. Results are cached according to the configuration and returned; the transaction is later committed or rolled back.

Plugins can wrap `Executor`, `StatementHandler`, `ParameterHandler`, and `ResultSetHandler`, allowing pagination, auditing, and SQL rewriting to participate in this flow.

## Parameters and Dynamic SQL

### ⭐️What Is the Difference Between `#{}` and `${}`?

In mapped SQL:

- `#{}` creates a JDBC `?` placeholder. MyBatis sets the value through `ParameterHandler` and `TypeHandler`. The value is sent as data to the database, which generally prevents SQL injection at that position.
- `${}` substitutes the expression result directly into the SQL text without creating a bound parameter. It can change a column name, table name, sort direction, or entire SQL fragment, so it creates an injection risk.

```xml
<select id="findByName" resultType="User">
  SELECT id, name
  FROM users
  WHERE name = #{name}
  ORDER BY ${orderBy}
</select>
```

Use `#{}` for `name`. If `orderBy` comes directly from a request, an attacker can alter the SQL. Map external values in Java code to server-defined column names and sort directions.

`${}` also appears in MyBatis configuration files, for example `${driver}` and `${url}`. This is configuration-property substitution, usually performed while parsing the configuration, and differs from dynamic text substitution in mapped SQL.

### How Do You Reference Multiple Mapper Method Parameters?

Use `@Param` to give parameters explicit names:

```java
User selectByTenantAndId(
    @Param("tenantId") Long tenantId,
    @Param("userId") Long userId
);
```

```xml
<select id="selectByTenantAndId" resultType="User">
  SELECT id, name
  FROM users
  WHERE tenant_id = #{tenantId}
    AND id = #{userId}
</select>
```

Without `@Param`, MyBatis provides generic names such as `param1` and `param2`. It can also use actual parameter names when the project is compiled with `-parameters` and `useActualParamName` is enabled. Since build configuration can change, `@Param` is more reliable for shared Mapper interfaces.

Collection parameters can be accessed through names such as `collection`, `list`, or `array`, depending on their type and `@Param`. For clarity, annotate a collection with `@Param("ids")` and reference it as `<foreach collection="ids">`.

### ⭐️Which Dynamic SQL Tags Does MyBatis Provide, and How Do They Work?

Common tags include:

- `<if>`: Adds SQL conditionally.
- `<choose>`, `<when>`, and `<otherwise>`: Select one branch from several options.
- `<trim>`, `<where>`, and `<set>`: Handle prefixes, suffixes, and extra `AND` operators or commas.
- `<foreach>`: Iterates over a collection, often for `IN` clauses and batch inserts.
- `<bind>`: Defines a variable for the current dynamic SQL statement.

MyBatis parses dynamic SQL XML into a composite tree of `SqlNode` objects. When a Mapper method runs, the nodes use the parameter context and OGNL expressions to decide which SQL to emit. `DynamicSqlSource` then produces the final `BoundSql`.

```xml
<select id="find" resultType="User">
  SELECT id, name, status
  FROM users
  <where>
    <if test="name != null and name != ''">
      name = #{name}
    </if>
    <if test="status != null">
      AND status = #{status}
    </if>
  </where>
</select>
```

`<where>` emits `WHERE` only when its body contains content and removes a leading `AND` or `OR`.

### Which Elements Are Commonly Used in Mapper XML?

- `<cache>` and `<cache-ref>`: Configure a second-level cache for the current namespace or reference another namespace's cache.
- `<resultMap>`: Defines mappings between result sets and objects.
- `<sql>` and `<include>`: Define and reuse SQL fragments.
- `<select>`, `<insert>`, `<update>`, and `<delete>`: Define mapped statements.
- `<selectKey>`: Queries a key before or after an insert.

Older references often mention `<parameterMap>`, but it is deprecated. Use inline parameter mappings instead.

An `<sql>` fragment can appear after the `<include>` that references it. MyBatis first collects and registers the current file's `<sql>` fragments before parsing its CRUD statements, so a fragment does not have to appear first. Unresolved references across resources are queued and retried after the relevant definitions load. Still, organize mapper files in the order recommended by the documentation, and avoid circular references and hard-to-maintain cross-file dependencies.

### Which Internal Objects Are Created from Mapper XML?

- Each `<select>`, `<insert>`, `<update>`, and `<delete>` is registered as a `MappedStatement`.
- Static SQL generally uses `RawSqlSource`; dynamic SQL generally uses `DynamicSqlSource`.
- At runtime, `SqlSource` creates `BoundSql`, containing the final SQL and its `ParameterMapping` list.
- `<resultMap>` is parsed into a `ResultMap`, with nested mappings represented as `ResultMapping` objects.
- `<cache>` creates and decorates a namespace-level cache instance.

These objects are stored in `Configuration`. Applications generally read this metadata at runtime; avoid changing the global `Configuration` dynamically.

## Result Mapping

### What Is the Difference Between `resultType` and `resultMap`?

`resultType` directly specifies the return type and suits simple queries where column names can be matched to property names. SQL aliases can help, for example, `user_name AS userName`.

`resultMap` explicitly maps columns to properties. It also supports constructor mappings, type handlers, discriminators, and nested `association` and `collection` mappings, making it suitable for complex objects and relationship queries.

```xml
<resultMap id="userMap" type="User">
  <id property="id" column="user_id" />
  <result property="userName" column="user_name" />
</resultMap>
```

Automatic mapping with `mapUnderscoreToCamelCase=true` maps `user_name` to `userName`. For complex joins, avoid relying too heavily on automatic mapping. Alias duplicate column names and configure them explicitly in `resultMap`.

### ⭐️What Is the Difference Between `association` and `collection`?

- `<association>` maps a to-one relationship, such as an order's user.
- `<collection>` maps a to-many relationship, such as a user's orders.

There are two common ways to load related objects:

1. **Nested results:** Use a join to retrieve the main and related objects in one query, then merge duplicate rows using mappings such as `<id>`. This reduces the number of SQL statements but may inflate the result set.
2. **Nested selects:** Query the main object first, then run another mapped statement for a related property. This is simple and supports lazy loading, but can cause N+1 queries.

When using a join to map a one-to-many relationship, configure `<id>` mappings for both parent and child objects. MyBatis uses them to reuse objects and assemble collections. Missing identifiers can increase mapping work or produce incorrect results.

### What Is the N+1 Query Problem, and How Can You Avoid It?

An N+1 query problem occurs when one query retrieves N parent records, then one additional query runs for each related object, for a total of 1 + N SQL statements. Nested selects and lazy loading can both cause it.

Common approaches include:

- Use a join with nested result mappings to load related data in one query.
- Load the parent records, batch-query related records by parent IDs, then assemble the objects in memory.
- In GraphQL or DataLoader-style applications, batch requests for related data.
- Use lazy loading only when few related properties are likely to be accessed, and monitor SQL counts.

More joins are not always better. Deep one-to-many relationships can cause a Cartesian product and greatly inflate the result set. Two batched queries may be easier to control.

### Does MyBatis Support Lazy Loading, and How Does It Work?

MyBatis can lazy-load `association` and `collection` properties configured with nested selects. When `lazyLoadingEnabled` is enabled, MyBatis uses a proxy to track unloaded properties. Accessing one triggers its mapped query and stores the result.

`fetchType="lazy"` or `fetchType="eager"` overrides the global setting for an individual relationship. MyBatis 3.5.x uses Javassist by default for lazy-loading proxies; CGLIB has been deprecated since 3.5.10.

Lazy loading has two common pitfalls: accessing collections can trigger N+1 queries, and accessing a property after its `SqlSession` or transaction has closed may fail. When returning DTOs from an API, it is often better to load the required data explicitly in the service layer.

### What Does `TypeHandler` Do, and How Are Enums Mapped?

`TypeHandler` converts between Java and JDBC types. It converts Java values to JDBC values when setting `PreparedStatement` parameters, and converts values back to Java when reading a `ResultSet`.

MyBatis uses `EnumTypeHandler` by default, storing the enum name, such as `ACTIVE`. `EnumOrdinalTypeHandler` stores the ordinal, but reordering enum constants can corrupt meaning, so ordinals are generally unsuitable as long-term database values.

Business enums often have a stable `code` field. A custom `BaseTypeHandler` can map between the code and enum value. Register it with the correct `javaType`, any required `jdbcType`, and null-handling behavior.

### How Do You Troubleshoot Missing or Incomplete Query Results?

Check the following in order:

1. Does the SQL return rows, and are the parameter values and JDBC types correct?
2. Do the `namespace`, statement ID, and Mapper method match?
3. Do column aliases match Java properties, and is the expected camel-case mapping enabled?
4. Are the `column`, `property`, `javaType`, and `typeHandler` settings in `resultMap` correct?
5. Are duplicate columns in joins overwriting one another? Are nested-result `<id>` mappings complete?
6. Are setters missing, constructor parameters mismatched, or Lombok-generated methods different from what you expect?
7. Did the first-level cache return an earlier result from the same `SqlSession`?

When enabling MyBatis SQL logging, inspect the final parameter values as well. SQL containing placeholders alone does not show the actual query conditions.

### What Happens If `selectOne()` Returns Multiple Rows?

`selectOne()` returns `null` when there are no rows, the object when there is exactly one row, and throws `TooManyResultsException` when there is more than one. It does not automatically return the first row.

If the result must be unique, enforce that with a unique constraint. Use ordering and `LIMIT 1` only when the business requirement explicitly allows selecting one row, such as the latest row. Do not use it to hide inconsistent data.

## MyBatis Caching

### ⭐️What Is the MyBatis First-Level Cache?

The first-level cache is local to a `SqlSession` and uses `SESSION` scope by default. Within one `SqlSession`, a query can reuse a cached result when its statement, final SQL, parameters, pagination, and environment produce the same cache key.

The first-level cache also handles circular references in nested result mappings. If `localCacheScope` is set to `STATEMENT`, the cache is used only during one statement execution and is not shared across queries.

The following operations invalidate or clear the relevant first-level cache:

- Execute `insert`, `update`, or `delete`.
- Call `clearCache()`.
- Commit, roll back, or close the `SqlSession`.
- Set `flushCache="true"` on a query statement.

### Why Might the First-Level Cache Seem Ineffective in a Spring Project?

The first-level cache belongs to the actual `SqlSession`. In Spring, `SqlSessionTemplate` reuses the `SqlSession` bound to the current transaction. Without a transaction, it closes the session after each Mapper call, so the next call may use a new session.

Therefore, two Mapper calls in one service method do not necessarily share a first-level cache unless they run in a Spring transaction. Do not extend a transaction solely to get cache hits; its duration should be determined by consistency requirements.

### ⭐️What Is the MyBatis Second-Level Cache, and How Do You Enable It?

The second-level cache belongs to a Mapper XML `namespace` and can be shared across `SqlSession` instances. The global `cacheEnabled` setting is on by default, but a namespace must still configure `<cache/>` or use `<cache-ref>` to reference another namespace's cache.

```xml
<mapper namespace="com.example.UserMapper">
  <cache />

  <select id="selectById" resultType="User" useCache="true">
    SELECT id, name FROM users WHERE id = #{id}
  </select>
</mapper>
```

Query results generally become visible to other sessions through the second-level cache after the transaction commits. By default, inserts, updates, and deletes in the namespace clear its cache. `useCache` and `flushCache` adjust this behavior for individual statements.

The default cache configuration may require result objects to be serializable. Third-party caches and changes to `readOnly` can alter object-copying and thread-safety behavior, so check the specific implementation.

### Why Should Production Systems Use the MyBatis Second-Level Cache Carefully?

- The cache is organized by `namespace`. If one Mapper changes a table used by another Mapper, the other namespace's cache is not automatically invalidated.
- MyBatis cannot detect changes made by another application, script, or direct SQL.
- A local second-level cache exists only in one application instance; multiple instances do not synchronize automatically.
- A join query depends on multiple tables, so a change to any of them can make the result stale.
- Large cached objects or low hit rates can consume memory with little benefit.

For cross-instance sharing and explicit invalidation, use an application-level cache such as Redis or Caffeine, with the database as the source of truth. MyBatis's second-level cache is better suited to queries over rarely changing data with clear dependencies and a read-heavy workload.

### Can the First-Level Cache Return Stale Data?

After the first query in a `SqlSession`, another transaction or application may update the database. A repeated query in the same session can still return the old object from the first-level cache. This is not a dirty read in the database-isolation sense, but the application may see stale data.

To fetch the latest external data, call `clearCache()`, shorten the session lifetime, set `localCacheScope` to `STATEMENT`, or run the query in a new transaction or session. Clearing the cache within a transaction does not guarantee visibility of another transaction's changes; database isolation still applies.

## Executors, Batching, and Plugins

### Which Executors Does MyBatis Provide?

| ExecutorType | Behavior                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `SIMPLE`     | Creates a new `PreparedStatement` for each execution; this is the default.                             |
| `REUSE`      | Reuses a `PreparedStatement` for the same SQL within the current `SqlSession`.                         |
| `BATCH`      | Reuses statements for updates and uses JDBC batching; batches are flushed before queries or at commit. |

All three executor types are scoped to a `SqlSession`. `REUSE` reuses statements, not query results; result reuse is handled by caches.

Select an executor with the global `defaultExecutorType`, `openSession(ExecutorType)`, or a `SqlSessionTemplate` constructor argument. Do not switch `ExecutorType` within one Spring transaction. If different types are required, use separate transactions or execute outside the transaction.

### ⭐️How Does MyBatis Execute Batch Operations?

Use `ExecutorType.BATCH`, call Mapper `insert`, `update`, or `delete` methods repeatedly, then call `flushStatements()` or commit the transaction. `BatchExecutor` groups operations by statement and SQL, then calls JDBC `addBatch()` and `executeBatch()`.

Keep the following in mind when batching:

- Do not accumulate an unlimited number of operations. Flush at fixed intervals and clear the session cache as needed.
- A query executed between updates flushes the pending batch.
- The return value of an individual Mapper call may not be the final affected-row count. Read batch results after flushing.
- When a `BatchUpdateException` occurs, the database may already have executed some statements. Consider transaction rollback and the driver's update counts.
- Multi-row `INSERT`, JDBC batching, and database bulk-load tools are different approaches with different performance and generated-key behavior.

With MyBatis-Spring, do not manually commit or close `SqlSessionTemplate`. Let Spring manage the transaction commit and rollback.

### Can Batch Inserts Populate Generated Keys?

If the database and JDBC driver support it, `useGeneratedKeys="true"` and `keyProperty` can populate auto-generated keys. For a list of objects, the driver must return a generated key for each row so MyBatis can assign them to the objects.

```xml
<insert id="batchInsert"
        useGeneratedKeys="true"
        keyProperty="id">
  INSERT INTO users (name, status)
  VALUES
  <foreach collection="list" item="item" separator=",">
    (#{item.name}, #{item.status})
  </foreach>
</insert>
```

Support varies by database, driver version, and batch SQL form. Verify the number and order of generated keys with integration tests. If JDBC generated keys are unreliable, generate UUIDs or Snowflake IDs in the application, or use `<selectKey>` where supported by the database.

### What Is the Difference Between `useGeneratedKeys` and `<selectKey>`?

- `useGeneratedKeys` uses JDBC `getGeneratedKeys()` and is commonly used with auto-increment primary keys.
- `<selectKey>` runs an additional query before or after the insert. It can be useful with sequences, database-specific functions, or legacy databases.

`keyProperty` specifies the Java property to populate; use `keyColumn` to specify the database column when needed. Test batch inserts, composite keys, and multiple data sources separately. A successful single-row insert does not guarantee the same behavior for batches.

### ⭐️How Does MyBatis Pagination Work, and How Do Pagination Plugins Work?

MyBatis provides `RowBounds`, but it does not automatically add `LIMIT` to SQL. By default, the original SQL runs and result-set processing skips `offset` rows and limits the returned count. With large data sets or a deep offset, this can read many unnecessary rows.

Production queries generally use one of these approaches:

- Write database-specific physical pagination directly in SQL.
- Use a pagination plugin such as PageHelper to rewrite SQL for the database dialect and generate a count query when needed.

Pagination plugins use the MyBatis plugin mechanism to intercept components such as `Executor` or `StatementHandler`. They read `MappedStatement`, `BoundSql`, and pagination parameters, then generate paginated SQL. Plugins must also handle dialects, parameter order, count queries, thread-context cleanup, and multiple data sources.

Deep pagination can scan and discard many rows even with `LIMIT offset, size`. Cursor pagination based on a stable sort key can help, for example `WHERE id > ? ORDER BY id LIMIT ?`.

### How Do MyBatis Plugins Work, and How Do You Write One?

MyBatis plugins can intercept specific methods on four types of components:

- `Executor`
- `StatementHandler`
- `ParameterHandler`
- `ResultSetHandler`

A plugin implements `Interceptor` and uses `@Intercepts` and `@Signature` to declare the target interface, method, and parameter types. When MyBatis creates a component, it calls `pluginAll()`. Matching objects are wrapped in JDK dynamic proxies, and calls to the target method enter `intercept()`.

```java
@Intercepts({
    @Signature(
        type = Executor.class,
        method = "update",
        args = {MappedStatement.class, Object.class}
    )
})
public class AuditInterceptor implements Interceptor {
    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // Perform only necessary work and ensure the original method is called.
        return invocation.proceed();
    }
}
```

Plugins run in the main execution path for every matching SQL statement. Keep them lightweight and avoid modifying shared `MappedStatement` objects. Execution order depends on configuration and proxy nesting; test plugins together when pagination, auditing, and data-permission plugins all rewrite SQL.

## Transactions, Performance, and Operations

### How Do Transactions Work in MyBatis-Spring?

MyBatis-Spring uses `SqlSessionTemplate` to bind a `SqlSession` to the current Spring transaction. Mapper calls using the same transaction and `SqlSessionFactory` share the same session and database connection. The transaction commits when the method completes normally and rolls back when an exception matching the rollback rules is thrown.

Common points to watch:

- Call `@Transactional` methods through a Spring proxy; self-invocation may bypass transaction interception.
- The transaction manager and `SqlSessionFactory` should use the same `DataSource`.
- Do not manually call `commit()`, `rollback()`, or `close()` on a Spring-managed `SqlSession`.
- An asynchronous thread does not automatically inherit the original thread's transaction.
- Catching an exception without rethrowing it may cause Spring to treat the method as successful.

### Why Did a Successful Mapper Call Not Commit Its Data?

Common causes include:

- A manually opened session does not auto-commit by default, and `commit()` was not called.
- The Spring transaction rolled back, or the method threw a runtime exception.
- `@Transactional` did not apply because of self-invocation, an object not managed by Spring, or method visibility.
- Writes and reads use different data sources, and replication to the read replica has not completed.
- A `BatchExecutor` batch was not flushed or the transaction was not committed.

Check transaction logs, the data source, the connection's auto-commit setting, and the final exception. Do not rely only on whether the Mapper method threw an error.

### How Do You Process Large Result Sets with MyBatis?

Returning a `List` loads all rows and mapped objects into memory. For large result sets, consider:

- Iterate through the results with `Cursor<T>`.
- Process each row in a `ResultHandler` callback.
- Fetch data in batches using a stable sort key.
- For exports, read and write incrementally with a bounded buffer.

`Cursor` depends on an open `SqlSession`, connection, and result set, so consume it within their lifecycle. `fetchSize` is only a hint to the JDBC driver; some databases also require specific cursor or connection settings. Streaming queries hold connections for longer, so set timeouts, limit concurrency, and avoid triggering N+1 queries in the loop.

### How Do You Troubleshoot MyBatis SQL Performance?

1. Capture the final SQL and actual parameters; check that dynamic conditions are correct.
2. Inspect the database execution plan, rows scanned and returned, sorting, and temporary tables.
3. Check indexes, implicit type conversions, function calls, wildcard searches, and deep pagination.
4. Look for N+1 queries, fetching too many columns, or batch operations reduced to one statement per row.
5. Separate connection-pool wait time, database execution, result transfer, and Java object mapping.
6. Check whether plugins, `TypeHandler`, logging, or caching add overhead.

MyBatis is only one part of the SQL execution path. A slow Mapper call does not necessarily mean the SQL is slow; the connection pool may be exhausted, the result set may be too large, or object mapping may consume substantial CPU.

### How Do You Prevent SQL Injection with MyBatis?

- Use `#{}` for values by default; never concatenate user input into SQL.
- Map table names, column names, and sort directions to fixed SQL fragments on the server.
- Use dynamic SQL only to include trusted fragments; do not evaluate user-provided expressions.
- Apply least privilege to database accounts to limit the impact of a successful injection.
- Review string concatenation in plugins and SQL providers as well.

Parameterized queries protect only the positions where parameters are used. `ORDER BY ${sort}`, `${tableName}`, and concatenated SQL returned by annotation-based providers still require allowlists.

### Can Different Mapper XML Files Reuse an `id`?

Yes, if the `namespace` values differ. A `MappedStatement` ID consists of `namespace + id`, for example:

```text
com.example.UserMapper.selectById
com.example.OrderMapper.selectById
```

The same complete ID cannot be registered twice in one namespace. When Mapper XML is paired with an interface, the `namespace` is usually the Mapper interface's fully qualified name.

### What Common MyBatis Mistakes Should You Avoid?

- Assuming MyBatis prevents SQL injection, while overlooking `${}`, providers, and string concatenation in plugins.
- Assuming overloaded Mapper methods can map to different statements with the same ID.
- Assuming `RowBounds` always performs database-side pagination.
- Treating the second-level cache as a consistent cross-application business cache.
- Storing a native `SqlSession` in a singleton object.
- Persisting enum ordinals and later changing the enum order.
- Accessing lazy properties in a loop and triggering N+1 queries.
- Assuming batch writes use JDBC batching without verifying driver behavior.
- Using `LIMIT 1` to hide a data-integrity issue that should be prevented by a unique constraint.

## References

- [MyBatis 3 documentation: Configuration](https://mybatis.org/mybatis-3/configuration.html)
- [MyBatis 3 documentation: Mapper XML Files](https://mybatis.org/mybatis-3/sqlmap-xml.html)
- [MyBatis 3 documentation: Dynamic SQL](https://mybatis.org/mybatis-3/dynamic-sql.html)
- [MyBatis 3 documentation: Java API](https://mybatis.org/mybatis-3/java-api.html)
- [MyBatis-Spring documentation: Using an SqlSession](https://mybatis.org/spring/sqlsession.html)
- [Discussion of overloaded MyBatis Mapper methods](https://github.com/Snailclimb/JavaGuide/issues/1122)

## Further Reading

- [An in-depth analysis of nine design patterns in MyBatis](https://juejin.cn/post/7273516671574687759)
- [Implementing a MyBatis encryption and decryption plugin from scratch](https://mp.weixin.qq.com/s/WUEAdFDwZsZ4EKO8ix0ijg)
- [A comprehensive guide to MyBatis](https://juejin.cn/post/7051910683264286750)
- [Concurrency issues in MyBatis](https://juejin.cn/post/7264921613551730722)

<!-- @include: @article-footer.snippet.md -->
