/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Stream from 'ts-stream';
import { connectByPariedDevice } from '../impl/connect';
import { ConnectedMicrobitInteract } from '../impl/interact';
import { MicroPythonExceptionType } from '../interface/message';
import { testConfig } from './config';

type TestFunction = () => Promise<boolean>

let con: ConnectedMicrobitInteract|null = null;

async function streamLastElem<T>(stream: Stream<T>):Promise<T|null>{
  let lastOutput: T | null = null;
  await stream.forEach(value => { lastOutput = value; });
  return lastOutput;

}

async function flashAndExpectAnswer(code:string, answer:string): Promise<boolean>{
  const lastOutput = await streamLastElem(await con!.flash(code));
  if (lastOutput === null) return false;
  else if(lastOutput.kind==='NormalOutput') return lastOutput.outputChunk===answer;
  else return false;
}

async function flashAndExpectError(code: string, type: MicroPythonExceptionType, line:number): Promise<boolean>{
  const lastOutput = await streamLastElem(await con!.flash(code));
  if (lastOutput === null) return false;
  else if(lastOutput.kind==='ErrorMessage') return lastOutput.line===line && lastOutput.type===type;
  else return false;
}

async function printLongString(len: number): Promise<boolean> {
  const str = '1'.repeat(len);
  return flashAndExpectAnswer('print(' + str + ')', str + '\r\n');
}

///(1\r\n)*(1|1\r|)/g
async function while1(): Promise<boolean>{
  const code = `while True:
    print(1)`;
  const stream = await con!.flash(code);
  setTimeout(() => con!.interrupt(), 2000);
  return new Promise(async (resolve,reject)=>{
    let interruptted = false;
    await stream.forEach(message => {
      if(interruptted) resolve(false);
      switch (message.kind) {
        case 'NormalOutput':
          if (message.outputChunk.match(/^(|\r\n|\n)(1\r\n)*(1|1\r|)$/g)==null) resolve(false);
          break;
        case 'ErrorMessage':
          if (message.type === 'KeyboardInterrupt') interruptted = true;
          else resolve(false);
          break;          
      }});
    resolve(true);
  });
}

const tests: Map<string, TestFunction> = new Map([
  ['single line 1+1', () => flashAndExpectAnswer('print(1+1)', '2\r\n')],
  ['two line 1+1', () => flashAndExpectAnswer(`print(1+1)
`, '2\r\n')],
  ['1000 character', () => printLongString(1000)],
  ['2000 character', () => printLongString(2000)],
  ['4000 character', () => printLongString(4000)],
  ['8000 character', () => printLongString(8000)],
  ['prit(1)', () => flashAndExpectError('prit(1)', 'NameError', 1)],
  ['while1', () => while1()]
]);

export async function doProgramTest(): Promise<void> {
  const c = await connectByPariedDevice(testConfig);
  if (c.kind === 'MicrobitConnection') {
    con = c.interact;
    for (const [name, f] of tests) {
      console.log('Testing ' + name);
      if (await f()) console.log('Passed');
      else console.log('Failed');
    }
  }
}