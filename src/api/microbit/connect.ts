import { ConnectionFailure, MicrobitConnection } from '../microbit-api';
import { defaultConfig, ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

export async function connect(config: ManagerOption = defaultConfig): Promise< MicrobitConnection | ConnectionFailure> {
  //TODO: Use webserial polyfill to add support for lower version of chrome
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

  //TODO: Add timeout
  await port.open(config.serialConnectionOption);
  navigator.serial.addEventListener('disconnect', (event) => {
    console.log(event.target);
  });
  return {
    kind: 'MicrobitConnection',
    interact: new ConnectedMicrobitInteract(port, config),
    disconnection: '' as any
  };
}