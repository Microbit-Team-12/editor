import Stream from 'ts-stream';
import { MicrobitOutput, MicroPythonExceptionType } from '../../interface/message';
import { SignalOption } from '../../interface/config';
import { SerialReader } from './reader';

/**
 * This class provides functions to read serial output of a specific procedure,
 * by using the reader helper class.
 *
 * Below is its mechanism. Based on following input of code
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
 * Error Sample (Flashing)
 * ```
 * Traceback (most recent call last):
 * File "main.py", line 1, in <module>
 * NameError: name 'prit' isn't defined
 * ```
 *
 * REPL Sample (Running)
 * ```
 * Traceback (most recent call last):
 * File "<stdin>", line 1, in <module>
 * File "<string>", line 1, in <module>
 * NameError: name 'prit' isn't defined
 * ```
 */
export class SerialParser {
  portReader: SerialReader;
  config: SignalOption;
  startSignals: string[];
  endSignals: string[];

  constructor(portReader: SerialReader, config: SignalOption) {
    this.portReader = portReader;
    this.config = config;
    this.startSignals = [
      config.executionStart + '\r\n',
      config.mainPYException,
      config.execException
    ];
    this.endSignals = [
      config.executionDone + '\r\n',
      config.executionStart + '\r\n',
      config.mainPYException,
      config.execException
    ];

  }

  /**
   * Read until new repl line is ready
   */
  readUntilNewReplLine(): Promise<void> {
    return this.portReader.safeReadUntil(this.config.replLineReady);
  }

  /**
   * Read until executionStart appears on serial
   * - If there is no error, this Returns true
   * - If (indentation/bracket) error occurs, the stream will be closed and false is returned
   */
  async readUntilExecStart(outputStream: Stream<MicrobitOutput>): Promise<boolean> {
    if (this.config.showLog) console.log('Waiting for Execution Start');
    const result = await this.portReader.safeReadUntilWithUpdate(
      this.startSignals,
      _ => null
    );
    if (result !== 0) {
      this.readErrors(outputStream);
      return false;
    } else return true;
  }

  /**
   * Read output of user code, periodically update output to stream
   *
   * Require executeStart printed earlier
   */
  async readUntilExecDone(outputStream: Stream<MicrobitOutput>): Promise<void> {
    if (this.config.showLog) console.log('Execution Start');
    // Now user code will run
    // read until executionEnd signal appear on signal
    let result = 1;
    while (result === 1) {
      result = await this.portReader.safeReadUntilWithUpdate(
        this.endSignals,
        str => outputStream.write({
          kind: 'NormalOutput',
          outputChunk: str
        })
      );
      if (result === 1) outputStream.write({
        kind: 'ResetPressed'
      });
    }
    if (result !== 0) this.readErrors(outputStream);
    else await outputStream.end();
    if (this.config.showLog) console.log('Execution done');
  }

  /**
   * Read and parse micropython error output
   */
  async readErrors(outputStream: Stream<MicrobitOutput>): Promise<void> {
    if (this.config.showLog) console.log('Execution Error');
    // line1 indicates in which line of user code exception occurred
    // which is first line after mainPYException and execException
    const line1 = await this.portReader.unsafeReadline();
    const lineNumberString = line1.split(',', 2)[0];
    // messageLine is in the form of 'ErrorType:ErrorMessage'
    // exec is used in user code, the line following line1 may not be messageLine
    let lineCount = 0;
    let messageLine = '';
    while (lineCount === 0 || messageLine.startsWith('  ')) {
      messageLine = await this.portReader.unsafeReadline();
      lineCount += 1;
    }
    const line2split = messageLine.split(': ');
    outputStream.write({
      kind: 'ErrorMessage',
      line: parseInt(lineNumberString) - 1,
      type: line2split[0] as MicroPythonExceptionType,
      message: (line2split.length === 1) ? '' : line2split[1]
    });
    outputStream.end();
  }
}