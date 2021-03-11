import { readOption } from '../../../microbit-api-config';

export class SerialReader {
  private serialBuffer = ''
  private portReader: ReadableStreamDefaultReader<string>
  private config: readOption

  constructor(portReadable: ReadableStream<Uint8Array>, config: readOption) {
    const decoder = new TextDecoderStream();
    portReadable.pipeTo(decoder.writable);
    this.portReader = decoder.readable.getReader();
    this.config = config;
  }

  private async readLoop(termination: (text: string) => boolean): Promise<void> {
    if(this.config.showLog) console.log('Before Loop:'+this.serialBuffer);
    while (!termination(this.serialBuffer)) {
      const { value, done } = await this.portReader.read();
      if (this.config.showLog) console.log('In Loop:' + this.serialBuffer);
      this.serialBuffer += value;
    }
  }

  private async readLoopWithCut(termination: (text: string) => boolean, bufferLimit: number): Promise<void> {
    while (!termination(this.serialBuffer)) {
      const len = this.serialBuffer.length;
      if (len > bufferLimit) this.serialBuffer = this.serialBuffer.substring(len - bufferLimit);
      const { value, done } = await this.portReader.read();
      this.serialBuffer += value;
    }
  }

  private splitBufferOnFirst(token: string): [string, string] {
    const index = this.serialBuffer.indexOf(token);
    return [this.serialBuffer.substr(0, index), this.serialBuffer.substr(index + token.length)];
  }

  async unsafeReadline(): Promise<string> {
    const token = '\r\n';
    await this.readLoop(str => str.includes(token));
    const [before, after] = this.splitBufferOnFirst(token);
    this.serialBuffer = after;
    return before;
  }

  async safeReadUntil(token: string): Promise<void> {
    await this.readLoopWithCut(str => str.includes(token), token.length);
    this.serialBuffer = this.splitBufferOnFirst(token)[1];
  }

  async safeReadUntilWithUpdate(tokens: Array<string>, update: (text: string) => void): Promise<string> {
    let bufferUpdated = false;
    let matchedToken = '';
    const termination = (str: string) => {
      bufferUpdated = true;
      tokens.forEach(token => { if (str.includes(token)) matchedToken = token; });
      return matchedToken !== '';
    };
    const updateTimer = setInterval(() => {
      if (bufferUpdated) {
        update(this.serialBuffer);
        bufferUpdated = false;
      }
    }, this.config.updateMs);
    await this.readLoopWithCut(termination, this.config.cutLength);
    clearInterval(updateTimer);
    const [before, after] = this.splitBufferOnFirst(matchedToken);
    update(before);
    this.serialBuffer = after;
    return matchedToken;
  }
}
