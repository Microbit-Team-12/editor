import React from 'react';
import ReactMarkdown from 'react-markdown';
import './DocsViewer.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@material-ui/core';
import { DoubleArrow, PlayArrow, Visibility, VisibilityOff } from '@material-ui/icons';
import { MicrobitOutput } from '../api/microbit/interface/message';
import { Stream } from 'ts-stream';

interface PythonCodeProps {
  code: string,

  onRun?(code: string): Promise<Stream<MicrobitOutput>>,

  hasFreeConnection(): boolean,

  onInsertIntoEditor(codeSnippet: string): void,
}

interface PythonCodeState {
  isExpanded: boolean,
  output: string,
}

class PythonCode extends React.Component<PythonCodeProps, PythonCodeState> {
  readonly isExpandable: boolean;
  readonly highlightStart: number;
  readonly highlightEnd: number;
  readonly lines: string[];

  constructor(props: PythonCodeProps) {
    super(props);

    this.state = {
      isExpanded: false,
      output: '',
    };

    this.isExpandable = false;
    this.lines = this.props.code.split('\n');
    this.highlightStart = 0;
    this.highlightEnd = this.lines.length;

    if (this.lines.length > 0) {
      // Parse "LINES x-y".
      const fragments = this.lines[0].split('# LINES ');
      if (fragments.length === 2) {
        const lineNumbers = fragments[1].split('-');
        const start = parseInt(lineNumbers[0]);
        const end = parseInt(lineNumbers[1]);
        if (!isNaN(start) && !isNaN(end)) {
          this.highlightStart = start - 1; // indexing from 0
          this.highlightEnd = end - 1 + 1; // end included
          this.isExpandable = true;
        }
      }
    }
  }

  onToggleExpand(): void {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  async onRun(): Promise<void> {
    if (this.props.onRun !== undefined) {
      const outputStream = await this.props.onRun(this.props.code);
      await outputStream.forEach((output) => {
        switch (output.kind) {
          case 'NormalOutput':
            this.setState({
              output: output.outputChunk,
            });
            break;
          case 'ErrorMessage':
            if (output.type === 'KeyboardInterrupt') break;
            const oldOutput = this.state.output;
            this.setState({
              output: `${oldOutput}
Error on line ${output.line}:
${output.type}: ${output.message}`,
            });
        }
      });
    }
  }

  onInsertIntoEditor(): void {
    this.props.onInsertIntoEditor(this.lines.slice(this.highlightStart, this.highlightEnd).join('\n'));
  }

  getDisplayedText(): string {
    const [start, end] =
      this.state.isExpanded ?
        [0, this.lines.length] :
        [this.highlightStart, this.highlightEnd];

    let lines = this.lines.slice(start, end);

    if (start > 0) {
      lines = ['# ...', ...lines];
    }
    if (end < this.lines.length) {
      lines = [...lines, '# ...'];
    }

    return lines.join('\n');
  }

  render(): JSX.Element {
    return <div className="Docs-code">
      <SyntaxHighlighter
        style={darcula}
        language="py"
        showLineNumbers={this.state.isExpanded}
      >
        {this.getDisplayedText()}
      </SyntaxHighlighter>

      <Button
        className="Docs-code-buttons"
        variant="contained"
        endIcon={this.state.isExpanded ? <Visibility/> : <VisibilityOff/>}
        onClick={this.onToggleExpand.bind(this)}
      >
        Full example code:
      </Button>

      <Button
        className="Docs-code-buttons"
        variant="contained"
        color="primary"
        startIcon={<PlayArrow/>}
        disabled={!this.props.hasFreeConnection()}
        onClick={this.onRun.bind(this)}
      >
        Run full example
      </Button>

      <Button
        className="Docs-code-buttons"
        variant="contained"
        color="secondary"
        endIcon={<DoubleArrow/>}
        onClick={this.onInsertIntoEditor.bind(this)}
      >
        Insert fragment into editor
      </Button>

      {this.state.output.length > 0 &&
      <div className="Docs-output">
        {this.state.output}
      </div>
      }
    </div>;
  }
}


interface DocsViewerProps {
  markdown: string,

  onRun?(code: string): Promise<Stream<MicrobitOutput>>,

  hasFreeConnection(): boolean,

  onInsertIntoEditor(codeSnippet: string): void,
}

interface MarkdownCode {
  /** The language of the code block, specified by e.g. ```py ...``` */
  language: string,
  /** The contents of the code block */
  value: string,
}

export default class DocsViewer extends React.Component<DocsViewerProps, unknown> {
  renderCode(code: MarkdownCode): JSX.Element {
    if (code.language === 'py') {
      return <PythonCode
        code={code.value}
        onRun={this.props.onRun}
        onInsertIntoEditor={this.props.onInsertIntoEditor}
        hasFreeConnection={this.props.hasFreeConnection}
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
    return <ReactMarkdown className="APIDemo-docs" renderers={this.renderers}>
      {this.props.markdown}
    </ReactMarkdown>;
  }
}
