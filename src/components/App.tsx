import React from 'react';
import './App.css';
import DocsViewer from './DocsViewer';
import { MicrobitConnection } from '../api/microbit-api';

type AppState = {
  /** The code in the editor. */
  code: string,
  /** The markdown of the tutorial being displayed. */
  docs: string,
  connection?: MicrobitConnection,
}

const exampleCode = `from microbit import *

display.show(1)`;

const exampleDocs = `# Title

Did you know you can use tildes instead of backticks?

~~~py
# LINES 5-6
from microbit import *

while True:
    display.scroll('Hello, World!')
    display.show(Image.HEART)
    sleep(2000)
~~~

More text
`;

class App extends React.Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      code: exampleCode,
      docs: exampleDocs,
      connection: undefined,
    };
  }

  render(): JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <button className="App-button">Start</button>
          <button className="App-button">Run Code</button>
          <button className="App-button">Flash Code</button>
          <button className="App-button">Interrupt</button>
          <button className="App-button">Reboot</button>
        </header>
        <div className="App-textareas">
          <DocsViewer markdown={this.state.docs} onFlash={this.state.connection?.interact.flash}/>
          <textarea className="App-editor">{this.state.code}</textarea>
        </div>
      </div>
    );
  }
}

export default App;
