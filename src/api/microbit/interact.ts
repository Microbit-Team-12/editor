import Stream from 'ts-stream';
import { InteractWithConnectedMicrobit, MicrobitOutput } from '../microbit-api';
import { ManagerOption } from '../microbit-api-config';
import { SerialParser } from './helper/serial/parser';
import { SerialReader } from './helper/serial/reader';
const ctrlC = '\x03';

export class ConnectedMicrobitInteract implements InteractWithConnectedMicrobit {
  port: SerialPort;
  portWriter!: WritableStreamDefaultWriter<string>;
  portReader!: ReadableStreamDefaultReader<string>;
  portParser!: SerialParser

  constructor(port: SerialPort, config: ManagerOption) {
    this.port = port;
    if (port.writable != null) {
      const encoder = new TextEncoderStream();
      encoder.readable.pipeTo(port.writable);
      this.portWriter = encoder.writable.getWriter();
    }
    if (port.readable != null) {
      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      this.portReader = decoder.readable.getReader();

      const portReaderHelper = new SerialReader(this.portReader, config.readOption);
      this.portParser = new SerialParser(portReaderHelper, config.parseOption);
    }
  }

  async flash(code: string): Promise<Stream<MicrobitOutput>> {
    /* From up to down
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
    const codeInPythonString = code
      .replaceAll('\\', '\\\\')
      .replaceAll('\'', '\\\'')
      .replaceAll(/\r?\n/g, '\\r\\n');
    const outputStream = new Stream<MicrobitOutput>();

    /*Whole procedure with workaround note
      - Send ctrlC to stop code execution
        - If no code was running, new REPL line starts
        - If code was running, then keyboardInterrupt appears
            Serial input unavaible for a few ms, then new REPL line starts.
      - Read until this new REPL line
      - Send code for flashing `main.py` to REPL
          Since Microbit serial seems to be buggy when multiple lines are involved
          All code is on one line
      - Sleep for 0ms
          Allowing output from file.write() to appear on serial
          Otherwise some weird character appears. Instead of a number then new line
          Not necessary for microbit v1.
      - Read until signal of flash finishing appears.
      - Program is now executing
     */
    await this.portWriter.write(ctrlC);
    await this.portParser.watchNewREPLLine();
    await this.portWriter.write(
      'file=open(\'main.py\',\'w\');'
      + 's=\'' + codeInPythonString + '\';'
      + 'file.write(s);'
      + 'file.close();'
      + 'from microbit import *;'
      + 'sleep(0);'
      + 'reset()\r'
    );
    await this.portParser.watchFlash();
    this.portParser.watchOutput(outputStream).catch(() => {
      outputStream.end();
    });
    return outputStream;
  }

  async reboot(): Promise<Stream<MicrobitOutput>> {
    await this.portWriter.write(
      ctrlC
      + 'from microbit import *;'
      + 'reset()\r'
    );
    await this.portParser.watchReboot();
    const outputStream = new Stream<MicrobitOutput>();
    this.portParser.watchOutput(outputStream).catch(() => {
      outputStream.end();
    });
    return outputStream;
  }

  async interrupt(): Promise<void> {
    await this.portWriter.write(ctrlC);
  }
}