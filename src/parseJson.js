/* eslint @typescript-eslint/no-var-requires: "off" */

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';

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
var slide_names = Object.keys(jsonData);

function MakeButtons(initial_slide) {
  const classes = useStyles();
  var [slide, setSlide] = useState(initial_slide);

  return (
    <Grid container spacing={3}>
      <Typography className={classes.speech}>{jsonData[slide].speech}</Typography>
      <Grid container spacing={3}>
        {
          jsonData[slide].buttons.map(function (button) {
            return (
              <div key={button}>
                <Grid item xs>
                  <button 
                    className={classes.button} 
                    onClick={() => setSlide(button.link)}>
                    {button.text}
                  </button>
                </Grid>
              </div>);
          })
        }
      </Grid>
    </Grid>
  );
}

export default function StartSlides() {
  return MakeButtons(slide_names[0]);
}
