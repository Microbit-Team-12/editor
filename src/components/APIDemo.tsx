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
      output: '',
      connection: null,
      editor: null,
    };
    if (!checkCompatability()) alert('Browser not supported');

    loader.init().then(t=>{console.log(t);});
  }

  componentWillUnmount(): void {
    this.state.connection?.interact.disconnect();
  }

  renderStartButton(): JSX.Element {
    return <Box paddingLeft={2}>
      <Button
        className="APIDemo-button"
        variant="contained"
        disabled={this.state.connection !== null}
        onClick={this.onStart.bind(this)}
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
          {this.renderButtonRequiringConnection('Run Code', () => this.onRun(this.state.editor!.getValue()))}
          {this.renderButtonRequiringConnection('Flash Code', () => this.onFlash(this.state.editor!.getValue()))}
          {this.renderButtonRequiringConnection('Interrupt', this.onInterrupt.bind(this))}
          {this.renderButtonRequiringConnection('Reboot', this.onReboot.bind(this))}
        </header>
        <div className="APIDemo-textareas">
          <DocsViewer
            markdown={this.state.docs}
            onFlash={this.state.connection === null ? undefined : this.onFlash.bind(this)}
            onLoad={this.onLoad.bind(this)}
          />

          <Editor
            defaultLanguage="python"
            defaultValue={exampleCode}
            onMount={this.handleEditorDidMount.bind(this)}
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
