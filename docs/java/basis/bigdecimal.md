---
title: BigDecimal Explained
description: Learn to use BigDecimal for precise decimal arithmetic, including basic operations, rounding modes, comparisons, and financial calculations.
category: Java
tag:
  - Java Fundamentals
head:
  - - meta
    - name: keywords
      content: BigDecimal,floating-point precision,decimal arithmetic,RoundingMode,BigDecimal comparison,monetary calculations,precision loss
---

The _Alibaba Java Coding Guidelines_ recommends using `BigDecimal` for floating-point calculations to avoid precision loss.

Can floating-point calculations really lose precision? Yes.

For example:

```java
float a = 2.0f - 1.9f;
float b = 1.8f - 1.7f;
System.out.println(a);// 0.100000024
System.out.println(b);// 0.099999905
System.out.println(a == b);// false
```

**Why can `float` and `double` calculations lose precision?**

This is related to how computers represent decimal values. Computers use binary and have a limited number of bits to represent each number. Many decimal fractions become repeating binary fractions and must be rounded, which can lose precision. Values such as 0.5 and 0.25 have finite binary representations and can be represented exactly.

For example, decimal 0.2 has no exact finite binary representation:

```java
// To convert 0.2 to binary, repeatedly multiply the fractional part by 2.
// The integer parts, read from top to bottom, form the binary representation.
0.2 * 2 = 0.4 -> 0
0.4 * 2 = 0.8 -> 0
0.8 * 2 = 1.6 -> 1
0.6 * 2 = 1.2 -> 1
0.2 * 2 = 0.4 -> 0 (repeats)
...
```

For more on floating-point numbers, see [Computer Systems Fundamentals (4): Floating-Point Numbers](http://kaito-kidd.com/2018/08/08/computer-system-float-point/).

## Introduction to BigDecimal

`BigDecimal` can represent decimal numbers precisely and lets you specify precision and rounding rules for calculations. Rounding can still occur when using a limited-precision `MathContext`, dividing with a rounding rule, or converting the result to `float` or `double`.

Most business calculations that require precise decimal results, such as monetary calculations, use `BigDecimal`.

The _Alibaba Java Coding Guidelines_ also notes: **Don't compare floating-point values using `==` for primitive types or `equals()` for wrapper types.**

![](https://oss.javaguide.cn/javaguide/image-20211213101646884.png)

The reason is described above.

To avoid this issue, create decimal values with `BigDecimal` and perform the calculations with it.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
BigDecimal c = new BigDecimal("0.8");

BigDecimal x = a.subtract(b);
BigDecimal y = b.subtract(c);

System.out.println(x.compareTo(y));// 0
```

## Common BigDecimal Methods

### Creating Instances

To avoid precision loss when creating a `BigDecimal`, use the `BigDecimal(String val)` constructor or the `BigDecimal.valueOf(double val)` static method.

The _Alibaba Java Coding Guidelines_ also covers this, as shown below.

![](https://oss.javaguide.cn/javaguide/image-20211213102222601.png)

### Addition, Subtraction, Multiplication, and Division

Use `add` to add two `BigDecimal` values, `subtract` to subtract them, `multiply` to multiply them, and `divide` to divide them.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.add(b));// 1.9
System.out.println(a.subtract(b));// 0.1
System.out.println(a.multiply(b));// 0.90
System.out.println(a.divide(b));// Throws ArithmeticException because the result repeats.
System.out.println(a.divide(b, 2, RoundingMode.HALF_UP));// 1.11
```

Choose a `divide` overload based on whether rounding is allowed. If the result must be exact, use an overload without a rounding rule; it throws `ArithmeticException` when the result is a repeating decimal. If rounding is allowed, specify the `scale` and `roundingMode`. `RoundingMode.UNNECESSARY` asserts that no rounding is needed and also throws `ArithmeticException` if rounding would be required.

```java
public BigDecimal divide(BigDecimal divisor, int scale, RoundingMode roundingMode) {
    return divide(divisor, scale, roundingMode.oldMode);
}
```

There are several rounding modes. Here are a few:

```java
public enum RoundingMode {
   // 2.4 -> 3 , 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -3
   UP(BigDecimal.ROUND_UP),
   // 2.4 -> 2 , 1.6 -> 1
   // -1.6 -> -1 , -2.4 -> -2
   DOWN(BigDecimal.ROUND_DOWN),
   // 2.4 -> 3 , 1.6 -> 2
   // -1.6 -> -1 , -2.4 -> -2
   CEILING(BigDecimal.ROUND_CEILING),
   // 2.5 -> 2 , 1.6 -> 1
   // -1.6 -> -2 , -2.5 -> -3
   FLOOR(BigDecimal.ROUND_FLOOR),
   // 2.4 -> 2 , 1.6 -> 2
   // -1.6 -> -2 , -2.4 -> -2
   HALF_UP(BigDecimal.ROUND_HALF_UP),
   //......
}
```

### Comparing Values

`a.compareTo(b)` returns -1 if `a` is less than `b`, 0 if they are equal, and 1 if `a` is greater than `b`.

```java
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
System.out.println(a.compareTo(b));// 1
```

### Setting the Number of Decimal Places

Use `setScale` to set the number of decimal places and the rounding mode. There are several modes; your IDE can show the available options.

```java
BigDecimal m = new BigDecimal("1.255433");
BigDecimal n = m.setScale(3,RoundingMode.HALF_DOWN);
System.out.println(n);// 1.255
```

## Comparing BigDecimal Values for Equality

The _Alibaba Java Coding Guidelines_ notes:

![](https://oss.javaguide.cn/github/javaguide/java/basis/image-20220714161315993.png)

This example shows a potential issue when comparing `BigDecimal` values with `equals()`:

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.equals(b));//false
```

`equals()` compares both the value and the scale, while `compareTo()` ignores the scale.

The scale of 1.0 is 1, while the scale of 1 is 0, so `a.equals(b)` returns false.

![](https://oss.javaguide.cn/github/javaguide/java/basis/image-20220714164706390.png)

Use `compareTo()` to compare two `BigDecimal` values. It returns 0 if they are equal, 1 if the first is greater, and -1 if it is less.

```java
BigDecimal a = new BigDecimal("1");
BigDecimal b = new BigDecimal("1.0");
System.out.println(a.compareTo(b));//0
```

## A BigDecimal Utility Class

This commonly used `BigDecimal` utility class provides static methods for common operations.

Here is a slightly improved version:

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * A utility class for simplifying BigDecimal calculations.
 */
public class BigDecimalUtil {

    /**
     * Default precision for division.
     */
    private static final int DEF_DIV_SCALE = 10;

    private BigDecimalUtil() {
    }

    /**
     * Adds two values using BigDecimal. Converting the result to double may still round it.
     *
     * @param v1 the first addend
     * @param v2 the second addend
     * @return the sum
     */
    public static double add(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.add(b2).doubleValue();
    }

    /**
     * Subtracts two values using BigDecimal. Converting the result to double may still round it.
     *
     * @param v1 the minuend
     * @param v2 the subtrahend
     * @return the difference
     */
    public static double subtract(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.subtract(b2).doubleValue();
    }

    /**
     * Multiplies two values using BigDecimal. Converting the result to double may still round it.
     *
     * @param v1 the first factor
     * @param v2 the second factor
     * @return the product
     */
    public static double multiply(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.multiply(b2).doubleValue();
    }

    /**
     * Performs division, rounding to 10 decimal places with HALF_EVEN
     * when the result is not exact.
     *
     * @param v1 the dividend
     * @param v2 the divisor
     * @return the quotient
     */
    public static double divide(double v1, double v2) {
        return divide(v1, v2, DEF_DIV_SCALE);
    }

    /**
     * Performs division, rounding to the specified scale with HALF_EVEN
     * when the result is not exact.
     *
     * @param v1 the dividend
     * @param v2 the divisor
     * @param scale the number of decimal places
     * @return the quotient
     */
    public static double divide(double v1, double v2, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.divide(b2, scale, RoundingMode.HALF_EVEN).doubleValue();
    }

    /**
     * Rounds to the specified number of decimal places using HALF_EVEN.
     *
     * @param v the value to round
     * @param scale the number of decimal places
     * @return the rounded value
     */
    public static double round(double v, int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException(
                    "The scale must be a positive integer or zero");
        }
        BigDecimal b = BigDecimal.valueOf(v);
        BigDecimal one = new BigDecimal("1");
        return b.divide(one, scale, RoundingMode.HALF_EVEN).doubleValue();
    }

    /**
     * Converts to float. The value may be rounded or overflow its range.
     *
     * @param v the value to convert
     * @return the converted value
     */
    public static float convertToFloat(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.floatValue();
    }

    /**
     * Converts to int without rounding. The fractional part is discarded,
     * and values outside the int range lose their high-order bits.
     *
     * @param v the value to convert
     * @return the converted value
     */
    public static int convertsToInt(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.intValue();
    }

    /**
     * Converts to long without rounding. The fractional part is discarded,
     * and values outside the long range lose their high-order bits.
     *
     * @param v the value to convert
     * @return the converted value
     */
    public static long convertsToLong(double v) {
        BigDecimal b = BigDecimal.valueOf(v);
        return b.longValue();
    }

    /**
     * Returns the greater of two values.
     *
     * @param v1 the first value
     * @param v2 the second value
     * @return the greater value
     */
    public static double returnMax(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.max(b2).doubleValue();
    }

    /**
     * Returns the smaller of two values.
     *
     * @param v1 the first value
     * @param v2 the second value
     * @return the smaller value
     */
    public static double returnMin(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.min(b2).doubleValue();
    }

    /**
     * Compares two values precisely.
     *
     * @param v1 the first value
     * @param v2 the second value
     * @return 0 if equal, 1 if the first is greater, or -1 if it is less
     */
    public static int compareTo(double v1, double v2) {
        BigDecimal b1 = BigDecimal.valueOf(v1);
        BigDecimal b2 = BigDecimal.valueOf(v2);
        return b1.compareTo(b2);
    }

}
```

Related issue: [Use RoundingMode.HALF_EVEN](https://github.com/Snailclimb/JavaGuide/issues/2129).

![RoundingMode.HALF_EVEN](https://oss.javaguide.cn/github/javaguide/java/basis/RoundingMode.HALF_EVEN.png)

## Summary

Many decimal fractions cannot be represented exactly with a finite number of binary digits, so `float` and `double` calculations can lose precision.

Java provides `BigDecimal` for decimal arithmetic. It builds on `BigInteger` and adds a scale to represent digits after the decimal point.

<!-- @include: @article-footer.snippet.md -->
