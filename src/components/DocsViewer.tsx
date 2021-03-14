import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {darcula} from 'react-syntax-highlighter/dist/esm/styles/prism';

type DocsViewerProps = {
  markdown: string,
}

export default class DocsViewer extends React.Component<DocsViewerProps, unknown> {
  render(): JSX.Element {
    return <ReactMarkdown className="App-docs">
      {this.props.markdown}
    </ReactMarkdown>;
  }
}
