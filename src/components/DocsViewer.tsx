import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { DoubleArrow, FlashOn, Height } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';

type PythonCodeProps = {
  code: string,
  onFlash?(code: string): Promise<void>,
  onLoad(codeSnippet: string): void,
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
  }

  onExpand(): void {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  async onFlash(): Promise<void> {
    if (this.props.onFlash !== undefined)
      await this.props.onFlash(this.props.code);
  }

  onLoad(): void {
    this.props.onLoad(this.lines.slice(this.highlightStart, this.highlightEnd).join('\n'));
  }

  render(): JSX.Element {
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
      <IconButton onClick={this.onExpand.bind(this)} disabled={!this.isExpandable}><Height/></IconButton>
      <IconButton onClick={this.onFlash.bind(this)} disabled={this.props.onFlash === undefined}><FlashOn/></IconButton>
      <IconButton onClick={this.onLoad.bind(this)}><DoubleArrow/></IconButton>
    </div>;
  }
}


type DocsViewerProps = {
  markdown: string,
  onFlash?(code: string): Promise<void>,
  onLoad(codeSnippet: string): void,
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
      return <PythonCode
        code={code.value}
        onFlash={this.props.onFlash}
        onLoad={this.props.onLoad}
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
