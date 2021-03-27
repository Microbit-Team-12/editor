/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Editor, { loader, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import { Stream } from 'ts-stream';
import { Box, Button } from '@material-ui/core';
import { FailedConnection, MicrobitConnection, MicrobitOutput } from '../api/microbit-api';
import {
  checkCompatability,
  connectByPariedDevice, connectByPlugIn,
  connectBySelection
} from '../api/microbit/connect';
import './APIDemo.css';
import DocsViewer from './DocsViewer';

type APIDemoState = {
  /** The markdown of the tutorial being displayed. */
  docs: string,
  /** The code in the editor. */
  code: string,
  output: string,
  connection: MicrobitConnection | null,
  editor: monaco.editor.IStandaloneCodeEditor | null,
}

const exampleCode = `from microbit import *

while True:
    display.scroll('Hello, World!')
    `;


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

class APIDemo extends React.Component<unknown, APIDemoState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      docs: exampleDocs,
      code: exampleCode,
      output: '',
      connection: null,
      editor: null,
    };
    // Better for performance than binding or using () => ... inside render
    this.onStart = this.onStart.bind(this);
    this.onFlash = this.onFlash.bind(this);
    this.onReboot = this.onReboot.bind(this);
    this.onExec = this.onExec.bind(this);
    this.onInterrupt = this.onInterrupt.bind(this);
    this.onRun = this.onRun.bind(this);
    this.connect = this.connect.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    if (!checkCompatability()) alert('Browser not supported');

    loader.init().then(t=>{console.log(t);});
  }

  componentWillUnmount(): void {
    if (this.state.connection !== null) {
      // TODO disconnect here
      // It makes more sense to have connection as part of the state
      // rather than a global variable, since there will only be one
      // instance of APIDemo / App running anyways.
    }
  }

  renderStartButton(): JSX.Element {
    return <Box paddingLeft={2}>
      <Button
        className="APIDemo-button"
        variant="contained"
        disabled={this.state.connection !== null}
        onClick={this.onStart}
      >
        Start
      </Button>
    </Box>;
  }

  renderButtonRequiringConnection(text: string, callback: () => void): JSX.Element {
    return (
      <Box paddingLeft={2}>
        <Button
          className="APIDemo-button"
          variant="contained"
          disabled={this.state.connection === null}
          onClick={() => callback()}
        >
          {text}
        </Button>
      </Box>
    );
  }

  handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, _: Monaco):void {
    this.setState({
      editor: editor,
    });
  }

  render(): JSX.Element {
    return (
      <div className="APIDemo">
        <header className="APIDemo-header">
          {this.renderStartButton()}
          {this.renderButtonRequiringConnection('Run Code', () => this.onRun(this.state.code))}
          {this.renderButtonRequiringConnection('Flash Code', () => this.onFlash(this.state.code))}
          {this.renderButtonRequiringConnection('Interrupt', this.onInterrupt)}
          {this.renderButtonRequiringConnection('Reboot', this.onReboot)}
          <button className="APIDemo-button" onClick={this.onStart}>Start</button>
          <button className="APIDemo-button" onClick={() => this.onRun(this.state.editor!.getValue())}>Run Code</button>
          <button className="APIDemo-button" onClick={() => this.onFlash(this.state.editor!.getValue())}>Flash Code</button>
          <button className="APIDemo-button" onClick={this.onInterrupt}>Interrupt</button>
          <button className="APIDemo-button" onClick={this.onReboot}>Reboot</button>
        </header>
        <div className="APIDemo-textareas">
          <DocsViewer
            markdown={this.state.docs}
            onFlash={this.state.connection === null ? undefined : this.onFlash}
            onLoad={this.onLoad}
          />

          <Editor
            width="30vw"
            height="90vh"
            defaultLanguage="python"
            defaultValue={exampleCode}
            onMount={this.handleEditorDidMount}
            theme='light'
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 18,
            }}
            wrapperClassName="APIDemo-code"
          />

          <textarea value={this.state.output} readOnly className="APIDemo-output" />
        </div>
      </div>
    );
  }

  async connect(connection: Promise<MicrobitConnection | FailedConnection>): Promise<boolean> {
    const c = await connection;
    switch (c.kind) {
      case 'ConnectionFailure':
        alert(c.reason);
        return false;
      case 'MicrobitConnection':
        this.setState({ connection: c });
        c.disconnection.then(async () => {
          alert('Serial disconnected');
          this.setState({ connection: null }, async () => {
            await this.connect(connectByPlugIn());
            alert('Serial reconnected');
          });
        });
        return true;
    }
  }

  onLoad(codeSnippet: string): void {
    // Shouldn't access this.state inside setState
    const editor = this.state.editor;
    editor!.setValue(editor!.getValue() + '\n' + codeSnippet);
  }

  async onStart(): Promise<void> {
    if (!(await this.connect(connectByPariedDevice())))
      await this.connect(connectBySelection());
    //this.connect(connectByPlugIn());
  }

  async onExec(outputStream: Stream<MicrobitOutput>): Promise<void> {
    await outputStream.forEach(output => {
      if (output.kind === 'NormalOutput') {
        this.setState({
          output: output.outputChunk
        });
      } else if (output.type !== 'KeyboardInterrupt') {
        alert('Error on line ' + output.line + ':\n' + output.type + ': ' + output.message);
      }
    });
  }

  async onFlash(code: string): Promise<void> {
    console.log('onFlash');
    if (this.state.connection !== null) {
      await this.onExec(await this.state.connection.interact.flash(code));
    } else {
      alert('No device is connected. Press \'Start\' to connect a device.');
    }
  }

  async onRun(code: string): Promise<void> {
    console.log('onFlash');
    if (this.state.connection !== null) {
      await this.onExec(await this.state.connection.interact.execute(code));
    } else {
      alert('No device is connected. Press \'Start\' to connect a device.');
    }
  }

  async onReboot(): Promise<void> {
    console.log('onReboot');
    if (this.state.connection !== null) {
      await this.onExec(await this.state.connection.interact.reboot());
    } else {
      alert('No device is connected. Press \'Start\' to connect a device.');
    }
  }

  async onInterrupt(): Promise<void> {
    if (this.state.connection !== null) {
      await this.state.connection.interact.interrupt();
    } else {
      alert('No device is connected. Press \'Start\' to connect a device.');
    }
  }
}

export default APIDemo;
