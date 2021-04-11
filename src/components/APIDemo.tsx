/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Box, Button } from '@material-ui/core';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import { Stream } from 'ts-stream';
import { FailedConnection, MicrobitConnection, MicrobitOutput } from '../api/microbit-api';
import {
  checkCompatability,
  connectByPariedDevice, connectByPlugIn,
  connectBySelection
} from '../api/microbit/connect';
import DuckViewer from '../duck-code';
import './APIDemo.css';
import DocsViewer from './DocsViewer';

type APIDemoState = {
  /** The markdown of the tutorial being displayed. */
  docs: string,
  output: string,
  connection: MicrobitConnection | null,
  editor: monaco.editor.IStandaloneCodeEditor | null,
  needDuck: boolean,
  /** The most recent error message for the user, if one exists (otherwise, empty string) */
  errorString: string,
  errorLine: number
}

const exampleCode = `from microbit import *
import music

while True:
    if accelerometer.was_gesture('shake'):
        display.show(Image.CONFUSED)
        sleep(1500)
    if accelerometer.was_gesture('face up'):
        display.show(Image.HAPPY)
    if accelerometer.was_gesture('left'):
        display.show('<')
        music.play(music.JUMP_UP)
    if accelerometer.was_gesture('right'):
        display.show('>')
        music.play(music.JUMP_DOWN)
`;


const exampleDocs = `# Title

Did you know you can use tildes instead of backticks?

~~~py
# LINES 6-10
from microbit import *
import music

while True:
    if button_a.is_pressed():
        display.show(Image.MUSIC_QUAVER)
        music.play(music.NYAN)
    if button_b.is_pressed():
        display.show(Image.MEH)
        music.play(music.POWER_DOWN)
    
    display.show(Image.COW)
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
      needDuck: false,
      errorString: '',
      errorLine: 0
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

  renderDuck(): JSX.Element {
    let renderedDuck;
    if (this.state.errorString !== '') {
      renderedDuck = <DuckViewer 
        closeDuck={this.exileDuck.bind(this)} 
        lineNumber={this.state.errorLine}
        lineText={this.state.editor!.getValue().split('\n')[this.state.errorLine - 1]} 
      />;
    }
    else {
      renderedDuck = <DuckViewer closeDuck={this.exileDuck.bind(this)} />;
    }
    return renderedDuck;
  }

  renderTutorialOrDuck(): JSX.Element {
    let extraComponent;
    if (this.state.needDuck) {
      extraComponent = <div>
        <h1>
          {this.state.errorString}
        </h1>
        {this.renderDuck()}
      </div>;
    }
    else {
      extraComponent = <DocsViewer
        markdown={this.state.docs}
        onFlash={this.state.connection === null ? undefined : this.onFlash.bind(this)}
        onLoad={this.onLoad.bind(this)}
      />;
    }
    return extraComponent;
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
          {this.renderButtonRequiringConnection('Debugging help', this.summonDuck.bind(this))}
        </header>
        <div className="APIDemo-textareas">
          {this.renderTutorialOrDuck()}
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
    if (editor == null) {
      alert('Editor is not loaded');
      return;
    }

    const selection = editor.getSelection();
    if (selection == null) {
      alert('selection is null');
      return;
    }
    const position = selection.getPosition();
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: position.column,
      endColumn: position.column,
    };
    editor.getModel()?.pushEditOperations(
      [selection],
      [
        {
          range,
          text: codeSnippet,
        }
      ],
      (_) => null,
    ); // second parameter set to true to enable undo's
    editor.focus();
  }

  summonDuck(): void {
    this.setState({ needDuck: true });
  }

  exileDuck(): void {
    this.setState({ needDuck: false });
  }

  async onStart(): Promise<void> {
    if (!(await this.connect(connectByPariedDevice())))
      await this.connect(connectBySelection());
    //this.connect(connectByPlugIn());
  }

  async onExec(outputStream: Stream<MicrobitOutput>): Promise<void> {
    await outputStream.forEach(output => {
      switch (output.kind){
        case 'NormalOutput':
          this.setState({
            output: output.outputChunk,
            errorString: ''
          });
          break;
        case 'ResetPressed':
          console.log('ResetPressed');
          break;
        case 'ErrorMessage':
          if (output.type !== 'KeyboardInterrupt'){
            console.log(output.message);
            this.setState({ 
              errorString: 'Error on line ' + output.line + ':\n' + output.type + ': ' + output.message ,
              errorLine: output.line
            });
            this.exileDuck(); // close Duck before reopening, to reset it.
            this.summonDuck();
            alert(this.state.errorString);
          }
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
    console.log('onRun');
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
