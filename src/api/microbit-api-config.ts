//TODO: Rename

export interface ManagerOption {
  /**
   * If paried serial should be used.
   */
  devReusePort: boolean,
  /**
   * Parameter used to connect serial port. See `SerialOptions`
   */
  serialConnectionOption: SerialOptions
  /**
   * Parameter used for filtering serial port. See `SerialPortRequestOptions`
   */
  serialRequsetOption: SerialPortRequestOptions
  /**
   * Parameter used for reader class
   */
  readOption: readOption
  /**
   * Parameter used for parser class
   */
  parseOption: ParseOption
}

export interface readOption {
  /**
   * If log should be printed to console
   */
  showLog: boolean,
  /**
   * Program output should be updated to the web every `updateMs` ms.
   */
  updateMs: number
  /**
   * Length of program output that should be kept.
   * 
   * It is recommended to set this to 2 * maximum number of character in the textarea.
   */
  cutLength: number
}

export interface ParseOption {
  /**
   * If log should be printed to console
   */
  showLog: boolean,
  /**
   * Indication of flash done
   */
  flashDone: string
  /**
   * Indication of reboot done
   */
  rebootDone: string
  /**
   * Indication of execution done without errors
   */
  execDone: string
  /**
   * Indication of execution stopped with errors
   */
  execError: string
}

export const defaultConfig: ManagerOption = {
  devReusePort: false,
  serialConnectionOption: {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    bufferSize: 4096,
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
  //maybe consider using regexp?
  parseOption: {
    showLog: true,
    flashDone: 'file.close();from microbit import *;sleep(0);reset()\r\n',
    rebootDone: 'from microbit import *;reset()\r\n',
    //execDone: 'Type "help()" for more information.\r\n>>',
    execDone: '\r\nMicroPython v1.',
    execError: 'Traceback (most recent call last):\r\n'
  }
};