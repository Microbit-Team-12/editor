/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from '@material-ui/core';
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
import { Tutorial, TutorialList, TutorialLocation, TutorialResolver } from '../tutorial';
import './MainApp.css';
import { SideBar } from './SideBar';
import TutorialViewer from './TutorialViewer';

interface MainAppProps {
  tutorialList: TutorialList
  tutorialResolver: TutorialResolver
}

interface MainAppState {
  /** The tutorial being displayed. null if the tutorial is unavailable. */
  tutorial: Tutorial | null,

  /** Output from the micro:bit serial */
  output: string,

  /** Active connection to the micro:bit */
  connection: MicrobitConnection | null,

  needDuck: boolean,

  editor: monaco.editor.IStandaloneCodeEditor | null,
  monaco: Monaco | null,

  /** The most recent error message for the user, if one exists (otherwise, empty string) */
  errorString: string,
  errorLine: number,
  errorMonacoIDs: string[] | null
}

const exampleCode = 
`# Add your Python code here. E.g.
from microbit import *

while True:
    display.scroll('Hello, World!')
    display.show(Image.HEART)
    sleep(2000)
`;

class MainApp extends React.Component<MainAppProps, MainAppState> {
  constructor(props: MainAppProps) {
    super(props);
    this.state = {
      tutorial: null,
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
    this.beforeExecution = this.beforeExecution.bind(this);
  }

  async handleTutorialPathChange(newLocation: TutorialLocation): Promise<void> {
    const tutorial = await this.props.tutorialResolver.resolve(newLocation);

    if (tutorial !== null) {
      this.setState({ tutorial });
    } else {
      alert('Failed to access tutorial. Please try again later.');
    }
  }

  async componentDidMount(): Promise<void> {
    // Fetch a default tutorial once mounted.
    await this.handleTutorialPathChange(this.props.tutorialList.default);
  }

  /**
   * Called once the Monaco editor is mounted to set
   * {@link MainAppState.editor} and {@link MainAppState.monaco}.
   */
  handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco): void {
    this.setState({
      editor: editor,
      monaco: monaco,
    });

    const fetchCompletions = async (prefix: string) => {
      if (this.hasFreeConnection()) {
        return this.state.connection!.interact.getCompletions(prefix);
      } else return [];
    };

    monaco.languages.registerCompletionItemProvider(
      'python',
      {
        triggerCharacters: ['_', '.', '(', '['],
        async provideCompletionItems(model, position, _, __) {
          const line = model.getLineContent(position.lineNumber);
          let j = position.column - 1;
          while (j >= 0 && line[j] !== ' ') j -= 1;
          const startColumn = j + 1;
          const word = line.slice(startColumn, position.column - 1);

          const completions = await fetchCompletions(word);
          // Two issues here:
          // 1. 'help(d' -> 'help(display' --- need to replace the entire word
          // 2. 'b' -> 'button_', to be completed again
          if (completions.length === 1) {
            const completion = completions[0];
            const wordRange = {
              startColumn: startColumn + 1,
              endColumn: position.column,
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
            };

            // Deals with case 1
            if (!completion.endsWith('_')) {
              return {
                suggestions: [{
                  kind: monaco.languages.CompletionItemKind.Constant,
                  label: completion,
                  insertText: completion,
                  range: wordRange,
                }],
              };
            }

            // Deals with case 2 (and 1)
            return {
              suggestions: [{
                kind: monaco.languages.CompletionItemKind.Constant,
                label: completion,
                range: wordRange,
                // hack to insert '_' to trigger another completion
                insertText: completion.slice(0, -1),
                // additionalTextEdits: [{
                //   range: {},
                //   text: '_',
                // }],
              }]
            };
          }
          return {
            suggestions: completions.map((suggestion) => {
              return {
                kind: monaco.languages.CompletionItemKind.Constant,
                label: suggestion,
                insertText: suggestion,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any;
            }),
          };
        }
      },
    );
  }

  /**
   * @summary Disconnect the micro:bit before unmounting.
   *
   * For dev purposes only: upon recompilation, this component loses access to
   * the {@link MainAppState.connection} object; if the web serial connection
   * is not terminated here, the page must needs to be refreshed to reclaim the
   * micro:bit interface.
   *
   * In production, {@link MainApp} is intended to be the top-level component
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
   * The 'Start' button is enabled only when {@link MainAppState.connection} is null,
   * as it is intended to be used when:
   * - the user first opens the page, and connects the micro:bit
   * - the micro:bit is disconnected, and the user wants to reconnect it (or to
   *   connect another one)
   *
   * {@link MicrobitState.Busy} and {@link MicrobitState.Free} document when
   * the other micro:bit related buttons are enabled.
   * In addition, since the 'Flash' and 'Run' buttons in the header requires
   * access to the code in the editor, they are enabled only when
   * {@link isEditorMounted} returns true.
   *
   * The duck 'Help' button is always enabled.
   */
  renderHeaderButton(text: string, callback: () => void, isEnabled: () => boolean): JSX.Element {
    const safeOnClickCallback = () => {
      if (isEnabled()) {
        callback();
      } else {
        alert(`UI lied: button ${text} should NOT be enabled`);
        this.setState({});
      }
    };

    return (
      <Button
        className="MainApp-button"
        variant="contained"
        size="large"
        disabled={!isEnabled()}
        onClick={safeOnClickCallback}
      >
        {text}
      </Button>
    );
  }

  /**
   * Return true if the state of {@link MainAppState.connection} is
   * {@link MicrobitState.Free}, and false otherwise.
   */
  hasFreeConnection(): boolean {
    return this.state.connection?.interact.getState() === MicrobitState.Free;
  }

  /**
   * Return true if the state of {@link MainAppState.connection} is
   * {@link MicrobitState.Busy}, and false otherwise.
   */
  hasBusyConnection(): boolean {
    return this.state.connection?.interact.getState() === MicrobitState.Busy;
  }

  /**
   * Return true if {@link MainAppState.editor} has been assigned.
   */
  isEditorMounted(): boolean {
    return this.state.editor != null;
  }

  /**
   * @param md the text from the markdown file of the tutorial
   * @returns the code of md
   */
  getTuteCode(md: string): string {
    const lines = md.split('\n');
    const code = [];
    let i = 0;

    while (i < lines.length) {
      if (lines[i].slice(0, 5) === '```py') {
        i++;
        while (lines[i].slice(0, 3) !== '```') {
          code.push(lines[i]);
          i++;
        }
      } else if (lines[i].slice(0, 5) === '~~~py') {
        i++;
        while (lines[i].slice(0, 3) !== '~~~') {
          code.push(lines[i]);
          i++;
        }
      }
      i++;
    }

    return code.join('\n');
  }

  /**
   * Renders the duck, passing in the line number and line text 
   * of the Python error message, if one exists.
   */
  renderDuck(): JSX.Element {
    const tutorialCode = this.getTuteCode(this.state.tutorial?.raw_content ?? '');

    if (this.state.tutorial?.disable_duck) {
      return <DuckViewer
        closeDuck={this.exileDuck.bind(this)}
        tutorialCode={tutorialCode}
        isErrorTute={true}
      />;
    }
    return (this.state.errorString === '' || this.state.tutorial?.disable_duck) ? 
      <DuckViewer
        closeDuck={this.exileDuck.bind(this)}
        tutorialCode={tutorialCode}
      /> : 
      <DuckViewer 
        closeDuck={this.exileDuck.bind(this)}
        lineNumber={this.state.errorLine}
        lineText={this.state.editor!.getValue().split('\n')[this.state.errorLine - 1]}
        tutorialCode={tutorialCode}
      />
    ;
  }

  /**
   * Render {@link MainAppState.tutorial} with {@link TutorialViewer} unless
   * {@link MainAppState.needDuck} is true, in which case
   * {@link MainAppState.errorString} and the duck (via {@link renderDuck}) are
   * rendered instead.
   */
  renderTutorial(): JSX.Element {
    return <div className="MainApp-tutorial">
      {this.state.needDuck
        ? <div>
          <h1>
            {this.state.errorString}
          </h1>
          {this.renderDuck()}
        </div>
        : <TutorialViewer
          markdown={this.state.tutorial?.raw_content ?? '# Fetching tutorial...'}
          onRun={this.onRunCell.bind(this)}
          onRunFinished={() => this.setState({})}
          canRun={this.hasFreeConnection.bind(this)}
          onInsertIntoEditor={this.onInsertIntoEditor.bind(this)}
          canInsertInsertIntoEditor={this.isEditorMounted.bind(this)}
        />
      }
    </div>;
  }

  /**
   * Render the python code editor.
   *
   * The default code is {@link exampleCode}.
   * The current code can be accessed via {@link MainAppState.editor}.
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
        wrapperClassName="MainApp-code"
      />
    );
  }

  /**
   * Render a text box displaying {@link MainAppState.output}.
   */
  renderOutput(): JSX.Element {
    return (
      <textarea
        className="MainApp-output"
        value={this.state.output}
        readOnly
      />
    );
  }

  render(): JSX.Element {
    return (
      <div className="MainApp">
        <div className="MainApp-header">
          <header className="MainApp-header-buttons">
            {this.renderHeaderButton(
              'Start',
              this.onStart.bind(this),
              () => this.state.connection == null,
            )}
            {this.renderHeaderButton(
              'Flash',
              () => this.onFlash(this.state.editor!.getValue()),
              () => this.isEditorMounted() && this.hasFreeConnection(),
            )}
            {this.renderHeaderButton(
              'Run',
              () => this.onRun(this.state.editor!.getValue()),
              () => this.isEditorMounted() && this.hasFreeConnection(),
            )}
            {this.renderHeaderButton(
              'Interrupt',
              this.onInterrupt.bind(this),
              () => this.hasBusyConnection(),
            )}
            {this.renderHeaderButton(
              'Reboot',
              this.onReboot.bind(this),
              () => this.hasFreeConnection(),
            )}
            {this.renderHeaderButton(
              'Help',
              this.summonDuck.bind(this),
              () => true,
            )}
          </header>
          <SideBar tutorialList={this.props.tutorialList} onTutorialSelection={this.handleTutorialPathChange.bind(this)} />
        </div>
        <div className="MainApp-body">
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
   * Insert the code snippet into {@link MainAppState.editor} at the cursor.
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

  /**
   * Make the Duck appear, in place of the tutorial
  */
  summonDuck(): void {
    this.setState({needDuck: true});
  }

  /**
   * Make the Duck disappear, the tutorial takes its place.
  */
  exileDuck(): void {
    this.setState({needDuck: false});
  }

  async onStart(): Promise<void> {
    if (!(await this.connect(connectByPariedDevice())))
      await this.connect(connectBySelection());
    //this.connect(connectByPlugIn());
  }

  beforeExecution(): void {
    const editor = this.state.editor!;
    const ids = this.state.errorMonacoIDs;
    editor.updateOptions({
      readOnly: true
    });
    if (ids != null) {
      this.exileDuck();
      editor.deltaDecorations(ids, []);
      this.setState({
        errorMonacoIDs: null
      });
    }
  }

  afterExecution(): void {
    this.state.editor!.updateOptions({
      readOnly: false
    });
    // Notify the app that the connection has freed up
    this.setState({});
  }

  async onExec(outputStream: Stream<MicrobitOutput>): Promise<void> {
    // Notify the device that the connected micro:bit is now busy
    this.setState({});

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
    this.afterExecution();
  }

  async onFlash(code: string): Promise<void> {
    console.log('onFlash');
    this.beforeExecution();
    await this.onExec(await this.state.connection!.interact.flash(code));
  }

  async onRun(code: string): Promise<void> {
    console.log('onRun');
    this.beforeExecution();
    await this.onExec(await this.state.connection!.interact.execute(code));
  }

  /**
   * Execute the supplied code, and return a promise resolving to the output
   * stream of the micro:bit running the code.
   */
  async onRunCell(code: string): Promise<Stream<MicrobitOutput>> {
    console.log('onRunCell');
    this.beforeExecution();
    return await this.state.connection!.interact.execute(code);
  }

  async onReboot(): Promise<void> {
    console.log('onReboot');
    this.beforeExecution();
    await this.onExec(await this.state.connection!.interact.reboot());
  }

  async onInterrupt(): Promise<void> {
    await this.state.connection!.interact.interrupt();
    this.state.editor!.updateOptions({
      readOnly: false
    });

    this.afterExecution();
  }
}

export default MainApp;
