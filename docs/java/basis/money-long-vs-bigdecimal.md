---
title: Should Java Represent Money with long or BigDecimal?
description: A guide to representing money in Java, comparing long for storing minor currency units with BigDecimal for precise calculations, rounding, overflow, conversions, and database fields.
category: Java
tag:
  - Java Fundamentals
  - Monetary Calculations
head:
  - - meta
    - name: keywords
      content: Java monetary types,long for money,Long in cents,BigDecimal calculations,monetary precision,rounding,DECIMAL,BIGINT
---

In a discussion about monetary field types, I saw several different answers: some recommended storing cents in a `Long`, others said to use `BigDecimal` for interest and exchange rates, and some suggested passing strings through APIs.

These answers address different concerns. Storing cents in a `Long` is about how to store money; using `BigDecimal` for interest and exchange rates is about how to calculate it; passing a string through an API is usually just a data format choice.

Use `long` to store an amount when its smallest unit is fixed. Use `BigDecimal` for calculations that need decimal precision or an explicit rounding rule. A system can use both types.

Throughout this article, the `long` approach means storing an integer number of minor currency units. Java calculations usually use the primitive type `long`; use the wrapper type `Long` when a null value is meaningful.

| Comparison           | `long`                                                      | `BigDecimal`                                          |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Representation       | Integer in a fixed minor unit                               | Decimal value with a `scale`                          |
| Common uses          | Orders, balances, and settled amounts in a known minor unit | Discounts, taxes, interest, and exchange rates        |
| Main risks           | Unit confusion, silent overflow, inflexible precision       | Construction, rounding rules, and `scale` differences |
| Common database type | `BIGINT`                                                    | `DECIMAL(p, s)`                                       |

## Why Not Use double for Money?

`double` and `float` store binary floating-point values. Many decimal fractions with a finite number of digits become repeating binary fractions, so the closest representable value is used instead.

```java
double a = 1.0;
double b = 0.9;

System.out.println(a - b);
// 0.09999999999999998

System.out.println(0.1 + 0.1 + 0.1);
// 0.30000000000000004
```

This issue is not specific to Java; it affects languages that use IEEE 754 binary floating point. Monetary calculations usually require explicit decimal precision and rounding rules, which approximate values cannot reliably provide.

`new BigDecimal(0.1)` exposes the approximate value stored in the `double`:

```java
System.out.println(new BigDecimal(0.1));
// 0.1000000000000000055511151231257827021181583404541015625
```

This is why you shouldn't create a monetary value from a `double`. Converting an already-approximate value to `BigDecimal` doesn't restore the original decimal fraction.

## When to Use long

If the business stores Chinese yuan to the nearest fen, 19.99 yuan can be stored as 1,999 fen. Addition and subtraction use integers and don't introduce decimal rounding errors.

```java
long priceCents = 1_999L;
long shippingCents = 500L;
long totalCents = Math.addExact(priceCents, shippingCents);
```

Use `long` for values that have already been rounded to their smallest unit, such as order totals, account balances, and payment amounts. The corresponding database type can be `BIGINT`.

Include the unit in the database column name to make its meaning clear:

```sql
CREATE TABLE orders (
    id           BIGINT PRIMARY KEY,
    amount_cents BIGINT NOT NULL
);
```

With a name like `amount`, the value 100 could mean 100 yuan or 100 fen. `amount_cents = 100` makes the unit clear.

**What should you watch for when using long?**

Storing all amounts in fen fixes the precision at two decimal places. Intermediate results for exchange rates, interest, taxes, or usage-based billing may need four, six, or more decimal places; don't calculate those directly in fen.

Also guard against overflow. Regular `+` and `*` operations don't report overflow. For monetary calculations, consider `Math.addExact()`, `Math.subtractExact()`, and `Math.multiplyExact()`:

```java
long subtotalCents = Math.multiplyExact(unitPriceCents, quantity);
long balanceCents = Math.subtractExact(currentBalanceCents, paymentCents);
```

Check intermediate multiplication results too. A final amount below `Long.MAX_VALUE` doesn't guarantee that each step in `unit price × quantity × multiplier` avoids overflow.

A multi-currency system can't assume that every currency has two decimal places. Pair an amount with its currency. The number of digits in the minor unit depends on the currency or business rules; it can't be inferred from a standalone `long` value.

## When to Use BigDecimal

Discounts, taxes, interest, and currency conversions often produce intermediate values with more decimal places than the currency's minor unit.

`BigDecimal` represents decimal values using an arbitrary-precision integer and a `scale`. It can retain these intermediate values until you round them at the point required by the business rules.

```java
BigDecimal price = new BigDecimal("19.99");
BigDecimal discountRate = new BigDecimal("0.95");

BigDecimal discountedPrice = price.multiply(discountRate);
// 18.9905
```

Construct monetary constants from strings. Convert string values received through an API directly to `BigDecimal`, and map database `DECIMAL` columns directly to `BigDecimal`. There's no need to convert them to `double` along the way.

**What if `divide()` produces a repeating decimal?**

Specify the number of decimal places and a rounding mode.

This example keeps two decimal places and uses `HALF_UP`. Calling `a.divide(b)` without a rounding rule throws `ArithmeticException`.

```java
BigDecimal a = new BigDecimal("10");
BigDecimal b = new BigDecimal("3");

System.out.println(a.divide(b, 2, RoundingMode.HALF_UP)); // 3.33
```

`BigDecimal` is immutable, so assign each operation's result to a new or existing variable. The first call to `add()` below doesn't capture the result, so `amount` remains `10.00`:

```java
BigDecimal amount = new BigDecimal("10.00");

amount.add(new BigDecimal("2.00"));
System.out.println(amount); // Still 10.00

amount = amount.add(new BigDecimal("2.00"));
System.out.println(amount); // 12.00
```

Use `compareTo()` to compare monetary values. `equals()` also compares the `scale`, so it returns `false` for 1.0 and 1.00:

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("1.00");

System.out.println(a.equals(b));         // false
System.out.println(a.compareTo(b) == 0); // true
```

This difference also affects `HashMap` and `HashSet`. If you use `BigDecimal` as a key, normalize the `scale` first; otherwise, 1.0 and 1.00 are treated as separate keys.

## Can You Use long and BigDecimal Together?

Yes. For example, to calculate the price of three items at 19.99 yuan each with a 0.95 discount, use `BigDecimal` for the calculation, then convert the final payment to a `long` number of fen:

```java
BigDecimal unitPrice = new BigDecimal("19.99");
BigDecimal discountRate = new BigDecimal("0.95");
long quantity = 3L;

BigDecimal payable = unitPrice
        .multiply(BigDecimal.valueOf(quantity))
        .multiply(discountRate)
        .setScale(2, RoundingMode.HALF_UP);

long payableCents = payable
        .movePointRight(2)
        .longValueExact();
```

The calculation produces a `payable` value of `56.97`; `movePointRight(2)` converts it to `5697`. `longValueExact()` accepts only integers within the `long` range and throws `ArithmeticException` if a nonzero fractional part remains or the value is out of range.

Don't use `longValue()` for monetary conversion; it discards the fractional part:

```java
long amount = new BigDecimal("19.99").longValue();
System.out.println(amount); // 19
```

If input amounts must have at most two decimal places, use `RoundingMode.UNNECESSARY` to validate them:

```java
public static long toCentsExact(BigDecimal amount) {
    return amount
            .setScale(2, RoundingMode.UNNECESSARY)
            .movePointRight(2)
            .longValueExact();
}

public static BigDecimal fromCents(long cents) {
    return BigDecimal.valueOf(cents, 2);
}
```

The value `19.9` can be padded to `19.90`; `19.999` throws an exception instead of being silently truncated or rounded.

If the payment API accepts fen, send `5697`. If it accepts a string in yuan, send `payable.toPlainString()`. Keep conversion code in the API adapter and avoid switching types or units during business calculations.

## Should the Database Use BIGINT or DECIMAL?

When Java uses `long` to store minor units, use `BIGINT` for the database column. When Java uses `BigDecimal`, use `DECIMAL(p, s)`.

```sql
CREATE TABLE settlement_detail (
    id               BIGINT PRIMARY KEY,
    payable_cents    BIGINT        NOT NULL,
    exchange_rate    DECIMAL(18, 8) NOT NULL,
    settlement_amount DECIMAL(18, 2) NOT NULL
);
```

MySQL treats both integers and `DECIMAL` as exact-value types. In `DECIMAL(18, 2)`, 18 is the total precision and 2 is the scale. Choose enough precision for the business's maximum amount instead of using the same size for every monetary field.

Don't rely on MySQL to round values when writing to a `DECIMAL` column. Round or validate the value with `setScale()` in Java before saving it so the stored value matches the calculation.

Whether to use `DEFAULT 0` for a monetary column depends on its meaning. A missing amount isn't always the same as zero, and a default can hide missing data. `NOT NULL` is often useful; choose a default based on the domain rules.

## Summary

Use `long` for amounts that have been rounded to a fixed minor unit. Use `BigDecimal` for calculations involving discounts, taxes, interest, or exchange rates that need decimal precision. Specify the scale and `RoundingMode` when rounding.

You can use both types in one system: keep `BigDecimal` during calculations, then shift the decimal point according to the currency's minor unit and use `longValueExact()` for the final integer amount. Include units in field names, check integer operations for overflow, and centralize type and unit conversions in API or database adapters.
