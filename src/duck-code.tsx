/* eslint @typescript-eslint/no-var-requires: "off" */

import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import { default as React, useState } from 'react';
import * as Space from 'react-spaces';
import duck from './resources/Duck.jpg';
import './styles.css';

type DuckProps = {
  closeDuck(): void,
  lineNumber?: number,
  lineText?: string,
  tutorialCode?: string
}

type SlideButton = {
  link: string,
  text: string,
  params: string[]
}


/**
 * Specifies the colour used for the buttons in the Duck
 */
const theme = createMuiTheme({
  palette: {
    primary: {
      // Yellow
      main: '#ffcc00', // feel free to change this colour
    }
  },
});


const useStyles = makeStyles( (theme) => ({
  button: {
    flexGrow: 1,
    border: 1,
    borderRadius: 3,
    color: 'black',
    height: 48,
    padding: theme.spacing(2),
    margin: 8,
    textAlign: 'center',
    textTransform: 'none'
  },
  xButton: { // The red X that closes the Duck
    color: 'white',
    backgroundColor: '#ff0000',
    height: 20,
    padding: theme.spacing(2),
    textAlign: 'center'
  },
  speech: {
    flexGrow: 1,
    border: 1,
    borderRadius: 3,
    color: 'black',
    padding: theme.spacing(2),
    margin: 8,
    textAlign: 'left'
  }
}));

// let prevSlideParams: string[] = [];
const jsonData = require('./resources/duck_flowchart.json');
const slideNames = Object.keys(jsonData);

/**
 * Generates part of the Duck's text, by running a command specified as a string.
 * @param commandString contains the command to run
 * @param props 
 * @returns the text to be embedded in the Duck's explanation, after executing the command
 */
function executeCorrespondingCommand(commandString: string, props: DuckProps) {
  if (commandString === 'link_to_tutorial_about_errors') {
    return (
      <a href="https://example.com/faq.html" target="_blank" rel="noreferrer">
        Tutorial about errors
      </a>
    );
  }
  else if (commandString === 'get_readable_diff') {
    return readableDiffMessage(props);

  }
  else if (commandString === 'get_error_line_no_and_highlight') {
    return claimHaveHighlightedLine(props);
  }
  else {
    return commandString;
  }
} 

/**
 * Returns either a claim that the correct line has been highlighted, or a statement that no error message is visible.
 */
function claimHaveHighlightedLine(props: DuckProps) {
  if (props.lineNumber) {
    return (<div>
      Your error is on line 
      {' ' + props.lineNumber}, 
      so I’ve highlighted that line in the editor. 
      What type of error is displayed?
    </div>);
  }
  else {
    return ('I cannot see your error message. Perhaps press \'RUN\' again, and double check that an error message is visible?');
  }

}

/**
 * Finds the closest matching line in the corresponding tutorial.
 * @returns a visual difference between the student's and tutorial's code, 
 * using highlighting, or a statment that no similar line has been found in the tutorial.
 */
function readableDiffMessage(props: DuckProps) {
  if (props.lineNumber && props.lineText && props.tutorialCode) {
    const strippedCodeLine = props.lineText.trim();
    const strippedTutorialLines = props.tutorialCode.split('\n').map(x => x.trim());
    const fuse = new Fuse(strippedTutorialLines, { includeMatches: true, isCaseSensitive: true });
    const result = fuse.search(strippedCodeLine);
    if (result.length > 0) {
      const closestLine = result[0];
      const highlights = highlightDiffLine(strippedCodeLine, closestLine.item);
      return (<div>
        The closest matching line in the tutorial is: <br />
        {convert(closestLine.item, highlights[1])} <br />
        whereas your line reads: <br />
        {convert(strippedCodeLine, highlights[0])}
      </div>);
    }
    else {
      return ('Unfortunately, your line does not look like any of the lines in the tutorial.');
    }
  }
  else return ('I cannot see your error message. Perhaps press \'RUN\' again, and double check that an error message is visible?');
}

/** 
 * Returns two arrays, representing which indices to highlight in the student's erroneous code line 
 * and corresponding tutorial line. 
 * @param writtenLine : The student's erroneous line of code
 * @param perfectLine : The corresponding line in the tutorial
 */
function highlightDiffLine(writtenLine: string, perfectLine: string): [number[], number[]] {
  let bugCatcher = false;  // For catching a small bug
  const lengthWritten = writtenLine.length; const lengthPerfect = perfectLine.length;
  const highlightsWritten = []; let iWritten = 0;
  const highlightsPerfect = []; let iPerfect = 0;
  while (iWritten < lengthWritten && iPerfect < lengthPerfect) {
    if (writtenLine[iWritten] === perfectLine[iPerfect]) {
      iWritten++;
      iPerfect++;
    }
    else {
      if (iWritten + 1 === lengthWritten || iPerfect + 1 === lengthPerfect) {
        highlightsWritten.push(iWritten); iWritten++;
        highlightsPerfect.push(iPerfect); iPerfect++;

        // Small exception when final character of writtenLine is the same as final character of perfectLine
        // but we've only reached the end of writtenLine
        if (!(iPerfect + 1 === lengthPerfect)) {
          bugCatcher = true;
        }
      }
      else {
        // Checks the next 10 characters of perfectLine for any matches with the slice of writtenLine
        const locationPerfect: number | undefined = lookFor(writtenLine.slice(iWritten, iWritten + 2), perfectLine, iPerfect, 10);
        // Checks the next 10 characters of writtenLine for any matches with the slice of perfectLine
        const locationWritten: number | undefined = lookFor(perfectLine.slice(iPerfect, iPerfect + 2), writtenLine, iWritten, 10);
        if (locationWritten) {
          while (iWritten < locationWritten) { highlightsWritten.push(iWritten); iWritten++; }
          iWritten += 2;
          iPerfect += 2;
        } else if (locationPerfect) {
          while (iPerfect < locationPerfect) { highlightsPerfect.push(iPerfect); iPerfect++; }
          iWritten += 2;
          iPerfect += 2;
        } else {
          highlightsWritten.push(iWritten); iWritten++;
          highlightsPerfect.push(iPerfect); iPerfect++;
        }
      }
    }
  }

  while (iWritten < lengthWritten) {
    highlightsWritten.push(iWritten);
    iWritten++;
  }
  while (iPerfect < lengthPerfect) {
    highlightsPerfect.push(iPerfect);
    iPerfect++;
  }

  // Small bugfix, solution is to check the final characters to see if they're the same
  if (bugCatcher && writtenLine[iWritten - 1] === perfectLine[iPerfect - 1]) {
    highlightsWritten.pop();
    highlightsPerfect.pop();
  }

  function lookFor(couple: string, long: string, iStart: number, lookAhead: number) {  // couple should be 2 characters long
    for (let i = iStart; i !== iStart + lookAhead && i + 1 < long.length; i++) {
      if (long[i] === couple[0] && long[i + 1] === couple[1]) { return i; }
    }
    return undefined;
  }

  return [highlightsWritten, highlightsPerfect];
}

/**
 * Returns line as a JSX.Element with the highlights indexes all highlighted
 */
function convert(line: string, highlights: number[]) {
  const convertedLine = [];

  for (let i = 0; i < line.length; i++) {
    if (i === highlights[0]) {
      highlights.shift();
      convertedLine.push(<span style={{ backgroundColor: 'yellow' }}>{
        <Typography display="inline">
          {line[i]}
        </Typography>
      }</span>);
    } else {
      convertedLine.push(<span>{
        <Typography display="inline">
          {line[i]}
        </Typography>
      }</span>);
    }
  }
  return convertedLine;
}

/** 
 * If the argument string is surrounded in curly braces, remove the braces and execute the corresponding command. 
 * Otherwise, return the argument string unchanged.
 * @param commandString is a SUBSTRING of the Duck's speech, either fully enclosed in curly braces or containing 
 *                      no curly braces (but no strict substring of commandString should be enclosed in curly braces.)
*/
function parseTextCommand(commandString: string, props: DuckProps) {
  let parsedCommand: string|JSX.Element = commandString;
  if (commandString.startsWith('{')) { 
    // must also then end with '}'
    const rawCommand = commandString.slice(1, -1); // remove surrounding braces
    parsedCommand = executeCorrespondingCommand(rawCommand, props);
  }
  return parsedCommand;
}

/**
 * Takes as input the Duck's speech for a given slide, and returns 
 * the same speech but with any embedded commands in braces replaced with
 * the result of applying those commands.
 */
function parseSpeech(speech: string, props: DuckProps) {
  const re = /(\{[\S\s]+?\})/g;
  const splitSpeech = speech.split(re).filter(Boolean);
  const parsedSpeech = splitSpeech.map(x => parseTextCommand(x, props));
  return parsedSpeech;
}

function inTutorial(props: DuckProps): boolean {
  return props.tutorialCode !== undefined && props.tutorialCode !== '# Fetching tutorial...';
}

/**
 * Renders the Duck, starting from the specified slide.
 */
function MakeButtons(initialSlide: string, props: DuckProps) {
  const classes = useStyles();
  const [slide, setSlide] = useState(initialSlide);  
  // Here useState is a 'Hook' (from React) which means the slide variable is updated when the setSlide function is run

  return (
    <Space.Fixed height={600} width={600}>
      <div>
        <img src={duck} height={600} width={600} alt="cartoon duck" />
      </div>

      <Space.Left size={60}></Space.Left>

      <Space.Fill>
        <Space.Top size={20}></Space.Top>
        <Space.Fill>
          <Space.Fill>
            <Typography className={classes.speech}>
              {parseSpeech(jsonData[slide].speech, props)}
            </Typography>
            <Grid container justify="center" alignItems="flex-start" spacing={2}>
              {jsonData[slide].buttons.map(function (button: SlideButton) {
                return (
                  <div key={button.text}>
                    <Grid item xs>
                      <ThemeProvider theme={theme}>
                        <Button
                          className={classes.button}
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            if (button.link === '{inTutorial ? Ask if want to compare : Duck gives up}') {
                              const link = inTutorial(props) ? 'Ask if want to compare' : 'Duck gives up';
                              setSlide(link);
                            } else if (button.link) {
                              // prevSlideParams = button.params;
                              setSlide(button.link);
                            } else {  // this runs if button.link is null
                              props.closeDuck();
                            }
                          }}
                        >
                          {button.text}
                        </Button>
                      </ThemeProvider>
                    </Grid>
                  </div>
                );
              })}
            </Grid>
          </Space.Fill>
        </Space.Fill>
        <Space.Bottom size={200}></Space.Bottom>
      </Space.Fill>
      <Space.Right size={250}>
        <Space.Right size={430}>
          <Space.Bottom size={600}>
            <Button
              className={classes.xButton}
              variant="contained"
              size="small"
              onClick={() => {
                props.closeDuck();
              }
              }
            >
              {'X'}
            </Button>
          </Space.Bottom>
        </Space.Right>
      </Space.Right>
    </Space.Fixed>
  );
}
MakeButtons.propTypes = {
  closeDuck: PropTypes.func
};

export default function StartSlides(props: DuckProps): JSX.Element {
  return MakeButtons(slideNames[0], props);
}
