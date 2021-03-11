export interface ManagerOption {
    devReusePort: boolean,
    serialConnectionOption: SerialOptions
    serialRequsetOption: SerialPortRequestOptions
    readOption: readOption
    parseOption: ParseOption
}

export interface readOption {
    updateMs: number
    cutLength: number
}

export interface ParseOption {
    flashDone: string
    execDone: string
    execError: string
}

export const defaultConfig: ManagerOption = {
  devReusePort: true,
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
    updateMs: 100,
    cutLength: 1000
  },
  parseOption: {
    flashDone: 'file.close();from microbit import reset;reset()\r\n',
    execDone: 'Type "help()" for more information.\r\n>>',
    execError: 'Traceback (most recent call last):\r\n'
  }
};