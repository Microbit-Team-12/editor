import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';

type PythonCodeProps = {
  code: string,
}

type PythonCodeState = {
  expanded: boolean,
}

class PythonCode extends React.Component<PythonCodeProps, PythonCodeState> {
  constructor(props: PythonCodeProps) {
    super(props);

    this.state = {
      expanded: false,
    };
  }

  render() {
    return <div className="Docs-code">
      <SyntaxHighlighter
        style={darcula}
        language="py"
        showLineNumbers={true}
        // Btw lineNumberContainerStyle can be used to remove the padding
      >
        {this.props.code}
      </SyntaxHighlighter>
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
