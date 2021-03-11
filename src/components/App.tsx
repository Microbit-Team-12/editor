import React from 'react';
import { MicrobitConnection } from '../api/microbit-api';
import { connect } from '../api/microbit/connect';
import './App.css';

type AppState = {
  code:string,
  output:string
}

const exampleDoc = `from microbit import *

display.show(1)
print(1)`;

let globalConnection: MicrobitConnection;


class App extends React.Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      code : exampleDoc,
      output : ''
    };
    this.onStart = this.onStart.bind(this);
    this.onFlash = this.onFlash.bind(this);
    this.onCodeChange = this.onCodeChange.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <button className="App-button" onClick={this.onStart}>Start</button>
          <button className="App-button">Run Code</button>
          <button className="App-button" onClick={this.onFlash}>Flash Code</button>
          <button className="App-button">Interrupt</button>
          <button className="App-button">Reboot</button>
        </header>
        <div className="App-textareas">
          <textarea value={this.state.code} onChange={this.onCodeChange} className="App-doc"></textarea>
          <textarea value={this.state.output} className="App-editor"></textarea>
        </div>
      </div>
    );
  }

  onCodeChange(e: React.ChangeEvent<HTMLTextAreaElement>):void {
    this.setState({
      code: e.target.value
    });
  }

  async onStart():Promise<void>{
    console.log('on');
    const connection = await connect();
    if(connection.kind==='ConnectionFailure') console.log('Falied');
    else globalConnection = connection;
  }

  async onFlash():Promise<void>{
    console.log('onFlash');
    const code = this.state.code;
    const outStream = await globalConnection.interact.flash(code);
    await outStream.forEach(output =>{
      if(output.kind==='NormalOutput'){
        this.setState({
          output: output.outputChunk
        });
      }else{
        console.log(output);
      }
    });
  }
}

export default App;
