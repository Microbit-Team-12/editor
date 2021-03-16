import Stream from 'ts-stream';
import { MicrobitOutput } from '../../../microbit-api';
import { SignalOption } from '../../../microbit-api-config';
import { SerialReader } from './reader';

/**
 * This class provides functions to read serial output of a specific procedure,
 * by using the reader helper class.
 * 
 * Below is its mechaism. Based on following input of code
 * ```
 * 1|Get REPL Line|>>>
 * 2|Setup Code   |>>> file=open('main.py','w');s='print(executionStart)\\r\\nprint(1)\\r\\nprint(executionStart)';file.write(s);file.close();from microbit import *;sleep(0);reset();
 * 3|#Byte Written|8
 * 4|executionStart
 * 5|Code output  |1
 * 6|executionDone
 * 6|MicroPython v1.13 on 2021-02-19; micro:bit v2.0.0-beta.4 with nRF52833
 * 7|Type "help()" for more information.
 * 8|>>>
 * ```
 * 
 * Error Sample (Flashing) linetoIgnroe=0
 * ```
 * Traceback (most recent call last):
 * File "main.py", line 1, in <module>
 * NameError: name 'prit' isn't defined
 * ```
 *
 * REPL Sample (Running) linetoIgnore=1
 * ```
 * Traceback (most recent call last):
 * File "<stdin>", line 1, in <module>
 * File "<string>", line 1, in <module>
 * NameError: name 'prit' isn't defined
 * ```
 */
export class SerialParser {
  portReader: SerialReader;
  signal: SignalOption;

  constructor(portReader: SerialReader, config: SignalOption) {
    this.portReader = portReader;
    this.signal = config;
  }

  /**
   * Read until new repl line is ready
   */
  readUntilNewREPLLine(): Promise<void> {
    return this.portReader.safeReadUntil(this.signal.replLineReady);
  }

  /**
   * Read until indication of execution starting
   */
  readUntilExecutionStart(): Promise<void> {
    return this.portReader.safeReadUntil(this.signal.executionStart + '\r\n');
  }

  /**
   * Read until indication of execution finishing, 
   * recent output from serial will be sent to `outputStream`
   */
  async readUntilExecuteDone(outputStream: Stream<MicrobitOutput>, lineToIgnore:number): Promise<void> {
    const signals = [
      this.signal.executionDone + '\r\n',
      this.signal.errorOccured
    ];
    const result = await this.portReader.safeReadUntilWithUpdate(
      signals, 
      str => outputStream.write({
        kind: 'NormalOutput',
        outputChunk: str
      })
    );
    console.log('Execution done');
    
    if (result === this.signal.errorOccured) {
      for (let i = 0; i < lineToIgnore; i++) await this.portReader.unsafeReadline();
      const line1 = await this.portReader.unsafeReadline();
      const line2 = await this.portReader.unsafeReadline();
      const lineNumberString = line1.split('line ')[1].split(',')[0];
      const line2split = line2.split(': ');
      outputStream.write({
        kind: 'ErrorMessage',
        line: parseInt(lineNumberString)-1,
        file: 'main.py',
        reason: line2split[0],
        message: line2split[1]
      });
    }
    outputStream.end();
  }
}