import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';

type PythonCodeProps = {
  code: string,
}

type PythonCodeState = {
  isExpanded: boolean,
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
    };

    this.isExpandable = false;
    this.lines = this.props.code.split('\n');
    this.highlightStart = 0;
    this.highlightEnd = this.lines.length;

    if (this.lines.length > 0) {
      // Parse "LINES x-y". TODO consider using a parser later.
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

    this.onExpand = this.onExpand.bind(this);
  }

  onExpand(): void {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  render() {
    const [start, end] =
      this.state.isExpanded ?
        [0, this.lines.length] :
        [this.highlightStart, this.highlightEnd];

    return <div className="Docs-code">
      <SyntaxHighlighter
        style={darcula}
        language="py"
        showLineNumbers={this.state.isExpanded}
        // Btw lineNumberContainerStyle can be used to remove the padding
      >
        {this.lines.slice(start, end).join('\n')}
      </SyntaxHighlighter>
      <button onClick={this.onExpand}>expand</button>
      <button>flash</button>
      <button>load</button>
    </div>;
  }
}


type DocsViewerProps = {
  markdown: string,
}

type MarkdownCode = {
  /** The language of the code block, specified by e.g. ```py ...``` */
  language: string,
  /** The contents of the code block */
  value: string,
}

export default class DocsViewer extends React.Component<DocsViewerProps, unknown> {
  renderCode(code: MarkdownCode): JSX.Element {
    if (code.language === 'py') {
      return <PythonCode code={code.value}/>;
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
    return <ReactMarkdown className="App-docs" renderers={this.renderers}>
      {this.props.markdown}
    </ReactMarkdown>;
  }
}
