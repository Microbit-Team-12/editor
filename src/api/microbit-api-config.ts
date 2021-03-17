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
  signalOption: SignalOption
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

export interface SignalOption {
  /**
   * If log should be printed to console
   */
  showLog: boolean,
  /**
   * A string printed by microbit serial repl
   * Indicating waiting for user input code
   */
  replLineReady: string,
  /**
   * A string to be printed by `print` statement
   * Before execution of user code
   * Outputting is implemented by adding print statement before user code
   */
  executionStart: string,
  /**
   * A string to be printed by `print` statement 
   * After execution of given user code
   * Outputting is implemented by adding print statement after user code
   */
  executionDone: string,
  /**
   * A string printed by microbit serial repl
   * Indicating an error occured
   */
  mainPYException: string,
  execException: string,
  /**
   * Ms before microbit is rebooted to run `main.py`
   * Allowing output buffer to be emptied before reboot
   * 
   * Not used right now
   */
  waitMsBeforeReboot: number,
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
    updateMs: 50,
    cutLength: 1000
  },
  //maybe consider using regexp?
  signalOption: {
    showLog: true,
    replLineReady: '>>> ',
    executionDone: 'Execute Done: 0x3f3f3f3f',
    executionStart: 'Execution Start: 0x3f3f3f3f',
    mainPYException: 'Traceback (most recent call last):\r\n  File "main.py", line ',
    execException:   'Traceback (most recent call last):\r\n  File "<stdin>", line 1, in <module>\r\n  File "<string>", line ',
    waitMsBeforeReboot: 1
  }
};