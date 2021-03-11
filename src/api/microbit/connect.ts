import { ConnectionFailure, MicrobitConnection } from '../microbit-api';
import { defaultConfig, ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

/**
 * Given a unopenned serial port and configuration object,
 * create a MicrobitConnection object
 */
async function createConnection(port: SerialPort, config: ManagerOption): Promise<MicrobitConnection | ConnectionFailure> {
  try{
    await port.open(config.serialConnectionOption);
  } catch (error) {
    return {
      kind: 'ConnectionFailure',
      reason: error.message
    };
  }
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

/**
 * Create a MicrobitConnection object
 * By selecting a serial port in the native permission window.
 */
export async function connectBySelection(config: ManagerOption = defaultConfig): Promise< MicrobitConnection | ConnectionFailure> {
  //TODO: Use webserial polyfill to add support for lower version of chrome
  if (!('serial' in navigator)) return {
    kind: 'ConnectionFailure',
    reason: 'WebSerial not Supported'
  };

  let port: SerialPort;
  if (config.devReusePort) port = (await navigator.serial.getPorts())[0];
  else try {
    port = await navigator.serial.requestPort(config.serialRequsetOption);
  } catch (error) {
    return {
      kind: 'ConnectionFailure',
      reason: error.message
    };
  }
  if (port == null) return {
    kind: 'ConnectionFailure',
    reason: 'No SerialPort Selected'
  };

  return await createConnection(port,config);
}

/**
 * Create a MicrobitConnection object
 * By user plugging the device
 */
export async function connectByPlugIn(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | ConnectionFailure>{
  if (!('serial' in navigator)) return {
    kind: 'ConnectionFailure',
    reason: 'WebSerial not Supported'
  };
  
  return new Promise((resolve,reject)=>{
    navigator.serial.addEventListener('connect', async (event) => {
      const port: SerialPort = (event as any).port || event.target;
      //TODO: check USB vendor
      resolve(await createConnection(port,config));
    });
  });
}