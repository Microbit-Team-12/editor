import Stream from 'ts-stream';
import { MicrobitOutput } from '../../../microbit-api';
import { ParseOption } from '../../../microbit-api-config';
import { SerialReader } from './reader';

/**
 * This class provides functions to read serial output of a specific procedure,
 * by using the reader helper class.
 * 
 * Below is its mechaism. Based on following input of code
 * ```
 * 1|>>>
 * 2|>>> file=open('main.py','w');s='print(1)';file.write(s);file.close();from microbit import *;sleep(0);reset();
 * 3|8
 * 4|1
 * 5|MicroPython v1.13 on 2021-02-19; micro:bit v2.0.0-beta.4 with nRF52833
 * 6|Type "help()" for more information.
 * 7|>>>
 * ```
 * We can know that
 * ```
 * 1|previous running stuff
 * 2|python code to flash 'main.py'
 * 3|number of bytes written, indicating flashing is done
 * 4|output of program
 * 5-7|program execution is done, REPL is starting
 * ```
 */
export class SerialParser {
  portReader: SerialReader;
  config: ParseOption;

  constructor(portReader: SerialReader, config:ParseOption) {
    this.portReader = portReader;
    this.config = config;
  }

  /**
   * Read until indication of flashing finishing.
   * 
   * line1 to (including) line3 in the example. 
   */
  async watchFlash():Promise<void> {
    await this.portReader.safeReadUntil(this.config.flashDone);
    await this.portReader.unsafeReadline();
    console.log('Flash done');
  }

  /**
   * Read until indication of reboot finishing. 
   * 
   * ```
   * 1|>>> from microbit import reset;reset()
   * 2|1
   * 3|MicroPython v1.13 on 2021-02-19; micro:bit v2.0.0-beta.4 with nRF52833
   * 4|Type "help()" for more information.
   * 5|>>>
   * ```
   */
  async watchReboot():Promise<void> {
    await this.portReader.safeReadUntil(this.config.rebootDone);
  }

  /**
   * Read until indication of execution finishing, 
   * recent output from serial will be sent to `outputStream`
   * 
   * Either program runs sucessful (and REPL starts). Stream closes.
   * 
   * Or Error occurs (`Traceback (most recent call last)`)
   * In this case, watchError will be called. (close stream in watchError)
   */
  async watchOutput(outputStream:Stream<MicrobitOutput>):Promise<void> {
    const signals = [
      this.config.execDone,
      this.config.execError
    ];
    
    const result = await this.portReader.safeReadUntilWithUpdate(signals, str => {
      outputStream.write({
        kind: 'NormalOutput',
        outputChunk: str
      });
    });
    console.log('Execution done');
    if (result === this.config.execError) this.watchError(outputStream);
    else outputStream.end();
  }

  /**
   * Read two more lines of error message.
   * Return the parsed error object, and closes the stream.
   * 
   * ```
   * Traceback (most recent call last):
   * File "main.py", line 1, in <module>
   * NameError: name 'prit' isn't defined
   *
   * ```
   */
  async watchError(outputStream: Stream<MicrobitOutput>):Promise<void> {
    const line1 = await this.portReader.unsafeReadline();
    const line2 = await this.portReader.unsafeReadline();
    outputStream.write({
      kind: 'ErrorMessage',
      line: -1,
      file: 'main.py',
      reason: '',
      message: line1+'\r\n'+line2
    });
    outputStream.end();
  }
}