import Stream from 'ts-stream';
import { MicrobitOutput, MicroPythonExceptionType } from '../../../microbit-api';
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
  signal: SignalOption;
  startSignals: string[];
  endSignals: string[];

  constructor(portReader: SerialReader, config: SignalOption) {
    this.portReader = portReader;
    this.signal = config;
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
  readUntilNewREPLLine(): Promise<void> {
    return this.portReader.safeReadUntil(this.signal.replLineReady);
  }

  /**
   * Read the whole process of user code output
   * 
   * - First it look for executionStart Signal from serial.
   * - Pipe user code output to outputStream
   * - Until executionDone Signal from serial
   */
  async readCodeOutput(outputStream: Stream<MicrobitOutput>): Promise<void> {
    //read until executionStart signal appears on signal
    const result1 = await this.portReader.safeReadUntilWithUpdate(
      this.startSignals,
      str => null
    );
    if(result1!== this.startSignals[0]) this.readErrors(outputStream);
    else{
      console.log('Execution Start');
      //Now user code will run
      //read until executionEnd signal appear on signal
      let result2 = this.endSignals[1];
      while (result2===this.endSignals[1]){
        result2 = await this.portReader.safeReadUntilWithUpdate(
          this.endSignals,
          str => outputStream.write({
            kind: 'NormalOutput',
            outputChunk: str
          })
        );
        if(result2 === this.endSignals[1]) outputStream.write({
          kind: 'ResetPressed'
        });
      }
      if (result2 !== this.endSignals[0]) this.readErrors(outputStream);
      else outputStream.end();
      console.log('Execution done');
    }
  }

  /**
   * Read and parse micropython error output
   */
  async readErrors(outputStream: Stream<MicrobitOutput>):Promise<void>{
    //line1 indicates in which line of user code exception occured
    //which is first line after mainPYException and execException
    const line1 = await this.portReader.unsafeReadline();
    const lineNumberString = line1.split(',', 2)[0];
    //messageLine is in the form of 'ErrorType:ErrorMessage'
    //exec is used in user code, the line following line1 may not be mssageLine
    let messageLine = '  ';
    while (messageLine.startsWith('  ')) messageLine = await this.portReader.unsafeReadline();
    const line2split = messageLine.split(': ');
    outputStream.write({
      kind: 'ErrorMessage',
      line: parseInt(lineNumberString) - 1,
      type: line2split[0] as MicroPythonExceptionType,
      message: line2split[1]
    });
    outputStream.end();
  }
}