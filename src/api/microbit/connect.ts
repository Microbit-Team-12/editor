import { ConnectionFailure, MicrobitConnection } from '../microbit-api';
import { defaultConfig, ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

async function createConnection(port: SerialPort, config: ManagerOption): Promise<MicrobitConnection | ConnectionFailure> {
  await port.open(config.serialConnectionOption);

  return {
    kind: 'MicrobitConnection',
    interact: new ConnectedMicrobitInteract(port, config),
    disconnection: new Promise((resolve, reject) => {
      port.addEventListener('disconnect', (event) => {
        resolve();
      });
    })
  };
}

export async function connectBySelection(config: ManagerOption = defaultConfig): Promise< MicrobitConnection | ConnectionFailure> {
  //TODO: Use webserial polyfill to add support for lower version of chrome
  if (!('serial' in navigator)) return {
    kind: 'ConnectionFailure',
    reason: 'WebSerial not Supported'
  };

  let port: SerialPort;
  if (config.devReusePort) port = (await navigator.serial.getPorts())[0];
  else port = await navigator.serial.requestPort(config.serialRequsetOption);
  
  if (port == null) return {
    kind: 'ConnectionFailure',
    reason: 'No SerialPort Selected'
  };

  return await createConnection(port,config);
}


export async function connectByPlugIn(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | ConnectionFailure>{
  return new Promise((resolve,reject)=>{
    navigator.serial.addEventListener('connect', async (event) => {
      const port: SerialPort = (event as any).port || event.target;
      resolve(await createConnection(port,config));
    });
  });
}