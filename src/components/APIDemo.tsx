/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Box, Button } from '@material-ui/core';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import { Stream } from 'ts-stream';
import { FailedConnection, MicrobitConnection, MicrobitOutput, MicrobitState } from '../api/microbit/interface/message';
import {
  checkCompatability,
  connectByPariedDevice,
  connectByPlugIn,
  connectBySelection
} from '../api/microbit/impl/connect';
import DuckViewer from '../duck-code';
import './APIDemo.css';
import DocsViewer from './DocsViewer';

type APIDemoState = {
  /** The markdown of the tutorial being displayed. */
  docs: string,
  output: string,
  connection: MicrobitConnection | null,
  editor: monaco.editor.IStandaloneCodeEditor | null,
  monaco: Monaco | null,
  needDuck: boolean,
  /** The most recent error message for the user, if one exists (otherwise, empty string) */
  errorString: string,
  errorLine: number,
  errorMonacoIDs: string[] | null
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
# LINES 6-9
from microbit import *
import music

while True:
    if button_a.is_pressed():
        print('A')
        display.show(Image.MUSIC_QUAVER)
        music.play(music.NYAN)
    if button_b.is_pressed():
        print('B')
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
      monaco: null,
      needDuck: false,
      errorString: '',
      errorLine: 0,
      errorMonacoIDs: null
    };
    if (!checkCompatability()) alert('Browser not supported');

    loader.init().then(t => {
      console.log(t);
    });
    this.removeErrorLineOfCode = this.removeErrorLineOfCode.bind(this);
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

  renderButtonRequiringConnection(text: string, callback: () => void, isEnabled: boolean): JSX.Element {
    return (
      <Box paddingLeft={2}>
        <Button
          className="APIDemo-button"
          variant="contained"
          disabled={!isEnabled}
          onClick={() => callback()}
        >
          {text}
        </Button>
      </Box>
    );
  }

  hasFreeConnection(): boolean {
    return this.state.connection?.interact.getState() === MicrobitState.Free;
  }

  hasBusyConnection(): boolean {
    return this.state.connection?.interact.getState() === MicrobitState.Busy;
  }


  renderDuck(): JSX.Element {
    let renderedDuck;
    if (this.state.errorString !== '') {
      renderedDuck = <DuckViewer
        closeDuck={this.exileDuck.bind(this)}
        lineNumber={this.state.errorLine}
        lineText={this.state.editor!.getValue().split('\n')[this.state.errorLine - 1]}
      />;
    } else {
      renderedDuck = <DuckViewer closeDuck={this.exileDuck.bind(this)}/>;
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
    } else {
      extraComponent = <DocsViewer
        markdown={this.state.docs}
        onRun={this.onRunCell.bind(this)}
        hasFreeConnection={this.hasFreeConnection.bind(this)}
        onInsertIntoEditor={this.onLoad.bind(this)}
      />;
    }
    return extraComponent;
  }

  handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco): void {
    this.setState({
      editor: editor,
      monaco: monaco
    });
  }

  render(): JSX.Element {
    return (
      <div className="APIDemo">
        <header className="APIDemo-header">
          {this.renderStartButton()}
          {this.renderButtonRequiringConnection('Flash', () => this.onFlash(this.state.editor!.getValue()), this.hasFreeConnection())}
          {this.renderButtonRequiringConnection('Run', () => this.onRun(this.state.editor!.getValue()), this.hasFreeConnection())}
          {this.renderButtonRequiringConnection('Interrupt', this.onInterrupt.bind(this), this.hasBusyConnection())}
          {this.renderButtonRequiringConnection('Reboot', this.onReboot.bind(this), this.hasFreeConnection())}
          {this.renderButtonRequiringConnection('Help', this.summonDuck.bind(this), false)}
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

          <textarea value={this.state.output} readOnly className="APIDemo-output"/>

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
        this.setState({connection: c});
        c.disconnection.then(async () => {
          alert('Serial disconnected');
          this.setState({connection: null}, async () => {
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
    this.setState({needDuck: true});
  }

  exileDuck(): void {
    this.setState({needDuck: false});
  }

  async onStart(): Promise<void> {
    if (!(await this.connect(connectByPariedDevice())))
      await this.connect(connectBySelection());
    //this.connect(connectByPlugIn());
  }

  removeErrorLineOfCode():void {
    const editor = this.state.editor!;
    const ids = this.state.errorMonacoIDs;
    if(ids!=null){
      this.exileDuck();
      editor.deltaDecorations(ids,[]);
      this.setState({
        errorMonacoIDs: null
      });
    }
  }

  async onExec(outputStream: Stream<MicrobitOutput>): Promise<void> {
    await outputStream.forEach(output => {
      switch (output.kind) {
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
          if (output.type !== 'KeyboardInterrupt') {
            console.log(output.message);
            const editor = this.state.editor!;
            const errorMonacoID = editor.deltaDecorations([],
              [
                {
                  range: new monaco.Range(output.line, 1, output.line, 1),
                  options: {
                    isWholeLine: true, 
                    className: 'Monaco-Error-Line-Of-Code'
                  }
                },
              ]
            );
            this.setState({
              errorString: 'Error on line ' + output.line + ':\n' + output.type + ': ' + output.message,
              errorLine: output.line,
              errorMonacoIDs: errorMonacoID
            });
            this.summonDuck();
          }
      }
    });
  }

  async onFlash(code: string): Promise<void> {
    console.log('onFlash');
    this.removeErrorLineOfCode();
    await this.onExec(await this.state.connection!.interact.flash(code));
    this.setState({}); // to update the buttons at the top
  }

  async onRun(code: string): Promise<void> {
    console.log('onRun');
    this.removeErrorLineOfCode();
    await this.onExec(await this.state.connection!.interact.execute(code));
    this.setState({});
  }

  async onRunCell(code: string): Promise<Stream<MicrobitOutput>> {
    console.log('onRunCell');
    this.setState({});
    return await this.state.connection!.interact.execute(code);
  }

  async onReboot(): Promise<void> {
    console.log('onReboot');
    this.removeErrorLineOfCode();
    await this.onExec(await this.state.connection!.interact.reboot());
    this.setState({});
  }

  async onInterrupt(): Promise<void> {
    await this.state.connection!.interact.interrupt();
    this.setState({});
  }
}

export default APIDemo;
