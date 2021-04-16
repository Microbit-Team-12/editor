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
  lineText?: string
}

type SlideButton = {
  link: string,
  text: string,
  params: string[]
}

const theme = createMuiTheme({
  palette: {
    primary: {
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
  xButton: {
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

let prevSlideParams: string[] = [];
const jsonData = require('./resources/duck_flowchart.json');
const slideNames = Object.keys(jsonData);

const tutorials = {
  'HelloWorld': 
`from microbit import *
display.scroll("Hello, World!")`,
  
  'SimpleButtons': 
`from microbit import *
import music

while True:
    if button_a.is_pressed():
        display.show(Image.MUSIC_QUAVER)
        music.play(music.NYAN)
    if button_b.is_pressed():
        display.show(Image.MEH)
        music.play(music.POWER_DOWN)

    display.show(Image.COW)`
};

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
    return readableErrorLineNumber(props);
  }
  else {
    return commandString;
  }
} 

function readableErrorLineNumber(props: DuckProps) {
  if (props.lineNumber) {
    return (<div>
      Your error message tells you that the error is on line 
      {props.lineNumber}, 
      so I’ve highlighted that line for you in the editor. 
      What type of error is displayed?
    </div>);
  }
  else {
    return ('I cannot see your error message. Perhaps press \'RUN CODE\' again, and double check that an error message is visible?');
  }

}

function readableDiffMessage(props: DuckProps) {
  if (props.lineNumber && props.lineText) {
    const strippedCodeLine = props.lineText.trim();
    const tutorial = tutorials[prevSlideParams[0] as keyof typeof tutorials];
    const strippedTutorialLines = tutorial.split('\n').map(x => x.trim());
    const fuse = new Fuse(strippedTutorialLines, { includeMatches: true, isCaseSensitive: true });
    const result = fuse.search(strippedCodeLine);
    if (result.length > 0) {
      const closestLine = result[0];
      const highlights = highlightDiffLine(strippedCodeLine, closestLine.item);
      return (<div>
        The closest matching line in the tutorial is line {closestLine.refIndex + 1} which reads: <br />
        {convert(closestLine.item, highlights[1])} <br />
        whereas your line reads: <br />
        {convert(strippedCodeLine, highlights[0])}
      </div>);
    }
    else {
      return ('Unfortunately, your line does not look like any of the lines in the tutorial.');
    }
  }
  else return ('I cannot see your error message. Perhaps press \'RUN CODE\' again, and double check that an error message is visible?');
}

// This returns two arrays representing what indexes to highlight in writtenLine and perfectLine respectively
function highlightDiffLine(writtenLine: string, perfectLine: string): [number[], number[]] {
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
      }
      else {
        const locationPerfect: number | undefined = lookFor(writtenLine.slice(iWritten, iWritten + 2), perfectLine, iPerfect); // Checks the next few characters of perfectLine for any matches with the next two characters of writtenLine
        const locationWritten: number | undefined = lookFor(perfectLine.slice(iPerfect, iPerfect + 2), writtenLine, iWritten); // Checks the next few characters of writtenLine for any matches with the next two characters of perfectLine
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

  function lookFor(couple: string, long: string, iStart: number) {  // couple should be 2 characters long
    for (let i = iStart; i !== iStart + 2 && i + 1 < long.length; i++) {
      if (long[i] === couple[0] && long[i + 1] === couple[1]) { return i; }
    }
    return undefined;
  }

  return [highlightsWritten, highlightsPerfect];
}

// Returns line as a JSX.Element with the highlights indexes all highlighted
function convert(line: string, highlights: number[]) {
  const convertedLine = [];

  for (let i = 0; i < line.length; i++) {
    if (i === highlights[0]) {
      highlights.shift();
      convertedLine.push(<span>{
        <Typography color='secondary' display="inline">
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

function parseTextCommand(commandString: string, props: DuckProps) {
  let parsedCommand: string|JSX.Element = commandString;
  if (commandString.startsWith('{')) { 
    // must also then end with '}'
    const rawCommand = commandString.slice(1, -1); // remove surrounding braces
    parsedCommand = executeCorrespondingCommand(rawCommand, props);
  }
  return parsedCommand;
}

function parseSpeech(speech: string, props: DuckProps) {
  const re = /(\{[\S\s]+?\})/g;
  const splitSpeech = speech.split(re).filter(Boolean);
  const parsedSpeech = splitSpeech.map(x => parseTextCommand(x, props));
  return parsedSpeech;
}

function MakeButtons(initialSlide: string, props: DuckProps) {
  const classes = useStyles();
  const [slide, setSlide] = useState(initialSlide);  
  // Here useState is a 'Hook' (from React) which means the slide variable is updated when the setSlide function is run

  return (
    <Space.Fixed height={650} width={600}>
      <div>
        <img src={duck} height={650} width={600} alt="cartoon duck" />
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
                            if (button.link) {
                              // this checks button.link isnt null
                              prevSlideParams = button.params;
                              setSlide(button.link);
                            } else {
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
        <Space.Right size={65}>
          <Button
            className={classes.xButton}
            variant="contained"
            onClick={() => {
              props.closeDuck();
            }
            }
          >
            {'X'}
          </Button>
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