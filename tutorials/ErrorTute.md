# Python Errors

Errors are the mistakes or faults performed by the user which results in abnormal working of the program. The process of removing errors from a program is called debugging.

There are two basic types of error:
- **Syntax Error**
A syntax error is the most common type of error and occurs when we do not use properly defined syntax for Python, and so the program is unable to run. For example: missing parentheses, typos, using the wrong symbols etc.
- **Buit-in Exception**
An exception occurs when the program fails to run for some reason other than a syntax error. Python has many different types of these exceptions, such as ```IndexError```, ```TypeError```, etc.
- **Logical Error**
This type of error occurs when your program has nothing technically wrong with it, but still doesn't perform as expected. This means Python will not throw an error when the program is run, but there's a logical error in the program causing things not to happen as expected.

---

### Syntax Errors

If your program has a syntax error, the program will give you a `SyntaxError` when you try to run it. This will be displayed in the error message.

###### Example:
Let's say you forget to put brakets after display.scroll:
```py
display.scroll "hello"
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1
SyntaxError: invalid syntax
```
The final line of the error message tells you that this is a syntax error. The line before that is telling you which line of the program the error occurs - in this case it's `line 1`.

Obviously the mistake here was forgetting the brackets, but Python couldn't figure out exactly what the error was and so simply wrote `invalid syntax` after `SyntaxError`. Don't worry if this happens - you can still figure out the mistake by looking at the line it occured!


[comment]: <> (###### Example:)

[comment]: <> (Let's say you try and run this code.)

[comment]: <> (```)

[comment]: <> (```)

[comment]: <> (You'll get this error:)

[comment]: <> (```)

[comment]: <> (```)


---

### Built-in Exceptions

If you run the program and it passes a syntax check but still fails to run, then one of these errors will come up. You can find the name of the error in the final line of the error message. Here are some examples:

###### IndexError
This error occurs when you try to access an index in a list that doesn't exist.
Let's say you try and run this code.
```
x = [0, 1, 2]
display.scroll(x[10])
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
IndexError: list index out of range
```

###### ZeroDivisionError
This error occurs when you try to divide by zero.
Let's say you try and run this code.
```
x = 10 / 0
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ZeroDivisionError: divide by zero
```

###### TypeError
This error occurs when you try to pass an object of the wrong type into a function.
Let's say you try and run this code.
```
sleep("100 seconds")
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: can't convert str to float
```
The final line of the error message contains some additional detail: `can't convert str to float`. This is telling us the `sleep` function requires its input to be a `float` or at least a type that can be converted into a `float`, but `"100 seconds"` is a `str` (which cannot be automatically converted into a `float`).

However, running `sleep(100)` or `sleep(100.0)` will not throw TypeErrors, because `100` is an `int` which can be converted into a `float`, and `100.0` is already a `float`.

You will also get a `TypeError` if you don't include enough arguments in a function.  For example:
Let's say you try and run this code.
```
sleep()
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: function takes 1 positional arguments but 0 were given
```
This time the error message is telling you that `sleep` requires 1 argument, but you only had 0.

###### ValueError
This error is similar to a `TypeError`, but occurs when you try to pass an object that's the correct type but the wrong value for a function.
For example, let's say you try and use the `int` function, which converts things into integers.
```
int("xy")
```
You'll get this error:
```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: invalid syntax for integer with base 10
```
The error comes because you can't convert `"xy"` into an `int`, but why is it a `ValueError` rather than a `TypeError`? Well, `"xy"` is a string, and some strings can actually be passed into the `int()` function. For example, running `int("12")` would be fine and output `12`. This means `str` is a valid type for the `int()` function, and so  `"xy"` isn't the incorrect *type* to be passed into the function, but it is still an incorrect *value* to be passed into the function (since it cannot be converted into an integer).

---
### Logical Errors
These are some of the most difficult errors to debug, because you don't get an error message and so they can be hard to spot.

###### Example
Let's say you have two floats `x` and `y`, and you want the microbit to sleep for a time that's mean of the two. You write this code:
```
average = x + y / 2
sleep(average)
```
When you run the code however, it doesn't seem to be sleeping for the correct amount of time. This is a logical error, because although the code is running, it isn't doing what you want it to.

To figure out the problem, it would be useful to know what the value of `average` should be and what it actuallt is just before the sleep, in order to compare the two.
To do this, you change it to:
```
x = 3
y = 4
average = x + y / 2
print(average)
sleep(average)
```
You expect the program to print `3.5` when run, but instead it prints `5`. What's going on?
Well, this is the difficult part of debugging a logic error, but at least you've figured out exactly where the problem is - it's in the definition of average.
After a bit of experimenting you realise you should have written `average = (x + y) / 2`, since division gets evaluated before addition.

```py
# $LINES 2-2 
x = 3
y = 4.
average = x + y / 2
print(average)
sleep(average)
```

$$ \exists \latex ? $$