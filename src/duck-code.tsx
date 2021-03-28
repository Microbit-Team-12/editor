/* eslint @typescript-eslint/no-var-requires: "off" */

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { default as React, useState } from 'react';
import * as Space from 'react-spaces';

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
  speech: {
    flexGrow: 1,
    background: '#FFFFFF',
    border: 1,
    borderRadius: 3,
    color: 'black',
    height: 48,
    padding: theme.spacing(2),
    margin: 8,
    textAlign: 'left'
  },
}));

const jsonData = require('./resources/duck_flowchart.json');
const slideNames = Object.keys(jsonData);

function executeCorrespondingCommand(commandString: string) {
  if (commandString === 'linkToTutorialAboutErrors') {
    return (
      <a href="https://example.com/faq.html" target="_blank" rel="noreferrer">
        Tutorial about errors
      </a>
    );
  }
  else {
    return commandString;
  }
} 

function parseTextCommand(commandString: string) {
  let parsedCommand: string|JSX.Element = commandString;
  if (commandString.startsWith('{')) { 
    // must also then end with '}'
    const rawCommand = commandString.slice(1, -1); // remove surrounding braces
    parsedCommand = executeCorrespondingCommand(rawCommand);
  }
  return parsedCommand;
}

function parseSpeech(speech: string) {
  const re = /(\{[\S\s]+?\})/g;
  const splitSpeech = speech.split(re).filter(Boolean);
  const parsedSpeech = splitSpeech.map(parseTextCommand);
  return parsedSpeech;
}

function MakeButtons(initialSlide: string) {
  const classes = useStyles();
  const [slide, setSlide] = useState(initialSlide);  
  // Here useState is a 'Hook' (from React) which means the slide variable is updated when the setSlide function is run

  return (
    <Space.Fixed height={400} width={300}>
      <Space.Top size={100}>
        {parseSpeech(jsonData[slide].speech)}
      </Space.Top>
      <Space.Bottom size={300}>
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
                          // whatever we want the null function to be
                          //window.close();
                          setSlide(initialSlide);
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
      </Space.Bottom>
    </Space.Fixed>
  );
}

export default function StartSlides() {
  return MakeButtons(slideNames[0]);
}
