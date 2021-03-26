/* eslint @typescript-eslint/no-var-requires: "off" */

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import * as Space from 'react-spaces';

const useStyles = makeStyles( (theme) => ({
  button: {
    flexGrow: 1,
    background: '#FE6B8B',
    border: 1,
    borderRadius: 3,
    color: 'black',
    height: 48,
    padding: theme.spacing(2),
    margin: 8,
    textAlign: 'center'
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

var jsonData = require('./resources/duck_flowchart.json');
const slideNames = Object.keys(jsonData);

function executeCorrespondingCommand(commandString) {
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

function parseTextCommand(commandString) {
  var parsedCommand = commandString;
  if (commandString.startsWith('{')) { 
    // must also then end with '}'
    var rawCommand = commandString.slice(1, -1); // remove surrounding braces
    parsedCommand = executeCorrespondingCommand(rawCommand);
  }
  return parsedCommand;
}

function parseSpeech(speech) {
  var re = /(\{[\S\s]+?\})/g;
  var splitSpeech = speech.split(re).filter(Boolean);
  var parsedSpeech = splitSpeech.map(parseTextCommand);
  return parsedSpeech;
}

function MakeButtons(initialSlide) {
  const classes = useStyles();
  const [slide, setSlide] = useState(initialSlide);  
  // Here useState is a 'Hook' (from React) which means the slide variable is updated when the setSlide function is run

  return (
    <Space.Fixed height={400} width={300}>
      <Space.Top size={100}>
        {jsonData[slide].speech}
      </Space.Top>
      <Space.Bottom size={300}>
        <Grid container justify="center" alignItems="flex-start" spacing={2}>
          {jsonData[slide].buttons.map(function (button) {
            return (
              <div key={button}>
                <Grid item xs>
                  <button
                    className={classes.button}
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
                  </button>
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
