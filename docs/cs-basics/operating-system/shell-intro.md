---
title: Shell Scripting Basics
description: Shell scripting is useful in everyday development. Shell and Python are among the most widely used languages for Linux automation. This guide introduces the basics of Shell scripting.
category: Computer Science Fundamentals
tag:
  - Operating Systems
  - Linux
head:
  - - meta
    - name: keywords
      content: Shell, scripting, commands, automation, operations, Linux, syntax
---

Shell scripting is useful in everyday development. Shell and Python are among the most widely used languages for Linux automation.

This guide covers the basics of Shell scripting and helps you get started.

## Version Notes

**The examples in this article require bash 4.0 or later.** Some features may differ between bash versions, especially:

- **Arrays**: Supported in bash 2.0 and later, but not by POSIX-only shells such as dash.
- **Some string operations**: Older versions may not support `${var:offset:length}`.
- **Arithmetic expansion `$((...))`**: Supported in bash 2.0 and later.

Check your bash version:

```shell
bash --version
# or
echo $BASH_VERSION
```

## Getting Started with Shell Scripting

### Why Learn Shell?

We often learn something because it is useful. At work, Shell can improve productivity and help us get more done in less time.

Some people consider Shell scripting an operations skill and assume backend developers do not need it. I disagree. Backend developers may not need to know as much as Linux administrators, but a working knowledge of Shell is still useful.

Shell and Python are among the most widely used languages for Linux automation.

Shell is widely used in IT operations, including service monitoring, deployment, starting and stopping services, data backups and processing, and log analysis. Python is often a better fit for complex business logic and operations tools, including web applications. A Shell is a command interpreter: it runs commands and programs entered by the user, typically responding interactively to each command.

Many technology companies also expect backend developers to know some Shell scripting. The image below shows examples from job listings at well-known companies.

![Shell scripting requirements from major technology companies](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/60190220.jpg)

### What Is a Shell?

**A Shell is the command interpreter for Linux and Unix systems.** It acts as an interface between the user and the operating system kernel, receiving commands and invoking the appropriate programs.

**Shell scripting** means combining commands, control structures (`if`, `for`, and `while`), variables, and functions into automated scripts using a Shell interpreter such as bash. A Shell is both a command interpreter and a programming language, with variables, arrays, functions, control flow, pipelines, and redirection.

**Common Shells:**

- **bash** (Bourne Again Shell): The default Shell on many Linux systems and the most widely used.
- **sh** (Bourne Shell): A traditional Unix Shell interface standardized by POSIX.
- **zsh**: A feature-rich interactive Shell.
- **dash**: A lightweight Shell; on Ubuntu, `/bin/sh` points to it by default.
- **csh/tcsh**: C-style Shells.

### Hello World in Shell

The first step in learning a programming language is often printing “Hello, world!” Here is how to create a Shell script that does so.

1. Create a file named `helloworld.sh`: `touch helloworld.sh`. The `.sh` extension is just a convention and does not affect execution. Choose a meaningful extension if you prefer.

2. Make the script executable: `chmod +x helloworld.sh`.

3. Open the file in Vim with `vim helloworld.sh`. Press `i` to enter insert mode and edit the file. Press `Esc`, then type `:wq` to save and quit or `:q!` to quit without saving.

Add the following content to `helloworld.sh`:

```shell
#!/bin/bash
set -euo pipefail  # Exit on errors, unset variables, and pipeline failures
# echo prints text to standard output
echo "helloworld!"
```

In Shell scripts, `#` starts a comment. **The first line is usually a shebang (`#!`) that selects the Shell interpreter.** Linux systems have several Shells, including zsh and dash, but bash is still one of the most widely used.

4. Run the script with `./helloworld.sh`. The `./` tells the system to look in the current directory. Without it, the Shell searches the directories listed in `PATH`, which usually do not include the current directory. This also applies to other executable files.

![Hello world in Shell](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/55296212.jpg)

## Shell Variables

### Variables in Shell Scripts

**Shell scripts commonly use three kinds of variables:**

1. **User-defined (local) variables**: Available only in the current Shell process by default. **Child processes cannot access them.** Use `export` to make one an environment variable that child processes can inherit.
2. **Environment variables**: Variables such as `PATH` and `HOME` that child processes can inherit. Use `env` to list environment variables and `set` to list all variables, including local ones.
3. **Shell special parameters**: Values set by the Shell, such as `$?`, `$$`, and `$!`, which hold process status and parameter information.

**Common environment variables:**

> PATH: Directories the Shell searches for commands and programs.
> HOME: The current user's home directory.
> HISTSIZE: The number of commands kept in the history.
> LOGNAME: The current user's login name.
> HOSTNAME: The host name.
> SHELL: The current user's Shell.
> LANGUAGE: Language-related settings; change this variable to configure language preferences.
> MAIL: The current user's mail directory.
> PS1: The primary prompt; it is usually `#` for root and `$` for other users.

**Using predefined environment variables:**

Use `echo $HOME` to print the current user's home directory, or `echo $SHELL` to print the current Shell. The syntax is simple.

**Defining your own variables:**

```shell
#!/bin/bash
# Define a variable named hello
hello="hello world"
echo $hello
echo  "helloworld!"
```

![Using a user-defined variable](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/19835037.jpg)

**Variable naming rules in Shell:**

- Names can contain English letters, digits, and underscores. They cannot start with a digit, but they can start with an underscore (`_`).
- Names cannot contain spaces; use underscores (`_`) instead.
- Do not use punctuation.
- Do not use bash reserved words. Run `help` to see the reserved words.

### Shell Strings

Strings are one of the most useful data types in Shell scripts. They can be enclosed in single or double quotes, which work differently from quotes in Java.

Inside single quotes, special characters such as `$`, backticks, and `\` are treated literally.

Inside double quotes, these characters retain special meaning:

- `$`: Variable expansion (such as `$var`) and command substitution (such as `$(cmd)` or `` `cmd` ``).
- `\`: Escape character.
- `` ` `` or `$()`: Command substitution. The `$()` syntax is recommended.
- `!`: History expansion, enabled by default only in interactive Shells.
- `${}`: Parameter expansion.

**Note:** Strings in single quotes are **literal**. Double-quoted strings allow variable expansion and command substitution.

**Single-quoted string:**

```shell
#!/bin/bash
name='SnailClimb'
hello='Hello, I am $name!'
echo $hello
```

Output:

```plain
Hello, I am $name!
```

**Double-quoted string:**

```shell
#!/bin/bash
name='SnailClimb'
hello="Hello, I am $name!"
echo $hello
```

Output:

```plain
Hello, I am SnailClimb!
```

### Common String Operations

**Concatenating strings:**

```shell
#!/bin/bash
name="SnailClimb"
# Concatenate with double quotes
greeting="hello, "$name" !"
greeting_1="hello, ${name} !"
echo $greeting  $greeting_1
# Concatenate with single quotes
greeting_2='hello, '$name' !'
greeting_3='hello, ${name} !'
echo $greeting_2  $greeting_3
```

Output:

![Output from Shell string concatenation](https://oss.javaguide.cn/github/javaguide/cs-basics/shell/51148933.jpg)

**Getting a string's length:**

```shell
#!/bin/bash
# Get the string length
name="SnailClimb"
# Method 1 (recommended): bash built-in
echo ${#name}  # Prints 10
# Method 2: external command (slower)
expr length "$name"
```

Output:

```plain
10
10
```

**Notes:**

- `${#var}` is recommended because it is built into bash and performs better.
- `expr` is an external command, so it must start a separate process and is slower.
- **`expr length` is a GNU extension**, not part of POSIX. It may not work with BSD `expr` on macOS or other systems.
- For portability, use `${#var}` or `expr "$var" : '.*'` (POSIX-compatible).

With `expr`, put spaces around operators:

```shell
expr 5+6       # Prints 5+6 as text (no spaces)
expr 5 + 6     # Prints 11 (with spaces)
# bash arithmetic expansion is usually preferable:
echo $((5 + 6))  # Prints 11
```

Some operators must be escaped with `\`:

```shell
expr 5 * 6       # Fails (asterisk is not escaped)
expr 5 \* 6      # Prints 30 (asterisk is escaped)
```

**Extracting a substring:**

Simple substring extraction:

```shell
# Extract 10 characters starting at index 0 (indexes are zero-based)
str="SnailClimb is a great man"
echo ${str:0:10} # Prints: SnailClimb
```

**Extracting text with parameter expansion:**

```shell
#!/bin/bash
# Author: amau

var="https://www.runoob.com/linux/linux-shell-variable.html"
# % removes the shortest match from the end
# %% removes the longest match from the end
# # removes the shortest match from the beginning
# ## removes the longest match from the beginning
# * is a wildcard that matches any number of characters
s1=${var%%t*} #h
s2=${var%t*}  #https://www.runoob.com/linux/linux-shell-variable.h
s3=${var%%.*} #https://www
s4=${var#*/}  #/www.runoob.com/linux/linux-shell-variable.html
s5=${var##*/} #linux-shell-variable.html
```

### Shell Arrays

**bash 2.0+** supports one-dimensional arrays (not multidimensional arrays) with no fixed size limit.

**Important:** Arrays are a **bash extension and are not part of POSIX**. POSIX-only shells such as dash do not support them. Avoid arrays when writing portable scripts.

The following example shows how to create an array, get its length, access or remove an element, remove the entire array, and iterate over its values.

```shell
#!/bin/bash
array=(1 2 3 4 5);
# Get the array length
length=${#array[@]}
# Or
length2=${#array[*]}
# Print the array lengths
echo $length # Prints: 5
echo $length2 # Prints: 5
# Print the third element
echo ${array[2]} # Prints: 3
unset 'array[1]' # Remove the element at index 1 (the second element)
for i in "${array[@]}"; do echo "$i"; done # Iterate over the array; prints: 1 3 4 5
unset array; # Remove all elements from the array
for i in "${array[@]}"; do echo "$i"; done # The array is empty, so this prints nothing
```

**Important: Arrays can have gaps in their indexes.**

Removing an element with `unset array[1]` leaves a **gap in the indexes**:

```shell
#!/bin/bash
array=(1 2 3 4 5)
echo "Before removal: ${array[@]}"  # Prints: 1 2 3 4 5
echo "Value at index 1: ${array[1]}"  # Prints: 2

unset array[1]  # Remove the element at index 1
echo "After removal: ${array[@]}"  # Prints: 1 3 4 5
echo "Value at index 1: ${array[1]}"  # Prints: (empty)
echo "Value at index 2: ${array[2]}"  # Prints: 3 (index 2 remains)

# The indexes are not contiguous when iterating
for index in "${!array[@]}"; do
    echo "Index [$index] = ${array[$index]}"
done
# Output:
# Index [0] = 1
# Index [2] = 3
# Index [3] = 4
# Index [4] = 5
```

**Note:** After removing an element, `${array[1]}` evaluates to an empty value. When iterating, use `"${!array[@]}"` to get the existing indexes or `"${array[@]}"` to iterate directly over the values.

## Shell Operators

Shell supports these kinds of operators:

- Arithmetic operators
- Relational operators
- Boolean operators
- String operators
- File test operators

### Arithmetic Operators

| **Operator** | **Description** | **Example**                                              |
| ------------ | --------------- | -------------------------------------------------------- |
| **+**        | Addition        | `expr $a + $b`                                           |
| **-**        | Subtraction     | `expr $a - $b`                                           |
| **\***       | Multiplication  | `expr $a \* $b` (escape the asterisk)                    |
| **/**        | Division        | `expr $b / $a`                                           |
| **%**        | Modulo          | `expr $b % $a`                                           |
| **=**        | Assignment      | `a=$b` assigns the value of `b` to `a`                   |
| **==**       | Equal           | `[ "$a" == "$b" ]` compares strings; true if they match  |
| **!=**       | Not equal       | `[ "$a" != "$b" ]` compares strings; true if they differ |

**Prefer bash's built-in arithmetic expansion:**

```shell
#!/bin/bash
a=3; b=3
val=$((a + b))  # bash arithmetic expansion (recommended)
# Prints: Total value: 6
echo "Total value: $val"
```

**Notes:**

- `$((...))` is built into bash, so it does not need to start an external process and performs better.
- **Avoid** `expr` where possible: it starts a separate process and requires spaces around operators.
- **Avoid** the outdated backtick syntax `` `...` ``; use `$(...)` instead.

**For POSIX sh compatibility**, use:

```shell
val=$(expr "$a" + "$b")  # POSIX-compatible, but slower
```

### Relational Operators

Relational operators work with numbers, not strings, unless the strings contain numeric values.

| **Operator** | **Description**                                                         | **Term**                 |
| ------------ | ----------------------------------------------------------------------- | ------------------------ |
| **-eq**      | Check whether two numbers are **equal**                                 | equal                    |
| **-ne**      | Check whether two numbers are **not equal**                             | not equal                |
| **-gt**      | Check whether the left number is **greater than** the right             | greater than             |
| **-lt**      | Check whether the left number is **less than** the right                | less than                |
| **-ge**      | Check whether the left number is **greater than or equal to** the right | greater than or equal to |
| **-le**      | Check whether the left number is **less than or equal to** the right    | less than or equal to    |

The following example uses relational operators to print `A` when `score` is 100 and `B` otherwise.

```shell
#!/bin/bash
score=90;
maxscore=100;
if [[ $score -eq $maxscore ]]
then
   echo "A"
else
   echo "B"
fi
```

Output:

```plain
B
```

### Logical Operators

| **Operator** | **Description** | **Example**                                                   |
| ------------ | --------------- | ------------------------------------------------------------- |
| **&&**       | Logical **AND** | `[[ $a -lt 100 && $b -gt 100 ]]` (true only if both are true) |
| **\|\|**     | Logical **OR**  | `[[ $a -lt 100 \|\| $b -gt 100 ]]` (true if either is true)   |

**Logical operations in arithmetic expansion:**

```shell
#!/bin/bash
a=$(( 1 && 0))
# Prints 0. Logical AND evaluates to 1 only when both operands are 1; otherwise, it evaluates to 0.
echo $a;
```

**Short-circuit command execution (common in production scripts):**

In operations automation and CI/CD pipelines, `&&` and `||` are often used to control command chains. This is called **short-circuit execution**:

```shell
#!/bin/bash
set -euo pipefail

# &&: Run the next command only if the previous command succeeds (returns 0)
mkdir -p "/tmp/app_data" && echo "Directory is ready"

# ||: Run the next command only if the previous command fails (returns non-zero)
mkdir -p "/tmp/app_data" || echo "Could not create directory"

# Combine them: a common defensive pattern in production scripts
mkdir -p "/tmp/app_data" && echo "Directory is ready" || exit 1

# Examples
# 1. Delete a file only if it exists
[ -f "/tmp/old_file.log" ] && rm "/tmp/old_file.log"

# 2. Print an error and exit if a command fails
cd /app/config || { echo "Could not enter the configuration directory"; exit 1; }

# 3. Run commands conditionally
command1 && command2 || command3
# ⚠️ This pattern has a pitfall!
# - If command1 succeeds, command2 runs.
# - If command1 fails, command3 runs.
# - If command1 succeeds but command2 fails, command3 still runs!
#
# ✅ Safer pattern (recommended):
if command1; then
    command2
else
    command3
fi
#
# Use the && / || combination only when you know command2 cannot fail.
```

**Important:**

- Short-circuit execution depends on each command's **exit code**: 0 means success; non-zero means failure.
- This differs from `&&` and `||` inside `[[ ]]`, which combine conditional tests.
- `command1 && command2 || command3` has a pitfall: if command1 succeeds but command2 fails, command3 still runs.
- In production scripts, prefer an if-then-else structure to make the logic clear.

### Boolean Operators

| **Operator** | **Description**                                                                        | **Example**                                                        |
| ------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **!**        | Negates the result. If the expression is true, returns false; otherwise, returns true. | `[ ! false ]` returns false because `false` is a non-empty string. |
| **-o**       | Returns true if either expression is true.                                             | `[ "$a" -lt 20 -o "$b" -gt 100 ]` returns true.                    |
| **-a**       | Returns true only if both expressions are true.                                        | `[ "$a" -lt 20 -a "$b" -gt 100 ]` returns false.                   |

### String Operators

| **Operator** | **Description**                                 | **Example**                          |
| ------------ | ----------------------------------------------- | ------------------------------------ |
| **=**        | Check whether two strings are **equal**         | `[ "$a" = "$b" ]`                    |
| **!=**       | Check whether two strings are **not equal**     | `[ "$a" != "$b" ]`                   |
| **-z**       | Check whether the string length is **0** (zero) | `[ -z "$a" ]` is true when empty     |
| **-n**       | Check whether the string length is **not 0**    | `[ -n "$a" ]` is true when non-empty |
| **str**      | Test whether the string is non-empty            | `[ "$a" ]` is true when non-empty    |

Example:

```shell
#!/bin/bash
a="abc";
b="efg";
if [[ "$a" = "$b" ]]
then
   echo "a equals b"
else
   echo "a does not equal b"
fi
```

Output:

```plain
a does not equal b
```

### File Test Operators

These operators test Unix and Linux file properties, such as permissions and type.

- **Existence and type:**
  - **-e file**: Check whether a file or directory exists.
  - **-f file**: Check whether it is a regular file (not a directory or device file).
  - **-d file**: Check whether it is a directory.
  - **-s file**: Check whether it is non-empty (its size is greater than 0).
  - **-b/-c/-p**: Check whether it is a block device, character device, or named pipe, respectively.
- **Permissions:**
  - **-r file**: Check whether the file is readable.
  - **-w file**: Check whether the file is writable.
  - **-x file**: Check whether the file is executable.
- **Special bits:**
  - **-u / -g / -k**: Check whether the file has the SUID bit, SGID bit, or sticky bit set, respectively.

For example, after setting `file="/usr/learnshell/test.sh"`, use `if [ -r "$file" ]` to check whether it is readable or `[ -w "$file" ]` to check whether it is writable.

## Shell Control Flow

### if Statements

Here is a simple `if`, `else if`, and `else` statement:

```shell
#!/bin/bash
a=3;
b=9;
if [[ $a -eq $b ]]
then
   echo "a equals b"
elif [[ $a -gt $b ]]
then
   echo "a is greater than b"
else
   echo "a is less than b"
fi
```

Output:

```plain
a is less than b
```

The example above shows how to use `if` statements in Shell scripts.

**Empty statements:** In Shell, use `:` (the colon command) or `true` for an empty statement:

```shell
if [[ condition ]]; then
    :  # Empty statement (does nothing)
fi

# Or
if [[ condition ]]; then
    true  # Empty statement
fi
```

This can be useful as a placeholder in some situations, such as in a `while` loop.

### for Loops

These three examples show basic uses of `for` loops. They can do much more than these examples demonstrate.

**Print each value in a list:**

```shell
for loop in 1 2 3 4 5
do
    echo "The value is: $loop"
done
```

**Generate 10 random numbers:**

```shell
#!/bin/bash
for i in {0..9};
do
   echo $RANDOM;
done
```

**Print the numbers 1 through 5:**

Shell variables usually need a `$` prefix, but not inside the arithmetic expression `(( ))` used here:

```shell
#!/bin/bash
length=5
for((i=1;i<=length;i++));do
    echo $i;
done;
```

### while Loops

**A basic `while` loop:**

```shell
#!/bin/bash
int=1
while (( int <= 5 ))  # Variables do not need $ inside arithmetic expressions
do
    echo $int
    (( int++ ))  # Prefer (( )) to let
done
```

**A `while` loop can read input from the keyboard:**

```shell
echo 'Press <CTRL-D> to exit'
echo -n 'Enter your favorite movie: '
while read -r FILM  # -r disables backslash escaping for safer input
do
    echo "Yes! $FILM is a great movie."
done
```

Output:

```plain
Press <CTRL-D> to exit
Enter your favorite movie: Transformers
Yes! Transformers is a great movie.
```

**An infinite loop:**

```shell
while true
do
    command
done
```

## Shell Functions

### Functions Without Parameters or Return Values

```shell
#!/bin/bash
hello(){
    echo "This is my first Shell function!"
}
echo "----- Function starts -----"
hello
echo "----- Function finished -----"
```

Output:

```plain
----- Function starts -----
This is my first Shell function!
----- Function finished -----
```

### Functions That Return a Value

**Read two numbers, add them, and print the result:**

```shell
#!/bin/bash
set -euo pipefail

funWithReturn(){
    local aNum
    local anotherNum
    echo "Enter the first number: "
    read -r aNum
    echo "Enter the second number: "
    read -r anotherNum
    echo "The two numbers are $aNum and $anotherNum."
    result=$((aNum + anotherNum))
}
result=0
funWithReturn
echo "The sum of the two numbers is $result."
```

**Important:**

- **The `local` keyword** limits a variable to the function's scope and avoids polluting the global namespace.
- **`read -r`**: The `-r` option disables backslash escaping, which is safer for reading input.
- **Function return values**: `return` sets an exit status from 0 to 255, so it is not suitable for returning calculation results. Use standard output or a variable to pass data.

**Why use `local`?**

- In complex scripts or scripts that source other files, non-local variables can be overwritten accidentally.
- Global variable pollution can lead to hard-to-debug configuration drift or logic errors.
- Using `local` is a good practice, similar to using local variables in other programming languages.

Output:

```plain
Enter the first number:
1
Enter the second number:
2
The two numbers are 1 and 2.
The sum of the two numbers is 3.
```

### Functions with Parameters

```shell
#!/bin/bash
funWithParam(){
    echo "The first parameter is $1"
    echo "The second parameter is $2"
    echo "The script name is $0"
    echo "The tenth parameter is ${10}"   # Use ${n} for parameters n >= 10
    echo "The eleventh parameter is ${11}"
    echo "There are $# parameters"
    echo "All parameters: $*"         # Printed as a single string
    echo "All parameters: $@"         # Printed as separate parameters (recommended)
}
funWithParam 1 2 3 4 5 6 7 8 9 34 73
```

Output:

```plain
The first parameter is 1
The second parameter is 2
The script name is ./script.sh
The tenth parameter is 34
The eleventh parameter is 73
There are 11 parameters
All parameters: 1 2 3 4 5 6 7 8 9 34 73
All parameters: 1 2 3 4 5 6 7 8 9 34 73
```

**Important:**

- **Use the `${n}` syntax for positional parameters when `n >= 10`.**
- For example, `$10` is parsed as `$1` followed by the literal `0`, not as the tenth parameter.
- `$0` is the script's name.
- `$#` is the number of parameters.

**The key difference between `$*` and `$@`:**

| Expression | Unquoted                  | Enclosed in double quotes                                  |
| ---------- | ------------------------- | ---------------------------------------------------------- |
| `$*`       | Expands to all parameters | Expands to **one string** (all parameters are joined)      |
| `$@`       | Expands to all parameters | Expands to **separate parameters** (each remains separate) |

**Example:**

```shell
#!/bin/bash
test_args() {
    echo "--- Using \$* (unquoted) ---"
    for arg in $*; do
        echo "Argument: [$arg]"
    done

    echo -e "\n--- Using \$@ (unquoted) ---"
    for arg in $@; do
        echo "Argument: [$arg]"
    done

    echo -e "\n--- Using \"\$*\" (double-quoted) ---"
    for arg in "$*"; do
        echo "Argument: [$arg]"
    done

    echo -e "\n--- Using \"\$@\" (double-quoted, recommended) ---"
    for arg in "$@"; do
        echo "Argument: [$arg]"
    done
}

# Call the function with arguments that contain spaces
test_args "hello world" "foo bar"
```

**Output:**

```plain
--- Using $* (unquoted) ---
Argument: [hello]
Argument: [world]
Argument: [foo]
Argument: [bar]

--- Using $@ (unquoted) ---
Argument: [hello]
Argument: [world]
Argument: [foo]
Argument: [bar]

--- Using "$*" (double-quoted) ---
Argument: [hello world foo bar]  # All parameters are joined into one string

--- Using "$@" (double-quoted, recommended) ---
Argument: [hello world]  # Each parameter remains separate
Argument: [foo bar]
```

**Takeaway:** When passing parameters, **always use `"$@"`** to keep each one separate, especially when arguments may contain spaces.

## Shell Scripting Best Practices

These practices can help you write safer and more efficient scripts.

### Script Basics

**1. Shebang:**

```shell
#!/usr/bin/env bash
# Find bash through PATH
set -euo pipefail
```

**Two common shebangs:**

- `#!/bin/bash`: Specifies the path to bash directly. Use it in a fixed environment where you know the path.
- `#!/usr/bin/env bash`: Uses `env` to find bash. This is more portable across systems such as macOS and Linux.

**Examples in this guide:**

- Tutorial examples use `#!/bin/bash` for simplicity.
- Production examples use `#!/usr/bin/env bash` for portability.

**2. Quote variables:**

```shell
# Always enclose variables in double quotes
echo "$var"     # Recommended
echo $var       # May cause word splitting and globbing issues
```

**3. Use ShellCheck:**

```bash
shellcheck your_script.sh  # Static analysis to find common issues
```

**4. Preferred syntax:**

- Use `[[ ]]` instead of `[ ]` (it is safer and supports pattern matching).
- Use `$((...))` instead of `expr` (it performs better).
- Use `$(...)` instead of backticks (it can be nested and is clearer).
- Use `${n}` to access positional parameters where `n >= 10`.

### How `pipefail` Works

By default, a pipeline's exit status is the status of its last command. With `pipefail` enabled, the pipeline returns the status of the rightmost command that failed. This helps reveal errors in earlier commands.

**Example:**

```shell
# Default behavior (can hide failures)
cat huge_file.txt | grep "pattern" | head -n 10
# Even if cat fails (for example, because the file does not exist), a successful head makes the pipeline return 0.

# With pipefail enabled
set -o pipefail
cat huge_file.txt | grep "pattern" | head -n 10
# A cat failure is reported instead of being ignored.
```

## Before Running Shell Scripts in Production

Correct syntax is only the first step. Scripts used in scheduled jobs, deployments, or production machines also need to handle failures, temporary files, network timeouts, and background task exit statuses. The examples below cover these cases.

`set -u` and `set -o pipefail` behave relatively consistently. `set -e` has many exceptions and can behave unexpectedly in conditionals, functions, subshells, and command substitutions. You can use `set -euo pipefail` as a starting point for new scripts, but it does not replace explicit error handling such as `if ! command; then ... fi`. Quote variable expansions as appropriate, and use `local` to limit the scope of function variables.

### Set an Overall Budget for Network Requests

Set limits for both the connection phase and the total transfer time. Keep retries in one layer: if both an outer loop and `curl --retry` are enabled, the number of actual requests multiplies and the total time becomes hard to estimate. The function below controls attempts in one place and adds a random integer delay of 0–2 seconds after each failure:

```shell
#!/usr/bin/env bash

retry_request() {
    local url="$1"
    local max_attempts=5
    local attempt=1
    local delay
    local jitter

    while (( attempt <= max_attempts )); do
        if curl --fail --silent --show-error \
                --connect-timeout 3 \
                --max-time 10 \
                "$url"; then
            return 0
        fi

        if (( attempt == max_attempts )); then
            break
        fi

        delay=$((1 << (attempt - 1)))
        (( delay > 16 )) && delay=16
        jitter=$((RANDOM % 3))
        delay=$((delay + jitter))
        printf 'Request %d failed; retrying in %d seconds\n' "$attempt" "$delay" >&2
        sleep "$delay"
        ((attempt += 1))
    done

    return 1
}

command -v curl >/dev/null 2>&1 || {
    echo "curl is not installed" >&2
    exit 1
}

[[ $# -eq 1 ]] || {
    echo "Usage: $0 <url>" >&2
    exit 1
}

retry_request "$1" || {
    echo "Request failed" >&2
    exit 1
}
```

In a real script, decide which errors are retryable based on the API semantics. Do not automatically retry non-idempotent writes, authentication failures, or invalid parameters.

### Temporary Files and Locks

Avoid predictable paths such as `/tmp/data_$$`. `mktemp` creates a file or directory atomically, and `trap` can clean it up on normal exit and common signals:

```shell
#!/usr/bin/env bash

temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/myapp.XXXXXXXX") || {
    echo "Could not create a temporary directory" >&2
    exit 1
}
cleanup() {
    rm -rf -- "$temp_dir"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

temp_file="$temp_dir/result.txt"
printf 'temporary data\n' > "$temp_file"
cat "$temp_file"
```

To prevent a script from running more than once on the same machine, use `flock` with an application-managed lock file:

```shell
exec 9>/var/lock/myapp.lock || exit 1
flock -n 9 || {
    echo "The script is already running" >&2
    exit 1
}
```

`flock` is advisory: other processes can choose not to honor it. Linux NFS clients can emulate it with whole-file `fcntl` locks, but behavior also depends on the client kernel, server, and mount options such as `local_lock`. If the lock file is on a network file system, verify its behavior in the target environment using two independent clients. Do not assume it will always work or fail. Cross-machine locking also takes more than a Redis `SET NX PX` command; an implementation must handle unique tokens, conditional deletion, lease renewal, and failure modes.

### Collecting Background Task Exit Codes

`wait` without arguments waits for all background tasks, but Bash returns 0 and does not tell you which task failed. The script below counts the bytes in several files concurrently and collects each child process's status:

```shell
#!/usr/bin/env bash
set -u

pids=()
for file in "$@"; do
    wc -c -- "$file" &
    pids+=("$!")
done

exit_code=0
for pid in "${pids[@]}"; do
    if ! wait "$pid"; then
        echo "Background task $pid failed" >&2
        exit_code=1
    fi
done

exit "$exit_code"
```

Writing `while wait -n; do ...; done` is also incomplete: when a task fails, `wait -n` returns non-zero and the loop exits immediately, possibly leaving other tasks uncollected.

### Common Pitfalls

Do not permanently redirect all standard output and standard error to `/dev/null`; when a command fails, you would have only an exit code and no diagnostic information. Suppress only output you know you do not need, and log errors or leave them on standard error. If a script depends on external commands such as `curl` or `jq`, check for them at startup with `command -v`. Enable `set -o pipefail` when a pipeline needs to report failures from intermediate commands.

### Validate Before Deployment

Choose checks based on the script's actual dependencies. For a network script, cover connection failures, timeouts, and non-retryable HTTP statuses. For a concurrent script, check every child process's exit code. For a script that creates temporary resources, verify cleanup after both normal exit and signal interruption. Fault-injection commands can change firewall rules, system time, or mount state, so they should not be presented as generic copy-and-paste examples. Design them for the actual infrastructure and run them in an isolated test environment.

## Summary

Shell is useful for combining existing commands into small automated workflows. Start with variable quoting, conditionals, loops, functions, and exit statuses. Then add timeouts, cleanup, and error handling for the network, files, and concurrent resources your script uses.

### Key Concepts

| Topic                    | Key points                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --- | ------------------ |
| **Variables**            | Distinguish local, environment, and special variables; use `local` to avoid polluting the global scope; always quote variables. |
| **Strings**              | Prefer double quotes; understand how single and double quotes differ; use `${#var}` to get a string's length.                   |
| **Arrays**               | Arrays are supported in bash 2.0+ but are not POSIX; indexes can have gaps after removing elements.                             |
| **Operators**            | Prefer `$((...))` for arithmetic; `[[ ]]` is safer than `[ ]`.                                                                  |
| **Control flow**         | Use `[[ ]]` for conditional tests; avoid the `command1 && command2                                                              |     | command3` pitfall. |
| **Functions**            | Use `local` to limit variable scope; functions can return only exit statuses from 0 to 255.                                     |
| **Command substitution** | Prefer `$(...)` to backticks; use `read -r` for safer input.                                                                    |

### Tips for Further Learning

Start with small tasks such as filtering logs, renaming files in batches, or counting files. After writing a script, check its syntax with `bash -n`, then use ShellCheck to find common issues such as unquoted variables and incorrect redirection. When your scripts manage background processes or system services, learn about signals, job control, `sed`, `awk`, and `grep`. For scripts that are hundreds of lines long or need complex data structures or recovery logic, a general-purpose language such as Python is often easier to maintain.

### References

- **Official documentation**: GNU Bash Reference Manual
- **Linting**: ShellCheck - Shell Script Analysis Tool
- **Style guide**: Google Shell Style Guide
- **Common pitfalls**: Bash Pitfalls (http://mywiki.wooledge.org/BashPitfalls)
