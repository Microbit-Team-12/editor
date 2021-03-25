/* eslint @typescript-eslint/no-var-requires: "off" */

import Grid from '@material-ui/core/Grid';
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
const slideNames = Object.keys(jsonData);

function MakeButtons(initialSlide) {
  const classes = useStyles();
  const [slide, setSlide] = useState(initialSlide);  
  // Here useState is a 'Hook' (from React) which means the slide variable is updated when the setSlide function is run

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
                    onClick={() => {
                      if (button.link) {  // this checks button.link isnt null
                        setSlide(button.link);
                      }
                      else {  // whatever we want the null function to be
                        //window.close();
                        setSlide(initialSlide);
                      }
                    }}>
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
  return MakeButtons(slideNames[0]);
}
