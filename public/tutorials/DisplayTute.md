# Displaying Images on micro:bit

MicroPython comes with lots of built-in pictures to show on the display. For example, to make the device appear happy you type:

```py
# LINES 4-4
from microbit import *

display.show(Image.HAPPY)
```

The line above uses the `display` object to `show` a built-in image. The happy image we want to display is a part of the `Image` object and called `HAPPY`. We tell `show` to use it by putting it between the parenthesis (`(` and `)`).

![Image of micro:bit displaying happy face](tutorials/images/happy.png)

You can view list of images when you type upto `Image.`, and there’s quite a lot! Why not modify the code that makes the micro:bit look happy to see what some of the other built-in images look like? (Just replace `Image.HAPPY` with one of the built-in images listed by the editor.)

## Making your own image

Of course, you want to make your own image to display on the micro:bit, right?

That’s easy.

Each LED pixel on the physical display can be set to one of ten values. If a pixel is set to `0` (zero) then it’s off. It literally has zero brightness. However, if it is set to `9` then it is at its brightest level. The values `1` to `8` represent the brightness levels between off (`0`) and full on (`9`).

Armed with this information, it’s possible to create a new image like this:

```py
# LINES 4-8
from microbit import *

boat = Image("05050:"
             "05050:"
             "05050:"
             "99999:"
             "09990")

display.show(boat)
```

(When run, the device should display an old-fashioned “Blue Peter” sailing ship with the masts dimmer than the boat’s hull.)

Have you figured out how to draw a picture? Have you noticed that each line of the physical display is represented by a line of numbers ending in `:` and enclosed between `"` double quotes? Each number specifies a brightness. There are five lines of five numbers so it’s possible to specify the individual brightness for each of the five pixels on each of the five lines on the physical display. That’s how to create a new image.

Simple!

In fact, you don’t need to write this over several lines. If you think you can keep track of each line, you can rewrite it like this:

```py
boat = Image("05050:05050:05050:99999:09990")
```

## References

Tutorial adopted from

 - [micro:bit MicroPython documentation](https://microbit-micropython.readthedocs.io/en/latest/tutorials/images.html)
