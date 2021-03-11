import { ConnectionFailure, MicrobitConnection } from '../microbit-api';
import { ManagerOption } from '../microbit-api-config';
import { ActualMicrobitConnection } from './connection';

export async function connect(config: ManagerOption): Promise< MicrobitConnection | ConnectionFailure> {
  //To be relaxed with a webserial polyfill
  if (!('serial' in navigator)) return {
    kind: 'ConnectionFailure',
    reason: 'WebSerial not Supported'
  };

  let port: SerialPort;
  if (config.devReusePort) {
    port = (await navigator.serial.getPorts())[0];
  } else {
    port = await navigator.serial.requestPort(config.serialRequsetOption);
  }

  if (port == null) return {
    kind: 'ConnectionFailure',
    reason: 'No SerialPort Selected'
  };

  return new ActualMicrobitConnection(port,config);

}