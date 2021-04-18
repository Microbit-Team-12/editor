# Python Errors

Errors are the mistakes or faults performed by the user which results in abnormal working of the program. The process of removing errors from a program is called debugging.

There are three basic types of error:
- **Syntax Error**
  A syntax error is the most common type of error and occurs when we do not use properly defined syntax for Python, and so the program is unable to run. For example: missing parentheses (brackets), typos, using the wrong symbols etc.
- **Buit-in Exception**
  An exception occurs when the program fails to run for some reason other than a syntax error. Python has many different types of these exceptions, such as ```IndexError```, ```TypeError```, etc.
- **Logical Error**
  This type of error occurs when your program doesn't complain about an error, but still doesn't do quite what you wanted. This means that Python will not throw an error when the program is run, but the code doesn't work in the way you expected.

---

## Syntax Errors

If your program has a syntax error, the program will give you a `SyntaxError` when you try to run it. This will be displayed in the error message.

#### Example:
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

### Task
The following code has one or more syntax errors. Try running the code to see where they and and figure out how to fix them:

```py
# LINES 4-11
from microbit import *

if button_a.is_pressed():
    display-show(Image.ARROW_W)
    sleep 3000
    display.clear()
elseif button_b.is_pressed():
    display.show(Image.ARROW_E)
    sleep 3000
    display.clear()
```

---

## Built-in Exceptions

If you run the program and it passes a syntax check but still fails to run, then one of these errors will come up. You can find the name of the error in the final line of the error message. Here are some examples:

#### NameError
This error occurs when Python enounters something with a name it doesn't recognise. It often means you've made a typo, or used the wrong name for some object or method.

Try running this code. Can you find and fix the errors?
```py
# LINES 4-13
from microbit import *

while Tre:
    disply.show(Image.AROW_N)
    if accelermeter.is_gesture("UP"):
        display.sroll("UP")
    if acclerometer.is_gesture("down"):
        display.scroll("DOWN")
    if acceleroeter.is_gesture("left"):
        disply.scroll("LEFT")
    if aceleometer.is_gesture("right"):
        display.scrol("RIGHT")
```

#### IndexError
This error occurs when you try to access an index in a list that doesn't exist. For example, if you try to access the 10th item in a list that is only 9 items long, Python won't know what to do! Python always starts counting from 0 instead of 1.
What's wrong with this code? Can you fix it so it runs?
```py
x = ["Hello", "World"]
display.scroll(x[2])
```

#### ZeroDivisionError
This error occurs when you try to divide by zero, because that's mathematically impossible. For example:
```py
x = 10 / 0
```

#### TypeError
This error occurs when you try to pass an object of a wrong type into a method.

Let's say you want the program to wait for 1 second, so you type this line:
```py
sleep("1 second")
```
What error happens when you try running this? Why? Can you try and fix it? Note the additional information given to you in the final line of the error message - it may be useful.

Note that a particular argument can have more than one possible type. For example, let's say you run this:
```py
sleep(100)
sleep(100.0)
```
Does line 1 work? Does line 2?

Trying to pass an argument of the wrong type isn't the only way to get a `TypeError`. Let's say you try and run this code.
```py
sleep()
```
What happens? How do you fix it?

#### ValueError
This error is similar to a `TypeError`, but occurs when you try to pass an object that's a correct type but still the wrong value for that argument.
For example, let's say you try and use the `int` function, which converts things into integers.
```py
int(5.0)
int("132")
int("xy")
```
Whcih line/lines go wrong? Why is this?

---
## Logical Errors
These are some of the most difficult errors to debug, because you don't get an error message and so they can be hard to spot.

#### Example
Let's say you have two floats `x` and `y`, and you want the microbit to sleep for a time that's mean (average) of the two. You write this code:
```py
average = x + y / 2
sleep(average)
```
When you run the code however, it doesn't seem to be sleeping for the correct amount of time. This is a logical error, because although the code is running, it isn't doing what you want it to.

To figure out the problem, it would be useful to know what the value of `average` should be and what it actuallt is just before the sleep, in order to compare the two.
To do this, you change it to:
```py
x = 3
y = 4
average = x + y / 2
print(average)
sleep(average)
```
You expect the program to print `3.5` when run, but instead it prints `5`. What's going on?
Well, this is the difficult part of debugging a logic error, but at least you've figured out exactly where the problem is - it's in the definition of average.
After a bit of experimenting you realise you should have written `average = (x + y) / 2`, since division gets evaluated before addition.

#### Task on Logical Errors

For part of a program you need to add up all the numbers from 1 to 10. To do that you write the below code in order to have `nums` be that sum.
```py
nums = 0
for num in range(10):
    num += num
```
What do you expect `nums` to be at the end? What do you actually get if you run the code? What is the problem?

---
## Final Task

The following code is an attempt to write a simple coin flipping program. If it works correctly, whenever you shake the microbit you should either get an empty or filled-in coin, with equal chance of both.

Note: randint is a function that returns a random integer between two values, inclusive.

```py
from microbit import *
from random import randint

def on_gesture_shake():
    side = randint(2, 3)
    if side = 1:
        basic.showleds("""
        . # # # .
        # . . . #
        # . . . #
        # . . . #
        . # # # .
        """)
    else:
        basic.show_leds """
        . # # # .
        # # # # #
        # # # # #
        # # # # #
        . # # # .
        "")

input.on_gesure(Gesture.SHAK, on_gesture_shake
```
Remember to use the information in the error message to help you out. Also make sure to double check for logical errors - does the program do what you expect it to?