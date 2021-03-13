import React from 'react';
import { Stream } from 'ts-stream';
import { MicrobitConnection, MicrobitOutput } from '../api/microbit-api';
import { connectByPlugIn, connectBySelection } from '../api/microbit/connect';
import './App.css';

type AppState = {
  code:string,
  output:string
}

const exampleDoc = `from microbit import *
while True:
    print(1)
    sleep(100)`;

let globalConnection: MicrobitConnection | null;


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
    this.onReboot = this.onReboot.bind(this);
    this.onExec = this.onExec.bind(this);
    this.onInterrupt = this.onInterrupt.bind(this);
    this.onRun = this.onRun.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <button className="App-button" onClick={this.onStart}>Start</button>
          <button className="App-button" onClick={this.onRun}>Run Code</button>
          <button className="App-button" onClick={this.onFlash}>Flash Code</button>
          <button className="App-button" onClick={this.onInterrupt}>Interrupt</button>
          <button className="App-button" onClick={this.onReboot}>Reboot</button>
        </header>
        <div className="App-textareas">
          <textarea value={this.state.code} onChange={this.onCodeChange} className="App-doc"></textarea>
          <textarea value={this.state.output} readOnly className="App-editor"></textarea>
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
    const connection = await connectBySelection();
    //const connection = await connectByPlugIn();
    switch(connection.kind){
      case 'ConnectionFailure':
        alert(connection.reason);
        break;
      case 'MicrobitConnection':
        globalConnection = connection;
        connection.disconnection.then(async ()=>{
          alert('Serial connection lost');
          globalConnection = null;
          const newConnection = await connectByPlugIn();
          if(newConnection.kind==='MicrobitConnection')
            globalConnection = newConnection;
        });
    }
  }

  async onExec(outputStream: Stream<MicrobitOutput>):Promise<void>{
    await outputStream.forEach( output => {
      if (output.kind === 'NormalOutput') {
        this.setState({
          output: output.outputChunk
        });
      } else {
        alert(output.reason + output.message);
      }
    });
  }

  async onFlash():Promise<void>{
    console.log('onFlash');
    const code = this.state.code;
    this.onExec(await globalConnection!.interact.flash(code));
  }

  async onRun(): Promise<void> {
    console.log('onFlash');
    const code = this.state.code;
    this.onExec(await globalConnection!.interact.execute(code));
  }

  async onReboot():Promise<void>{
    console.log('onReboot');
    this.onExec(await globalConnection!.interact.reboot());
  }

  async onInterrupt():Promise<void>{
    globalConnection!.interact.interrupt();
  }
}

export default App;
