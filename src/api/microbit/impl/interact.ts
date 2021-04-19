import Stream from 'ts-stream';
import { SerialParser } from './helper/parser';
import { SerialReader } from './helper/reader';
import { MicrobitOutput, MicrobitState } from '../interface/message';
import { ManagerOption, SignalOption } from '../interface/config';

const ctrlC = '\x03';

export class ConnectedMicrobitInteract {
  port: SerialPort;
  portWriter!: WritableStreamDefaultWriter<string>;
  portReader!: ReadableStreamDefaultReader<string>;
  portParser!: SerialParser
  signal: SignalOption;
  state: MicrobitState;

  readonly portWriterStreamClosed: Promise<void> | null = null;
  readonly portReaderStreamClosed: Promise<void> | null = null;

  constructor(port: SerialPort, config: ManagerOption) {
    this.port = port;
    this.signal = config.signalOption;
    this.state = MicrobitState.Free;
    if (port.writable != null) {
      const encoder = new TextEncoderStream();
      this.portWriterStreamClosed = encoder.readable.pipeTo(port.writable)
        .catch((_) => {
          console.log('disconnected in pipe');
        });
      this.portWriter = encoder.writable.getWriter();
    }
    if (port.readable != null) {
      const decoder = new TextDecoderStream();
      this.portReaderStreamClosed = port.readable.pipeTo(decoder.writable)
        .catch((_) => {
          console.log('disconnected in pipe');
        });
      this.portReader = decoder.readable.getReader();

      const portReaderHelper = new SerialReader(this.portReader, config.readOption);
      this.portParser = new SerialParser(portReaderHelper, config.signalOption);
    }
  }

  getState(): MicrobitState {
    return this.state;
  }

  /**
   * Convert a javascript string of python code to readable python code
   */
  private codeToPythonString(code: string): string {
    /* 
    replaceAll From up to down
      (1) user-used escape character. e.g. [\][t]
        This should still be [\][t] in main.py
        [\][\][t] in python string
      (2) user-used [']
        Because code is wrapped with ''
        [\]['] in python string
      (3) new line created by user
        Should be [\r][\n] in main.py
        [\][r][\][n] in python string
    */
    return (
      'print(\'' + this.signal.executionStart + '\')'
      + '\r\n' + code + '\r\n'
      + 'print(\'' + this.signal.executionDone + '\')'
    ).replace(/\\/g, '\\\\')
      .replace(/'/g, '\\\'')
      .replace(/\r?\n/g, '\\r\\n');
  }

  /**
   * Send ctrlC to stop code execution
   * - If no code was running, new REPL line starts
   * - If code was running, then keyboardInterrupt appears
   *    Serial input unavailable for a few ms, then new REPL line starts.
   * Returns when the REPL line is clean and usable
   */
  private async getREPLLine(): Promise<void> {
    await this.portWriter.write(ctrlC);
    await this.portParser.readUntilNewReplLine();
  }

  /**
   * Flash ROM of the connected micro:bit.
   *
   * The flashing consists of two stages of flashing the code followed by a reboot.
   * The promise completes when reboot is done, resulting in a stream of outputs from microbit.
   */
  async flash(code: string): Promise<Stream<MicrobitOutput>> {
    /*Whole procedure with workaround note
      - Get a clean REPL line, see getREPLLine()
      - Send code to `main.py` to REPL
          Observation: Microbit serial lose characters when multiple lines are inputted
          Workaround: Put all code on one line
          The logic might be:
            Microbit does not have enough pin on the chip for serial hardware flow control.
            So computer has no way of knowing microbit buffer is full.
            And when the buffer is full, microbit serial start to lose character.

            When all code is on one line, microbit does not do any hard work until \r entered
            Less likely for the buffer to be full and lose character
      - Print(replDone)
          On receiving replDone, manager knows microbit finished writing to main.py
          It is rebooting and all later output are program output
    */
    if (this.state === MicrobitState.Busy) throw Error('Flash Failed: Device not free');
    this.state = MicrobitState.Busy;

    const codeInPythonString = this.codeToPythonString(code);
    const outputStream = new Stream<MicrobitOutput>();

    await this.getREPLLine();
    await this.portWriter.write(
      'file=open(\'main.py\',\'w\');'
      + 's=\'' + codeInPythonString + '\';'
      + 'file.write(s);'
      + 'file.close();'
      + 'from microbit import *;'
      + 'reset()\r'
    );
    if (await this.portParser.readUntilExecStart(outputStream)) {
      this.portParser.readUntilExecDone(outputStream)
        .then(() => {
          this.state = MicrobitState.Free;
        })
        .finally(() => {
          outputStream.end();
        });
    } else this.state = MicrobitState.Free;
    return outputStream;
  }

  /**
   * Run code in REPL.
   * Microbit is not rebooted. So all previous variables are kept.
   */
  async execute(code: string): Promise<Stream<MicrobitOutput>> {
    if (this.state === MicrobitState.Busy) throw Error('Execute Failed: Device not free');
    this.state = MicrobitState.Busy;

    const codeInPythonString = this.codeToPythonString(code);
    const outputStream = new Stream<MicrobitOutput>();

    await this.getREPLLine();
    await this.portWriter.write(
      's=\'' + codeInPythonString + '\';'
      + 'exec(s)\r'
    );
    if (await this.portParser.readUntilExecStart(outputStream)) {
      this.portParser.readUntilExecDone(outputStream)
        .then(() => {
          this.state = MicrobitState.Free;
        })
        .finally(() => {
          outputStream.end();
        });
    } else this.state = MicrobitState.Free;
    return outputStream;
  }

  async getCompletions(prefix: string): Promise<string[]> {
    if (this.state === MicrobitState.Busy) throw Error('Autocomplete Failed: Device not free');
    this.state = MicrobitState.Busy;

    const endMarker = 'END MARKER';
    let output = '';

    await this.getREPLLine();
    await this.portWriter.write(`${prefix}\t`);
    await this.portWriter.write(endMarker);
    await this.portParser.portReader.safeReadUntilWithUpdate(
      [endMarker],
      (text) => output = text,
    );
    await this.getREPLLine();

    this.state = MicrobitState.Free;
    const lines = output.split(/\n/g);
    if (lines.length === 1) {
      const text = lines[0];
      // No completions found
      if (text === prefix) return [];
      // Identified exactly one completion
      else return [text];
    }
    const completions: string[] = [];
    for (const line of lines.slice(1, -1)) {
      for (const completion of line.trim().split(/\s+/g)) {
        if (completion.length > 0)
          completions.push(completion.trim()); // I miss concatMap
      }
    }
    return completions;
  }

  /**
   * Reboots the connected micro:bit.
   * The promise completes with a stream of outputs from microbit.
   */
  async reboot(): Promise<Stream<MicrobitOutput>> {
    if (this.state === MicrobitState.Busy) throw Error('Reboot Failed: Device not free');
    this.state = MicrobitState.Busy;

    await this.getREPLLine();
    await this.portWriter.write(
      'from microbit import *;'
      + 'reset()\r'
    );
    const outputStream = new Stream<MicrobitOutput>();
    if (await this.portParser.readUntilExecStart(outputStream)) {
      this.portParser.readUntilExecDone(outputStream)
        .then(() => {
          this.state = MicrobitState.Free;
        })
        .finally(() => {
          outputStream.end();
        });
    } else this.state = MicrobitState.Free;
    return outputStream;
  }

  private waitUntil(cond: () => boolean): Promise<void> {
    return new Promise((resolve, _) => {
      const timer = setInterval(() => {
        if (cond()) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  }

  /**
   * Send an interrupt signal the connected micro:bit.
   * This will try to stop any python code running on the micro:bit.
   *
   * The promise completes when the interruption is successful.
   * If code is being executed, then there should be a ErrorMessage in the outputStream.
   */
  async interrupt(): Promise<void> {
    if (this.state === MicrobitState.Free) throw Error('Interrupt Failed: Device not running code');
    await this.portWriter.write(ctrlC);
    await this.waitUntil(() => this.state === MicrobitState.Free);
    //Not reading for new REPL line here
    //because portParser might already be reading.
  }

  /**
   * Disconnect the paired micro:bit.
   */
  async disconnect(): Promise<void> {
    console.log('Disconnection initiated:');

    await this.portReader.cancel('App will unmount');
    await this.portReaderStreamClosed;
    console.log('Reader closed;');

    await this.portWriter.abort('App will unmount');
    await this.portWriterStreamClosed;
    console.log('Writer closed.');

    await this.port.close();
  }
}