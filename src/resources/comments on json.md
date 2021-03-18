## JSON doesn't allow comments, so here are comments about duck_flowchart.json. 

Every button has a link, **EXCEPT** for the button on the "Goodbye" slide, which has the link set to null. When writing the code that responds to buttons, we will have to check for null, to know whether to follow the link or if we should just close the duck's popup.

For the "Tutorial selection" slide, it would make sense for each of the buttons to go to the same location (otherwise the code would be inextensible, which is problematic). However, the slide that compares the students' code to that in the tutorial certainly needs to know which tutorial the student is following, so I've added an extra "params" field to contain this information. I assume that the duck will be able to "remember" the previous slide it was on, just to access these params (but the duck won't need to remember the slides before that, etc). For consistency, all of the buttons have a "params" field, even if this is empty (as it is for most!)

For the slides that need to run actual code to determine their speech, the JSON "speech" parameter contains a call to the relevant function (which hasn't yet been written). Any such code within this parameter will always be enclosed in curly braces {} and these curly braces won't otherwise appear. Therefore, it should be simple to parse the error message and extract the contents of the curly braces to replace with the output of the appropriate function. The dummy functions (which haven't yet been written) are as follows:
* `get_readable_diff(tutorial, linenumber)` should scan the tutorial for the most similar line to the student's code at the given line number - the two lines won't necessarily be the same number! It should then return a string with format such as:  Line 10 of the code in the tutorial is :
boat2 =  Image(“00000:”
But your line 9 almost matches, with :
boat2 = Image(“00000:’

* `hyperlink(text, link)` just makes the given text clickable (and sends them to the appropriate webpage for the tutorial!)
* `error_message.get_line_no_and_highlight()` gets the line number of the error message from serial, and highlights the line on the student's code. This is done for its side effects only, but should return an empty string anyway because of the format of the json.
