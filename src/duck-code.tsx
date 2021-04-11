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
  text: string
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

const jsonData = require('./resources/duck_flowchart.json');
const slideNames = Object.keys(jsonData);

const tutorials = {
  HelloWorld: 
`from microbit import *
display.scroll("Hello, World!")`,
  
  SimpleButtons: 
`if button_a.is_pressed():
    display.show(Image.MUSIC_QUAVER)
    music.play(music.NYAN)
if button_b.is_pressed():
    display.show(Image.MEH)`
};

function executeCorrespondingCommand(commandString: string, props: DuckProps) {
  if (commandString === 'linkToTutorialAboutErrors') {
    return (
      <a href="https://example.com/faq.html" target="_blank" rel="noreferrer">
        Tutorial about errors
      </a>
    );
  }
  else if (commandString === 'get_readable_diff(prev_button.params[0], error_message.line_no)') {
    return readableDiffMessage(props);

  }
  else {
    return commandString;
  }
} 

function readableDiffMessage(props: DuckProps) {
  if (props.lineNumber && props.lineText) {
    const strippedText = props.lineText.trim();
    const list = tutorials.HelloWorld.split('\n').map(x => x.trim());
    const fuse = new Fuse(list);
    const result = fuse.search(strippedText);
    if (result.length > 0) {
      return (<div> 
        The closest matching line in the tutorial is line
        {result[0].refIndex} which reads: <br></br>  {result[0].item}
      </div>);
    }
    else {
      return ('Unfortunately, your line does not look like any of the lines in the tutorial.');
    }
  }
  else return ('I cannot see your error message. Perhaps press \'RUN CODE\' again, and double check that an error message is visible?');
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
                            if (button.link) {
                              // this checks button.link isnt null
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