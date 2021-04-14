import { Button } from '@material-ui/core';
import React from 'react';
import { doProgramTest } from './interact';

class TestPage extends React.Component<unknown, unknown> {
  render(): JSX.Element {
    return (
      <Button onClick={doProgramTest}> Start </Button>
    );
  }
}

export default TestPage;
