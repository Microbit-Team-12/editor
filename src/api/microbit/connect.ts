import { serial } from 'web-serial-polyfill';
import { ConnectionFailure, MicrobitConnection } from '../microbit-api';
import { defaultConfig, ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

/**
 * Given a unopenned serial port and configuration object,
 * create a MicrobitConnection object
 */
async function createConnection(port: SerialPort, config: ManagerOption): Promise<MicrobitConnection | ConnectionFailure> {
  try {
    await port.open(config.serialConnectionOption);
  } catch (error) {
    return {
      kind: 'ConnectionFailure',
      type: 'Failed to Open Port',
      reason: error.message
    };
  }
  const portInteract = new ConnectedMicrobitInteract(port, config);
  return {
    kind: 'MicrobitConnection',
    interact: portInteract,
    disconnection: new Promise((resolve, reject) => {
      const onDisconnect = (event:Event) => {
        console.log('disconnected');
        port.removeEventListener('disconnect',onDisconnect);
        resolve();
      };
      port.addEventListener('disconnect', onDisconnect);
    })
  };
}

function checkUSBInfo(info: SerialPortInfo, filters: SerialPortFilter[] | undefined): boolean {
  //no constraint
  if (filters === undefined) return true;
  else {
    for (const f of filters) {
      //for two property, no constraint or equal
      if (f.usbProductId === undefined || f.usbProductId === info.usbProductId)
        if (f.usbVendorId === undefined || f.usbVendorId === info.usbVendorId)
          return true;
    }
    return false;
  }
}


/**
 * Create a MicrobitConnection object
 * By selecting a serial port in the native permission window.
 */
export async function connectBySelection(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | ConnectionFailure> {
  if (!('serial' in navigator)) {
    if ('usb' in navigator) (navigator as any).serial = serial;
    else return {
      kind: 'ConnectionFailure',
      type: 'Browser Not Supported',
      reason: 'Your browser does not support WebSerial or WebUSB, please consider use another browser'
    };
  }

  let port: SerialPort;
  if (config.devReusePort) port = (await navigator.serial.getPorts())[0];
  else try {
    port = await navigator.serial.requestPort(config.serialRequsetOption);
  } catch (error) {
    return {
      kind: 'ConnectionFailure',
      type: 'Failed to Obtain Port',
      reason: error.message
    };
  }
  if (port == null) return {
    kind: 'ConnectionFailure',
    type: 'Failed to Obtain Port',
    reason: 'No SerialPort Selected'
  };

  return await createConnection(port, config);
}

/**
 * Create a MicrobitConnection object
 * By user plugging the device
 */
export async function connectByPlugIn(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | ConnectionFailure> {
  if (!('serial' in navigator)) {
    if ('usb' in navigator) (navigator as any).serial = serial;
    else return {
      kind: 'ConnectionFailure',
      type: 'Browser Not Supported',
      reason: 'Your browser does not support WebSerial or WebUSB, please consider use another browser'
    };
  }
  
  return new Promise((resolve, reject) => {
    const waitForPort = async (event: Event) => {
      const port: SerialPort = (event as any).port || event.target;
      if (checkUSBInfo(port.getInfo(), config.serialRequsetOption.filters)) {
        navigator.serial.removeEventListener('connect', waitForPort);
        resolve(await createConnection(port, config));
      }
    };
    navigator.serial.addEventListener('connect', waitForPort);
  });
}