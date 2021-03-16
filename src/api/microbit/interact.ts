import Stream from 'ts-stream';
import { InteractWithConnectedMicrobit, MicrobitOutput } from '../microbit-api';
import { ManagerOption, SignalOption } from '../microbit-api-config';
import { SerialParser } from './helper/serial/parser';
import { SerialReader } from './helper/serial/reader';
const ctrlC = '\x03';

export class ConnectedMicrobitInteract implements InteractWithConnectedMicrobit {
  port: SerialPort;
  portWriter!: WritableStreamDefaultWriter<string>;
  portReader!: ReadableStreamDefaultReader<string>;
  portParser!: SerialParser
  signal: SignalOption;

  constructor(port: SerialPort, config: ManagerOption) {
    this.port = port;
    this.signal = config.signalOption;
    if (port.writable != null) {
      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(port.writable).catch((err) => { console.log('disconnected in pipe'); });
      this.portWriter = encoder.writable.getWriter();
    }
    if (port.readable != null) {
      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable).catch((err) => { console.log('disconnected in pipe'); });
      this.portReader = decoder.readable.getReader();

      const portReaderHelper = new SerialReader(this.portReader, config.readOption);
      this.portParser = new SerialParser(portReaderHelper, config.signalOption);
    }
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
      Note:
        replaceAll require ESNext.
        But web serial already require a high version of chrome.
    */
    return (  'print(\'' + this.signal.executionStart + '\')'
            + '\r\n' + code + '\r\n'
            + 'print(\'' + this.signal.executionDone + '\')'
    ) .replaceAll('\\', '\\\\')
      .replaceAll('\'', '\\\'')
      .replaceAll(/\r?\n/g, '\\r\\n');
  }

  /**
   * Send ctrlC to stop code execution
   * - If no code was running, new REPL line starts
   * - If code was running, then keyboardInterrupt appears
   *    Serial input unavaible for a few ms, then new REPL line starts.
   * Returns when the REPL line is clean and usable
   */
  private async getREPLLine(): Promise<void> {
    await this.portWriter.write(ctrlC);
    await this.portParser.readUntilNewREPLLine();
  }

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
          On receving replDone, manager knows microbit finished writing to main.py
          It is rebooting and all later output are program output
      - Sleep for 0ms
          In case there are characters in output buffer
      - reboot
          To run `main.py` in a fresh state
    */
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
    await this.portParser.readUntilExecutionStart();
    this.portParser.readUntilExecuteDone(outputStream,0).catch(() => { outputStream.end(); });
    return outputStream;
  }

  async execute(code: string): Promise<Stream<MicrobitOutput>> {
    const codeInPythonString = this.codeToPythonString(code);
    const outputStream = new Stream<MicrobitOutput>();

    await this.getREPLLine();
    await this.portWriter.write(
      'print(\'' + this.signal.executionStart + '\');'
      + 's=\'' + codeInPythonString + '\';'
      + 'exec(s)\r'
    );
    await this.portParser.readUntilExecutionStart();
    this.portParser.readUntilExecuteDone(outputStream, 1).catch(() => { outputStream.end(); });
    return outputStream;
  }

  async reboot(): Promise<Stream<MicrobitOutput>> {
    await this.getREPLLine();
    await this.portWriter.write(
      'print(\'' + this.signal.executionStart + '\');'
      + 'from microbit import *;'
      + 'reset()\r'
    );
    await this.portParser.readUntilExecutionStart();
    const outputStream = new Stream<MicrobitOutput>();
    this.portParser.readUntilExecuteDone(outputStream, 0).catch(() => { outputStream.end(); });
    return outputStream;
  }

  async interrupt(): Promise<void> {
    await this.portWriter.write(ctrlC);
    //Not reading for new REPL line here
    //because portParser might already be reading.
  }
}