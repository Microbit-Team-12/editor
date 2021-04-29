import React from 'react';
import ReactMarkdown from 'react-markdown';
import './TutorialViewer.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@material-ui/core';
import { DoubleArrow, PlayArrow, Visibility, VisibilityOff } from '@material-ui/icons';
import { MicrobitOutput } from '../api/microbit/interface/message';
import { Stream } from 'ts-stream';


/**
 * Readonly Python code cell, with buttons to:
 * - toggle between viewing the full {@link PythonCodeProps.code} and only the
 *   highlighted fragment, as specified by `# LINES {start}-{end}` (counting
 *   from 1 like humans do, both ends inclusive) on the first line of the code;
 * - execute the full {@link PythonCodeProps.code} using
 *   {@link PythonCodeProps.onRun} and display the output and error message, if
 *   {@link PythonCodeProps.canRun} returns true;
 * - insert the highlighted fragment into the editor using
 *   {@link PythonCodeProps.onInsertIntoEditor}, if
 *   {@link PythonCodeProps.canInsertIntoEditor} returns true.
 *
 * If this meta-comment is missing or not in the correct format, the toggle
 * views button will be hidden, and the highlighted fragment is the whole
 * code for the purpose of {@link PythonCodeProps.onInsertIntoEditor}.
 */
class PythonCode extends React.Component<PythonCodeProps, PythonCodeState> {
  /**
   * Whether the first line of {@link PythonCodeProps.code} is a comment
   * specifying the extent of the highlighted fragment.
   * If false, the toggle button is hidden away.
   */
  readonly isExpandable: boolean;

  /**
   * Starting index of the highlighted fragment in {@link lines},
   * counting from 0, included.
   * Defaults to 0.
   */
  readonly highlightStart: number;

  /**
   * Ending index of the highlighted fragment in {@link lines},
   * counting from 0, excluded.
   * Defaults to {@link lines}.length.
   */
  readonly highlightEnd: number;

  /**
   * The code split by new lines, stored here to avoid repeated computation.
   */
  readonly lines: string[];

  /**
   * The highlighted lines, AKA highlighted fragment, i.e.,
   * {@link lines}[{@link highlightStart}, {@link highlightEnd}).
   */
  readonly highlightedLines: string[];

  /**
   * Parses the meta-comment specifying the highlighted fragment (if there is
   * one), compute and set the readonly properties.
   *
   * The starting line number `x` and the ending line number `y` must satisfy:
   * -   1 ≤ x, y ≤ {@link lines}.length
   *   ==> 0 ≤ x < {@link lines}.length && 0 < y ≤ {@link lines}.length
   * -   x ≤ y
   *
   * An alert is thrown if `# LINES` is matched at the start of the first line
   * but `x` and `y` cannot be parsed or don't satisfy the conditions above
   * (but not with e.g. `# LINES 1-2-3`).
   * In this case, like when `# LINES` is not matched at the start of line 0,
   * - {@link isExpandable} is set to false;
   * - {@link highlightStart} is set to 0;
   * - {@link highlightEnd} is set to {@link lines}.length.
   */
  // TODO unit test / use a proper parser
  constructor(props: PythonCodeProps) {
    super(props);

    this.isExpandable = false;
    this.lines = this.props.code.split('\n');
    this.highlightStart = 0;
    this.highlightEnd = this.lines.length;

    if (this.lines.length > 0) {
      // Parse "LINES x-y".
      const fragments = this.lines[0].split('# LINES ');
      if (fragments.length === 2) { // '# LINES x-y' -> ['', 'x-y']
        const lineNumbers = fragments[1].split('-');
        const start = parseInt(lineNumbers[0]);
        const end = parseInt(lineNumbers[1]);

        function isLineNumberValid(lineNumber: number, name: string, maxValue: number): boolean {
          if (isNaN(lineNumber)) {
            alert(`Failed to parse ${name}: ${lineNumber}`);
            return false;
          }
          if (lineNumber < 1) {
            alert(`${name} must be at least 1: ${lineNumber}`);
            return false;
          }
          if (lineNumber > maxValue) {
            alert(`${name} must not exceed the biggest line number ${maxValue}`);
            return false;
          }

          return true;
        }

        if (isLineNumberValid(start, 'Starting line', this.lines.length)
          && isLineNumberValid(end, 'Ending line', this.lines.length)) {
          if (start <= end) {
            this.highlightStart = start - 1; // indexing from 0
            this.highlightEnd = end - 1 + 1; // end included
            this.isExpandable = true;
          } else {
            alert(`The starting line number must be at least the ending line number, but got ${start} < ${end}`);
          }
        }
      }
    }

    this.highlightedLines = this.lines.slice(this.highlightStart, this.highlightEnd);

    this.state = {
      isExpanded: !this.isExpandable,
      output: '',
    };
  }

  /**
   * Toggle between viewing the full example code and the highlighted fragment,
   * by toggling {@link PythonCodeState.isExpanded}.
   */
  onToggleExpand(): void {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  /**
   * Run the whole {@link PythonCodeProps.code}, clear the old output and store
   * the normal output / error messages other than `KeyboardInterrupt` in
   * {@link PythonCodeState.output} to be displayed.
   * Upon termination, {@link PythonCodeProps.onRunFinished} is invoked to
   * update the state of the app, so that the buttons are greyed out or re-
   * enabled as appropriate.
   */
  async onRun(): Promise<void> {
    this.setState({
      output: '',
    });
    if (!this.props.canRun()) {
      // alert('UI lied: Device is NOT free');
      this.props.onRunFinished();
      return;
    }

    const outputStream = await this.props.onRun(this.props.code);
    let currentOutput = '';
    await outputStream.forEach((output) => {
      switch (output.kind) {
        case 'NormalOutput':
          currentOutput = output.outputChunk;
          break;
        case 'ErrorMessage':
          if (output.type === 'KeyboardInterrupt') break;
          currentOutput = `${currentOutput}Error on line ${output.line}:
${output.type}: ${output.message}`;
      }
      this.props.onRunFinished();
      this.setState({
        output: currentOutput,
      });
    });
    this.props.onRunFinished();
  }

  /**
   * Insert the highlighted fragment {@link lines}[{@link highlightStart},
   * {@link highlightEnd}) into the editor through
   * {@link PythonCodeProps.onInsertIntoEditor}.
   */
  onInsertIntoEditor(): void {
    this.props.onInsertIntoEditor(this.highlightedLines.join('\n'));
  }

  /**
   * Compute the displayed text.
   *
   * - If {@link PythonCodeState.isExpanded} is true, this is the entirety of
   *   the {@link lines} (joined with new lines);
   * - otherwise, this is the {@link highlightedLines} with `# ...` shown at
   *   either end if there are lines of code folded there.
   */
  getDisplayedText(): string {
    let lines;

    if (this.state.isExpanded) {
      lines = this.lines;
    } else {
      lines = this.highlightedLines;

      if (this.highlightStart > 0) {
        lines = ['# ...', ...lines];
      }
      if (this.highlightEnd < this.lines.length) {
        lines = [...lines, '# ...'];
      }
    }

    return lines.join('\n');
  }

  /**
   * A quirky feature: line numbers are only shown when the full code is shown.
   * (And when the the meta-comment is missing and the fragment is the whole
   *  code, {@link PythonCodeState.isExpanded} is set to true, thus showing the
   *  line numbers by default without offering the ability to toggle the view.)
   *
   * Incidentally, showing the line numbers makes it harder to copy the code:
   * the line numbers are also copied. This could be a feature in that it
   * prevents the students from copying code other than the lines that we wish
   * to highlight and for them to insert into the editor.
   */
  render(): JSX.Element {
    return <div>
      <SyntaxHighlighter
        style={darcula}
        language="py"
        showLineNumbers={this.state.isExpanded}
      >
        {this.getDisplayedText()}
      </SyntaxHighlighter>

      <div className="Tutorial-code-buttonbar">
        <Button
          className="Tutorial-code-buttons"
          variant="contained"
          color="primary"
          startIcon={<PlayArrow/>}
          disabled={!this.props.canRun()}
          onClick={this.onRun.bind(this)}
        >
          Run Example
        </Button>

        {
          this.isExpandable &&
          <Button
            className="Tutorial-code-buttons"
            variant="contained"
            endIcon={this.state.isExpanded ? <Visibility/> : <VisibilityOff/>}
            onClick={this.onToggleExpand.bind(this)}
          >
            Full Code:
          </Button>
        }

        <Button
          className="Tutorial-code-buttons"
          variant="contained"
          color="secondary"
          endIcon={<DoubleArrow/>}
          disabled={!this.props.canInsertIntoEditor()}
          onClick={this.onInsertIntoEditor.bind(this)}
        >
          Insert Fragment
        </Button>
      </div>

      {this.state.output.length > 0 &&
      <div className="Tutorial-output">
        {this.state.output}
      </div>
      }
    </div>;
  }
}

interface PythonCodeProps {
  code: string,

  onRun(code: string): Promise<Stream<MicrobitOutput>>,

  onRunFinished(): void,

  canRun(): boolean,

  onInsertIntoEditor(codeSnippet: string): void,

  canInsertIntoEditor(): boolean,
}


interface PythonCodeState {
  isExpanded: boolean,
  output: string,
}


/**
 * Renders the tutorial from the supplied {@link TutorialViewerProps.markdown}.
 *
 * The code blocks in markdown are rendered with syntax highlighting.
 * In particular, code blocks whose language is 'py', such as
 *
 * ~~~py
 * print('Hello, world')
 * ~~~
 *
 * or
 *
 * ```py
 * print('Hello world!')
 * ```
 *
 * are rendered with
 * - a run button which, enabled if {@link TutorialViewerProps.canRun} returns
 *   true, runs the code in this code block with
 *   {@link TutorialViewerProps.onRun};
 * - an insert into editor button which, enabled if
 *   {@link TutorialViewerProps.canInsertIntoEditor} returns true, inserts (a
 *   subset of, see below) the code in this code block into the editor with
 *   {@link TutorialViewerProps.onInsertIntoEditor}.
 *
 * Furthermore, if the first line of code is a comment of the format
 * `# LINES x-y` where `x`, `y` are integers satisfying 0 ≤ `x` ≤ `y` ≤ #lines,
 * such as
 *
 * ~~~py
 * # LINES 1-2
 * print(1)
 * print(2)
 * print(3)
 * ~~~
 *
 * then by default only the code fragment is shown, and now a button to toggle
 * between showing the full code and only the highlighted fragment is
 * available.
 * Also, only the highlighted fragmented is inserted now; see
 * {@link PythonCode} for the details.
 *
 */
export default class TutorialViewer extends React.Component<TutorialViewerProps, unknown> {
  renderCode(code: MarkdownCode): JSX.Element {
    if (code.language === 'py') {
      return <PythonCode
        code={code.value}
        onRun={this.props.onRun}
        onRunFinished={this.props.onRunFinished}
        onInsertIntoEditor={this.props.onInsertIntoEditor}
        canRun={this.props.canRun}
        canInsertIntoEditor={this.props.canInsertInsertIntoEditor}
      />;
    } else {
      return <SyntaxHighlighter
        style={darcula}
        language={code.language}
      >
        {code.value}
      </SyntaxHighlighter>;
    }
  }

  renderers = {code: this.renderCode.bind(this)};

  render(): JSX.Element {
    return <ReactMarkdown className="Tutorial-markdown" renderers={this.renderers}>
      {this.props.markdown}
    </ReactMarkdown>;
  }
}

interface TutorialViewerProps {
  markdown: string,

  onRun(code: string): Promise<Stream<MicrobitOutput>>,

  onRunFinished(): void,

  canRun(): boolean,

  onInsertIntoEditor(codeSnippet: string): void,

  canInsertInsertIntoEditor(): boolean,
}

interface MarkdownCode {
  /** The language of the code block, specified by e.g. ```py ...``` */
  language: string,
  /** The contents of the code block */
  value: string,
}

