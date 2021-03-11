import Stream from 'ts-stream';
import { MicrobitOutput } from '../../microbit-api';
import { ParseOption } from '../../microbit-api-config';
import { OutputReader } from './OutputReader';

export class OutputParser {
  portReader: OutputReader;
  config: ParseOption;

  constructor(portReader: OutputReader, config:ParseOption) {
    this.portReader = portReader;
    this.config = config;
  }

  async watchFlash():Promise<void> {
    await this.portReader.safeReadUntil(this.config.flashDone);
    await this.portReader.unsafeReadline();
    console.log('Flash done');
  }

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