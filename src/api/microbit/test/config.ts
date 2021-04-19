import { ManagerOption } from '../interface/config';

export const testConfig: ManagerOption = {
  connectOption: {
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    bufferSize: 4096,
    flowControl: 'none'
  },
  requestOption: {
    filters: [
      { usbVendorId: 0x0d28 }
    ]
  },
  readOption: {
    showLog: false,
    updateMs: 50,
    cutLength: 10000000
  },
  //maybe consider using regexp?
  signalOption: {
    showLog: false,
    validateAnswer: 'microbit',
    replLineReady: '>>> ',
    executionDone: 'Execute Done: 0x3f3f3f3f',
    executionStart: 'Execution Start: 0x3f3f3f3f',
    mainPYException: 'Traceback (most recent call last):\r\n  File "main.py", line ',
    execException: 'Traceback (most recent call last):\r\n  File "<stdin>", line 1, in <module>\r\n  File "<string>", line ',
    waitMsBeforeReboot: 1
  }
};