import { serial } from 'web-serial-polyfill';
import { FailedConnection, MicrobitConnection } from '../microbit-api';
import { defaultConfig, ManagerOption } from '../microbit-api-config';
import { ConnectedMicrobitInteract } from './interact';

/**
 * Check if browser support WebSerial
 * Return true if WebSerial is supported
 * 
 * If WebSerial is not supported but WebUSB is supported,
 * this function applys polyfill from Google.
 */
export function checkCompatability(): boolean {
  if ('serial' in navigator) return true;
  else {
    if ('usb' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).serial = serial;
      return true;
    } else return false;
  }
}

/**
 * Given a unopenned serial port and configuration object,
 * Create a MicrobitConnection object
 */
async function createConnection(port: SerialPort, config: ManagerOption): Promise<MicrobitConnection | FailedConnection> {
  try {
    await port.open(config.connectOption);
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
    disconnection: new Promise((resolve, _) => {
      const onDisconnect = (_: Event) => {
        console.log('disconnected');
        port.removeEventListener('disconnect', onDisconnect);
        resolve();
      };
      port.addEventListener('disconnect', onDisconnect);
    })
  };
}

/**
 * Create a MicrobitConnection object
 * By selecting a serial port in the native permission window.
 * 
 * **This must be followed by a UserGesture within a time period**
 * 
 * *In some rare cases, calling other function before this can result in a UserGesture Error*
 */
export async function connectBySelection(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | FailedConnection> {
  let port: SerialPort;
  try {
    port = await navigator.serial.requestPort(config.requestOption);
  } catch (error) {
    return {
      kind: 'ConnectionFailure',
      type: 'Failed to Obtain Port',
      reason: error.message
    };
  }
  return createConnection(port, config);
}

/**
 * Create a MicrobitConnection object
 * By connecting to a paried serial device
 * This does not require selecting device in the native window.
 */
export async function connectByPariedDevice(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | FailedConnection> {
  const ports = await navigator.serial.getPorts();
  if (ports.length === 1) return createConnection(ports[0], config);
  else if(ports.length === 0) return {
    kind: 'ConnectionFailure',
    type: 'Failed to Obtain Port',
    reason: 'No Paired Serial Devices Available'
  }; else return {
    kind: 'ConnectionFailure',
    type: 'Failed to Obtain Port',
    reason: 'Multiple Paired Serial Devices Available'
  };
}

/**
 * Create a MicrobitConnection object
 * By user plugging the device
 */
export async function connectByPlugIn(config: ManagerOption = defaultConfig): Promise<MicrobitConnection | FailedConnection> {
  //Given serialPortInfo, check if it agrees with filters
  function checkUSBInfo(info: SerialPortInfo, filters: SerialPortFilter[] | undefined): boolean {
    if (filters === undefined) return true; //no constraint
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
  
  return new Promise((resolve, _) => {
    /**
     * A event listener function
     * Resolves the promise when a device is plugged in
     */
    const waitForPort = async(event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const port: SerialPort = (event as any).port || event.target;
      if (checkUSBInfo(port.getInfo(), config.requestOption.filters)) {
        navigator.serial.removeEventListener('connect', waitForPort);
        resolve(createConnection(port, config));
      }
    };
    //add the listener
    navigator.serial.addEventListener('connect', waitForPort);
  });
}