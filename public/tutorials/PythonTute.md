# Python Language Features

To get the most out of MicroPython, it will be helpful to learn about some simple Python features!

This tutorial will explain 3 different types of features.

- **Variable Assignment**
  If you want to use the same value more than once in your code, variable assignment can be very useful! You can assign a value to a variable which can be referenced throughout your code to refer to the same thing.
- **Loops**
  A loop gives you a way to repeat a piece of code. There are different kinds of loops, one is called a for loop and the other is a while loop. The difference will be explained later.
- **If Statements**
  An if statement (otherwise known as a conditional statement) controls whether a piece of code is run or not. If the condition is true, the code is run. If the condition is false, the code isn't run. Simple as that!

---

## Variable Assignment
Inside a variable, we can store information that can be used later in the program. We can also change the value of a variable to contain a different value. We give variables a name so that we can reference them later.

#### Example
When you need to reuse a value, say the string "value" (but it could be of any type), it can be useful to assign it to a variable. Then, you can use that variable later in the code.
```py
variable = "value"
print(variable)
```
Running the code above should print the string "value" in the output box to the right.

We can assign a new value, say the integer 10, to the variable. Then, that same variable will store the integer 10 instead. The new value can be of a different type to the original value. Try running the following code:
```py
variable = "value"
print("The first value we assigned is " + variable)
variable = 10
print("The second value we assigned is " + str(variable))
```
As output in the box to the right, you should have "The first value we assigned is value" and "The second value we assigned is 10". (the str() function turns an integer into a string so that it can be printed!)

Try changing the values in the code and notice how the output changes!

---

## Loops

Loops are used to repeat a certain piece of code for a specific number of times or until a certain condition is true or false. Here is the distinction between for loops and while loops:

#### While Loops
While loops are used when you want to run the code until a specific condition is either true or false. 

#### Examples
For instance, this next piece of code will never stop running (unless you turn off your micro:bit, or delete the file). Try running it - you should see a beating heart!
```py
# LINES 4-8
from microbit import *

while True:
    display.show(Image.HEART)
    sleep(500)
    display.show(Image.HEART_SMALL)
    sleep(500)
```

We can also use MicroPython to run functions without using the micro:bit! Run the code below. There should be a '10' printed in the output box to the right. 
```py
x = 1
while x < 10:
    x = x + 1
print(x)
```

#### For Loops
For loops are used when you want the code to repeat a certain number of times. 

#### Example
```py
# LINES 4-6
from microbit import *

for x in range(1, 4):
    display.show(x)
    sleep(1000)
```
Run the code above. The code inside the loop will run 3 times, once for x = 1, once for x = 2, once for x = 3! You should see your microbit count to 3 in sequence.

The MicroPython ```range(start, stop)``` function generates a sequence of numbers starting with the ```start``` value up to but not including the ```stop``` value.
So, our ```range(1,4)``` in the code above generates the sequence ```[1, 2, 3]```. This means the for loop runs once when x = 1, once when x = 2, and once when x = 3. 3 times in total!

---

## If Statements

You can use an if statement to make sure a piece of code is only run under certain conditions. For example, when you do something to your micro:bit, like pressing a button or tilting it! 

#### Example:
You might want to write some code that only runs if you press a button...
```py
# LINES 4-8
from microbit import *

while True:
    if button_a.is_pressed():
        display.show(Image.HAPPY)
        sleep(1000)
        display.clear()
```
Try running the code above. If you press button A, a happy face should show on the display for 1 second (1000 milliseconds). Notice that this code is within a while loop with a True condition. This means you can keep pressing button A and the happy face should keep showing. 

Let's say you want your program to do something if a certain condition is met, but you want it to do something else in every other case. Then, the ```else``` statement might be what you need!
```py
# LINES 4-10
from microbit import *

while True:
    if button_a.is_pressed():
        display.show(Image.HAPPY)
        sleep(1000)
        display.clear()
    else:
        display.show(Image.SAD)
```
Run the code above. Your micro:bit will only be happy if you press button A!


(some examples and ideas influenced by https://docs.pycom.io/docnotes/examples/, https://microbit.org, https://towardsdatascience.com/python-variable-assignment-9f43aed91bff)