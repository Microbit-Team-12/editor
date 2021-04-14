/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Box, Button } from '@material-ui/core';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import { Stream } from 'ts-stream';
import {
  checkCompatability,
  connectByPariedDevice,
  connectByPlugIn,
  connectBySelection
} from '../api/microbit/impl/connect';
import { FailedConnection, MicrobitConnection, MicrobitOutput, MicrobitState } from '../api/microbit/interface/message';
import DuckViewer from '../duck-code';
import './APIDemo.css';
import TutorialViewer from './TutorialViewer';

interface APIDemoState {
  /** The markdown of the tutorial being displayed. */
  tutorial: string,
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

class APIDemo extends React.Component<unknown, APIDemoState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      tutorial: '# Fetching tutorial...',
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

  /**
   * Fetch a markdown file from `public/tutorials/` once mounted.
   */
  componentDidMount(): void {
    fetch('tutorials/ErrorTute.md')
      .then((r) => r.text())
      .then((text) =>
        this.setState({
          tutorial: text,
        }),
      );
  }

  /**
   * Called once the Monaco editor is mounted to set
   * {@link APIDemoState.editor} and {@link APIDemoState.monaco}.
   */
  handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco): void {
    this.setState({
      editor: editor,
      monaco: monaco
    });
  }

  /**
   * @summary Disconnect the micro:bit before unmounting.
   *
   * For dev purposes only: upon recompilation, this component loses access to
   * the {@link APIDemoState.connection} object; if the web serial connection
   * is not terminated here, the page must needs to be refreshed to reclaim the
   * micro:bit interface.
   *
   * In production, {@link APIDemo} is intended to be the top-level component
   * to be dismounted only when the page is closed, after which the web serial
   * connection is terminated anyways, making it unnecessary to manually invoke
   * the disconnection procedure.
   */
  componentWillUnmount(): void {
    this.state.connection?.interact.disconnect();
  }

  /**
   * @summary Renders a button in the header of the app.
   *
   * The 'Start' button is enabled only when {@link APIDemoState.connection} is null,
   * as it is intended to be used when:
   * - the user first opens the page, and connects the micro:bit
   * - the micro:bit is disconnected, and the user wants to reconnect it (or to
   *   connect another one)
   *
   * {@link MicrobitState.Busy} and {@link MicrobitState.Free} document when
   * the other micro:bit related buttons are enabled.
   *
   * The duck 'Help' button is always enabled.
   */
  renderHeaderButton(text: string, callback: () => void, isEnabled: boolean): JSX.Element {
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

  /**
   * Return true if the state of {@link APIDemoState.connection} is
   * {@link MicrobitState.Free}, and false otherwise.
   */
  hasFreeConnection(): boolean {
    return this.state.connection?.interact.getState() === MicrobitState.Free;
  }

  /**
   * Return true if the state of {@link APIDemoState.connection} is
   * {@link MicrobitState.Busy}, and false otherwise.
   */
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

  /**
   * Render {@link APIDemoState.tutorial} with {@link TutorialViewer} unless
   * {@link APIDemoState.needDuck} is true, in which case
   * {@link APIDemoState.errorString} and the duck (via {@link renderDuck}) are
   * rendered instead.
   */
  renderTutorial(): JSX.Element {
    return <div className="APIDemo-tutorial">
      {this.state.needDuck
        ? <div>
          <h1>
            {this.state.errorString}
          </h1>
          {this.renderDuck()}
        </div>
        : <TutorialViewer
          markdown={this.state.tutorial}
          onRun={this.onRunCell.bind(this)}
          hasFreeConnection={this.hasFreeConnection.bind(this)}
          onInsertIntoEditor={this.onInsertIntoEditor.bind(this)}
        />
      }
    </div>;
  }

  /**
   * Render the python code editor.
   *
   * The default code is {@link exampleCode}.
   * The current code can be accessed via {@link APIDemoState.editor}.
   */
  renderEditor(): JSX.Element {
    return (
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
    );
  }

  /**
   * Render a text box displaying {@link APIDemoState.output}.
   */
  renderOutput(): JSX.Element {
    return (
      <textarea
        className="APIDemo-output"
        value={this.state.output}
        readOnly
      />
    );
  }

  render(): JSX.Element {
    return (
      <div className="APIDemo">
        <header className="APIDemo-header">
          {this.renderHeaderButton('Start', this.onStart.bind(this), this.state.connection == null)}
          {this.renderHeaderButton('Flash', () => this.onFlash(this.state.editor!.getValue()), this.hasFreeConnection())}
          {this.renderHeaderButton('Run', () => this.onRun(this.state.editor!.getValue()), this.hasFreeConnection())}
          {this.renderHeaderButton('Interrupt', this.onInterrupt.bind(this), this.hasBusyConnection())}
          {this.renderHeaderButton('Reboot', this.onReboot.bind(this), this.hasFreeConnection())}
          {this.renderHeaderButton('Help', this.summonDuck.bind(this), true)}
        </header>
        <div className="APIDemo-body">
          {this.renderTutorial()}
          {this.renderEditor()}
          {this.renderOutput()}
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

  /**
   * Insert the code snippet into {@link APIDemoState.editor} at the cursor.
   * (If the user has never focused on the monaco editor before, the cursor is
   * actually placed on the top left, so the snippet is inserted at the very
   * start of the text.)
   * Then, the cursor is placed after the inserted text which becomes selected.
   * Also, the insertion operation is pushed onto the buffer and may be undone.
   * Finally, the editor gets the focus.
   */
  onInsertIntoEditor(codeSnippet: string): void {
    const editor = this.state.editor;
    if (editor == null) {
      alert('Editor is not loaded');
      return;
    }

    const selection = editor.getSelection();
    if (selection == null) { // Never happened
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

  removeErrorLineOfCode(): void {
    const editor = this.state.editor!;
    const ids = this.state.errorMonacoIDs;
    if (ids != null) {
      this.exileDuck();
      editor.deltaDecorations(ids, []);
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

  /**
   * Execute the supplied code, and return a promise resolving to the output
   * stream of the micro:bit running the code.
   */
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
