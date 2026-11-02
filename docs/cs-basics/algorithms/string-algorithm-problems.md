---
title: Common String Algorithm Problems
description: An overview of common string algorithms and problem patterns, with a focus on KMP and Boyer–Moore matching, sliding windows, and palindrome problems.
category: Computer Science Fundamentals
tag:
  - Algorithms
head:
  - - meta
    - name: keywords
      content: string algorithms,KMP,Boyer-Moore,sliding window,substring,string matching,complexity
---

> Author: wwwxmu
>
> Original article: <https://www.weiweiblog.cn/13string/>

## 1. KMP Algorithm

The Knuth–Morris–Pratt (KMP) algorithm searches for a pattern `W` in a text `S`. It takes `O(m + n)` time and `O(m)` extra space, where `m` is the pattern length and `n` is the text length.

Naive search may repeatedly backtrack through the text after a mismatch. KMP uses information from the part of the pattern that already matched: it keeps the text pointer in place and moves the pattern pointer to the next valid position.

Further reading:

- [KMP explained from beginning to end](https://blog.csdn.net/v_july_v/article/details/7041827)
- [How to understand and master KMP](https://www.zhihu.com/question/21923021)
- [A detailed explanation of KMP](https://blog.sengxian.com/algorithms/kmp)
- [KMP illustrated](http://blog.jobbole.com/76611/)
- [KMP string matching, with bilingual subtitles](https://www.bilibili.com/video/av3246487/?from=search&seid=17173603269940723925)
- [KMP string matching, part 1](https://www.bilibili.com/video/av11866460?from=search&seid=12730654434238709250)

### Boyer–Moore Algorithm

Boyer–Moore (BM) is another exact string-matching algorithm. It compares characters from right to left and uses two heuristics to decide how far to shift the pattern: the bad-character rule and the good-suffix rule. After a mismatch, it uses the larger valid shift from the two rules.

See [A string-matching algorithm: KMP](http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html).

## 2. Replace Spaces

> Sword Offer: Implement a function that replaces every space in a string with `"%20"`. For example, `We Are Happy` becomes `We%20Are%20Happy`.

Here are two approaches: build the result while scanning the string, or use the `String` API.

```java
// https://www.weiweiblog.cn/replacespace/
public class Solution {
    public static String replaceSpace(StringBuffer str) {
        int length = str.length();
        StringBuffer result = new StringBuffer();
        for (int i = 0; i < length; i++) {
            char ch = str.charAt(i);
            if (ch == ' ') {
                result.append("%20");
            } else {
                result.append(ch);
            }
        }
        return result.toString();
    }

    public static String replaceSpace2(StringBuffer str) {
        return str.toString().replace(" ", "%20");
    }
}
```

For replacing a fixed literal such as a space, `replace` is concise:

```java
str.toString().replace(" ", "%20");
```

## 3. Longest Common Prefix

> LeetCode: Write a function to find the longest common prefix among an array of strings. Return an empty string if there is no common prefix.

Examples:

```plain
Input: ["flower", "flow", "flight"]
Output: "fl"

Input: ["dog", "racecar", "car"]
Output: ""
Explanation: The strings have no common prefix.
```

Sort the array lexicographically, then compare the first and last strings. Their common prefix is shared by every string in the sorted array.

```java
public class Main {
    public static String longestCommonPrefix(String[] strs) {
        if (!checkStrs(strs)) {
            return "";
        }
        int len = strs.length;
        StringBuilder result = new StringBuilder();
        Arrays.sort(strs);
        int limit = Math.min(strs[0].length(), strs[len - 1].length());
        for (int i = 0; i < limit; i++) {
            if (strs[0].charAt(i) == strs[len - 1].charAt(i)) {
                result.append(strs[0].charAt(i));
            } else {
                break;
            }
        }
        return result.toString();
    }

    private static boolean checkStrs(String[] strs) {
        if (strs == null || strs.length == 0) {
            return false;
        }
        for (String str : strs) {
            if (str == null || str.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        String[] strs = {"customer", "car", "cat"};
        // Other examples: {"customer", "car", null}, {}, or null.
        System.out.println(longestCommonPrefix(strs)); // c
    }
}
```

## 4. Palindrome Problems

### 4.1. Longest Palindrome That Can Be Built

> LeetCode: Given a string containing uppercase and lowercase letters, return the length of the longest palindrome that can be built from its letters. Letter case matters, so `"Aa"` is not a palindrome. The string length is at most 1010.
>
> A palindrome reads the same forward and backward, such as `"level"` or `"noon"`.

Example:

```plain
Input: "abccccdd"
Output: 7
Explanation: One longest palindrome is "dccaccd".
```

Every character pair can be used. At most one unpaired character can be placed in the center. A set can track whether a character has appeared an odd or even number of times:

For the discussion of using pairs and one odd-count character, see [issue 665](https://github.com/Snailclimb/JavaGuide/issues/665).

```java
// https://leetcode-cn.com/problems/longest-palindrome/description/
class Solution {
    public int longestPalindrome(String s) {
        if (s.length() == 0) {
            return 0;
        }
        HashSet<Character> unmatched = new HashSet<>();
        int pairs = 0;
        for (char ch : s.toCharArray()) {
            if (!unmatched.add(ch)) {
                unmatched.remove(ch);
                pairs++;
            }
        }
        return unmatched.isEmpty() ? pairs * 2 : pairs * 2 + 1;
    }
}
```

### 4.2. Valid Palindrome

> LeetCode: Given a string, determine whether it is a palindrome, considering only letters and digits and ignoring letter case. An empty string is a valid palindrome.

Examples:

```plain
Input: "A man, a plan, a canal: Panama"
Output: true

Input: "race a car"
Output: false
```

Use two pointers from both ends, skipping non-alphanumeric characters and comparing the remaining characters without regard to case.

```java
// https://leetcode-cn.com/problems/valid-palindrome/description/
class Solution {
    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (!Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            } else if (!Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            } else {
                if (Character.toLowerCase(s.charAt(left))
                        != Character.toLowerCase(s.charAt(right))) {
                    return false;
                }
                left++;
                right--;
            }
        }
        return true;
    }
}
```

### 4.3. Longest Palindromic Substring

> LeetCode: Given a string `s`, find its longest palindromic substring. Assume `s` has a maximum length of 1000.

Examples:

```plain
Input: "babad"
Output: "bab"
Note: "aba" is also a valid answer.

Input: "cbbd"
Output: "bb"
```

Expand around each possible center. A palindrome may have one center character or a gap between two characters, so check both odd and even centers.

```java
// https://leetcode-cn.com/problems/longest-palindromic-substring/description/
class Solution {
    private int index, len;

    public String longestPalindrome(String s) {
        if (s.length() < 2) {
            return s;
        }
        for (int i = 0; i < s.length() - 1; i++) {
            expandAroundCenter(s, i, i);
            expandAroundCenter(s, i, i + 1);
        }
        return s.substring(index, index + len);
    }

    private void expandAroundCenter(String s, int left, int right) {
        while (left >= 0 && right < s.length() && s.charAt(left) == s.charAt(right)) {
            left--;
            right++;
        }
        if (len < right - left - 1) {
            index = left + 1;
            len = right - left - 1;
        }
    }
}
```

### 4.4. Longest Palindromic Subsequence

> LeetCode: Given a string `s`, find the length of its longest palindromic subsequence. Assume `s` has a maximum length of 1000.
>
> A substring must be contiguous; a subsequence only needs to preserve character order. For example, `"bbbb"` is a subsequence of `"bbbab"`, but not a substring.

Examples: `"bbbab"` has a longest palindromic subsequence of length `4` (`"bbbb"`); `"cbbd"` has one of length `2` (`"bb"`).

Define `dp[i][j]` as the length of the longest palindromic subsequence in `s[i..j]`. If the end characters match, add 2 to the inner interval; otherwise, take the better result after dropping one end character.

```java
class Solution {
    public int longestPalindromeSubseq(String s) {
        int len = s.length();
        int[][] dp = new int[len][len];
        for (int i = len - 1; i >= 0; i--) {
            dp[i][i] = 1;
            for (int j = i + 1; j < len; j++) {
                if (s.charAt(i) == s.charAt(j)) {
                    dp[i][j] = dp[i + 1][j - 1] + 2;
                } else {
                    dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[0][len - 1];
    }
}
```

## 5. Parentheses Nesting Depth

> iQIYI 2018 autumn recruitment, Java: A valid parentheses sequence is built from the empty string, concatenation of valid sequences, and wrapping a valid sequence in parentheses. Its depth is the maximum number of nested pairs. For example, `()()()` has depth 1 and `((()))` has depth 3. Given a valid sequence, calculate its depth.

More precisely, the empty string is valid; if `X` and `Y` are valid, both `XY` and `(X)` are valid; and every valid sequence can be built from these rules. Examples include `""`, `"()"`, `"()()"`, and `"((()))"`.

The empty string has depth 0. If `X` and `Y` have depths `x` and `y`, then `XY` has depth `max(x, y)` and `(X)` has depth `x + 1`.

The input contains only `(` and `)` and has a length from 2 to 50. Return a positive integer equal to its depth.

Example:

```plain
Input: (())
Output: 2
```

Count open parentheses and track the maximum count:

The original example credits SnailClimb (September 6, 2018) and links to the [Nowcoder problem](https://www.nowcoder.com/test/8246651/summary).

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int depth = 0, maxDepth = 0;
        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                depth++;
            } else {
                depth--;
            }
            maxDepth = Math.max(maxDepth, depth);
        }
        sc.close();
        System.out.println(maxDepth);
    }
}
```

## 6. Convert a String to an Integer

> Sword Offer: Convert a string to an integer, implementing the behavior of `Integer.valueOf(string)` without using a library function that performs the conversion. Return `0` if the value is zero or the string isn't a valid number.

```java
// https://www.weiweiblog.cn/strtoint/
public class Main {
    public static int StrToInt(String str) {
        if (str.length() == 0) {
            return 0;
        }
        char[] chars = str.toCharArray();
        int sign = 0;
        if (chars[0] == '+') {
            sign = 1;
        } else if (chars[0] == '-') {
            sign = 2;
        }
        int start = sign > 0 ? 1 : 0;
        int result = 0;
        for (int i = start; i < chars.length; i++) {
            if (Character.isDigit(chars[i])) {
                int digit = chars[i] - '0';
                result = result * 10 + digit;
            } else {
                return 0;
            }
        }
        return sign != 2 ? result : -result;
    }

    public static void main(String[] args) {
        String s = "-12312312";
        System.out.println("Using the library method: " + Integer.valueOf(s));
        int result = Main.StrToInt(s);
        System.out.println("Using the custom method: " + result);
    }
}
```

## Interview Review

String problems often use a small set of patterns: frequency counting, two pointers, sliding windows, KMP, palindrome checks, and stack simulation.

| Pattern                  | Common technique                   | Example problems                                                         |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| Character counts         | Array or hash table                | Valid Anagram, Group Anagrams                                            |
| Substring                | Sliding window                     | Longest Substring Without Repeating Characters, Minimum Window Substring |
| Palindromes              | Two pointers, center expansion, DP | Valid Palindrome, Longest Palindromic Substring                          |
| String matching          | KMP, hashing                       | Implement `strStr()`                                                     |
| Parentheses and decoding | Stack                              | Valid Parentheses, Decode String                                         |
| Number parsing           | Simulation                         | String to Integer                                                        |

Before solving a string problem, ask:

1. Does it concern a substring or a subsequence? Substrings are contiguous; subsequences don't have to be.
2. What is the character set? For lowercase English letters, an array may be simpler than a hash table.
3. Do you need to handle overflow, empty strings, whitespace, or a sign?

Common pitfalls:

- Java `String` objects are immutable; use `StringBuilder` for repeated concatenation.
- A Java `char` may not represent a full Unicode code point. Many algorithm problems use ASCII or lowercase English letters.
- A palindromic substring and a palindromic subsequence are different problems. The former often uses center expansion; the latter often uses DP.
- In interviews, you may not need to derive every entry of the KMP `next` array by hand, but understand how it skips an already matched prefix and avoids redundant comparisons.

<!-- @include: @article-footer.snippet.md -->
