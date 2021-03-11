export interface ManagerOption {
    devReusePort: boolean,
    serialConnectionOption: SerialOptions
    serialRequsetOption: SerialPortRequestOptions
    readOption: readOption
    parseOption: ParseOption
}

export interface readOption {
    showLog: boolean,
    updateMs: number
    cutLength: number
}

export interface ParseOption {
    showLog: boolean,
    flashDone: string
    rebootDone: string
    execDone: string
    execError: string
}

export const defaultConfig: ManagerOption = {
  devReusePort: false,
  serialConnectionOption: {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    bufferSize: 255,
    flowControl: 'none'
  },
  serialRequsetOption: {
    filters: [
      { usbVendorId: 0x0d28 }
    ]
  },
  readOption: {
    showLog: true,
    updateMs: 100,
    cutLength: 1000
  },
  parseOption: {
    showLog: true,
    flashDone: 'file.close();from microbit import *;sleep(0);reset()\r\n',
    rebootDone: 'from microbit import *;reset()\r\n',
    execDone: 'Type "help()" for more information.\r\n>>',
    execError: 'Traceback (most recent call last):\r\n'
  }
};