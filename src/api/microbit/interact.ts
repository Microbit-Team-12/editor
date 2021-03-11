import Stream from 'ts-stream';
import { InteractWithConnectedMicrobit, MicrobitOutput } from '../microbit-api';
import { ManagerOption } from '../microbit-api-config';
import { OutputReader } from './helper/OutputReader';
import { OutputParser } from './helper/OutputParser';
const ctrlC = '\x03';
const ctrlD = '\x04';

export class ConnectedMicrobitInteract implements InteractWithConnectedMicrobit {
  portWriter!: WritableStreamDefaultWriter<string>;
  portParser!: OutputParser

  constructor(port: SerialPort, config: ManagerOption) {
    const encoder = new TextEncoderStream();
    if (port.writable != null) {
      encoder.readable.pipeTo(port.writable);
      this.portWriter = encoder.writable.getWriter();
    }
    if (port.readable != null) {
      const portReader = new OutputReader(port.readable, config.readOption);
      this.portParser = new OutputParser(portReader, config.parseOption);
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

    /* Workaround: 
        Paste mode does not work well with fast serial writing (losing characters)
        So use a single line for all flashing work
     */
    await this.portWriter.write(
      ctrlC
      + 'file=open(\'main.py\',\'w\');'
      + 's=\'' + codeInPythonString + '\';'
      + 'file.write(s);'
      + 'file.close();'
      + 'from microbit import reset;'
      + 'reset()\r'
    );

    await this.portParser.watchFlash();
    const outputStream = new Stream<MicrobitOutput>();
    this.portParser.watchOutput(outputStream);
    return outputStream;
  }
  async reboot(): Promise<Stream<MicrobitOutput>> {
    return '' as any;
  }
  async interrupt(): Promise<void> {
    return '' as any;
  }

}