# Sounds
The micro:bit can play tunes and make sounds, and even pick up sounds!

## Play some melodies
First, import the `music` library:

```py
import music
```

After running this, we have access to the various melodies included in the library, like the Nyan cat:

```py
# LINES 4-4
import music

music.play(music.NYAN)
```

The micro:bit can play many other melodies.
Try it out yourself:
insert the code into the editor, and replace `music.NYAN` by something else;
the auto-completion tool will be very helpful — just type `music.` and scroll through the list that pops up!

## Creating your own tunes
It is also easy to play your own tunes on the micro:bit.
One way of doing so is to play each note of your melody one by one.  
For example, this code plays the middle C note for a duration of `2`: 

```py
# LINES 4-4
import music

music.play("C4:2")
```

More specifically, each note is expressed as a string like so: 

```
NOTE[octave][:duration]
```

The **NOTE** is the name of the note, like `C` in the code above; 
`C#` and `Cb` are also valid names. 
`R` is a special note which plays a rest, or silence.  

The **octave** is a number: 
`0` is the lowest octave, `4` contains the middle C.

The **duration** is another number, and the higher the value the longer the 
note will last: 
a note of duration of `4` will last twice as long as a note of duration `2`.   

Well, a melody usually is made up of more than one note,
and in programming, a list usually contains more than one element. 
You will be pleased to know that you can make a list of notes to play a melody:

```py
# LINES 4-4
import music

music.play(["C4:1", "D4:1", "E4:1", "F4:1", "G4:1"])
```

If you have the patience, you can program the microbit to play some well-known songs.
Try to guess what tune the microbit will play with this:

```py
# LINES 4-6
import music

tune = ["G4:2", "G4:2", "A4:2", "Bb4:2", "G4:2", "R:2",
        "F4:2", "F5:2", "R:2", "F5:2", "C5:2"]
music.play(tune)
```

## Listening to sounds
In addition to making sounds, the microbit can pick up sonds as well with its
microphone sensor.
We need to import `microphone` from the `microbit` library:

```py
from microbit import *
microphone
```

What can we do with the microphone?
Well, let's first run the code above — it didn't do anything.
Okay, let's insert the code into the editor, and type a dot after `microphone`
to see what completions starting with `microphone.` that micropython offers.
Ah, `microphone.sound_level` — reading the sound level must be useful!

```py
from microbit import *

while True:
    level = microphone.sound_level
    print(level)
    sleep(1000)
```

Hmm, that code didn't quite do what we expected it to do — how loud exactly is  
a `<bound_method>`?
Ok, let's `INTERRUPT` the code execution and try to figure the issue out.

```py
# LINES 5-5
from microbit import *

while True:
    level = microphone.sound_level
    print(level)
    sleep(1000)
```

Maybe `microphone.sound_level` isn't a value, but a function or a `method` that
we call to read the sound level?

```py
# LINES 10-11
from microbit import *

lights = Image("11111:"
              "11111:"
              "11111:"
              "11111:"
              "11111")

while True:
    level = microphone.sound_level()
    display.show(lights * level)
```
Indeed, now the sound levels are measured correctly (and we even replaced the 
boring print statements by some fancy disco lights — check out the tutorial on 
[displaying images on the microbit](DisplayTute.md)).

To finish off this tutorial, let's do something fun:
let microbit's microphone pick up its own sounds!

```py
from microbit import *
import music

tune = ["F4:6", "G:6", "C:4", "G:6", "A:6", "C3:2", "Bb2:2", "A2:4", "F4:6", "G4:6", "C4:10", "R:4",
        "C3:1", "D3:1", "F3:1", "D3:1", "A3:3", "R:0", "A3:3", "G3:6",
        "C4:1", "D4:1", "F4:1", "D4:1", "G4:3", "R:0", "G4:3", "F4:3", "E4:1", "D:2",
        "C3:1", "D3:1", "F3:1", "D3:1", "F3:4", "G3:2", "E3:3", "D3:1", "C3:2", "R:0",
        "C4:2", "R:0", "C4:2", "G4:4", "F4:8", 
        ]

lights = Image("11111:"
              "11111:"
              "11111:"
              "11111:"
              "11111")

for i in range(len(tune)):
    music.play(tune[i])
    
    level = microphone.sound_level()
    display.show(lights * level)
```

Organise up your own concert by editing the `tune`!

### References and inspirations
* [Micropython docs on music](https://microbit-micropython.readthedocs.io/en/v1.0.1/tutorials/music.html)
* [Microbit.org project on disco lights](https://microbit.org/projects/make-it-code-it/disco-lights/?editor=python)