import Stream from 'ts-stream';

/**
 * A description of connection failure
*/
export interface FailedConnection {
  readonly kind: 'ConnectionFailure',
  readonly type: 'Failed to Obtain Port' | 'Failed to Open Port' | 'Port No Response'
  readonly reason: string
}

export interface MicrobitConnection {
  readonly kind: 'MicrobitConnection'
  /**
   * An object that allows us to interact with the connected micro:bit.
   */
  readonly interact: InteractWithConnectedMicrobit

  /**
   * A promise that completes when the micro:bit connection is no longer active.
   * This promise itself does not try to disconnect micro:bit.
   */
  readonly disconnection: Promise<void>
}

export enum MicrobitState{
  /**
   * Nothing is running,
   * 
   * Allowed: flash/execute/reboot
   * 
   * Not Allowed: interrupt
   */
  Free,
  /**
   * Code is running,
   * 
   * Allowed: Interrupt
   * 
   * Not Allowed: flash/execute/reboot
   */
  Busy
}

export interface InteractWithConnectedMicrobit {
  /**
   * Return State of Microbit in `MicrobitState`
   */
  getState(): MicrobitState

  /**
   * Flash ROM of the connected micro:bit.
   * 
   * The flashing consists of two stages of flashing the code followed by a reboot.
   * The promise completes when reboot is done, resulting in a stream of outputs from microbit.
   */
  flash: (code: string) => Promise<Stream<MicrobitOutput>>

  /**
   * Run code in REPL.
   * Microbit is not rebooted. So all previous variables are kept.
   */
  execute: (code: string) => Promise<Stream<MicrobitOutput>>

  /**
   * Reboots the connected micro:bit.
   * The promise completes with a stream of outputs from microbit.
   */
  reboot: () => Promise<Stream<MicrobitOutput>>

  /**
   * Send an interrupt signal the connected micro:bit.
   * This will try to stop any python code running on the micro:bit.
   * 
   * The promise completes when the interruption is successful.
   * If code is being executed, then there should be a ErrorMessage in the outputStream.
   */
  interrupt: () => Promise<void> 

  /**
   * Disconnect the paired micro:bit.
   */
  disconnect: () => Promise<void>
}

/**
 * Data that we expect to receive from micro:bit as a result of execututing the flashed code.
 */
export type MicrobitOutput = NormalOutput | ErrorMessage | ResetPressed

/**
 * A piece of content that is output to the standard output of micro:bit.
 */
export interface NormalOutput {
  readonly kind: 'NormalOutput'
  /**
   * outputChunk is a new piece of output we have obtained from micro:bit,
   * and may not correspond to a single print() executed on the device.
   */
  readonly outputChunk: string
}

/**
 * An object indicate reset button is pressed on the microbit
 * 
 * OutputStream will continue to output
 */
export interface ResetPressed{
  readonly kind: 'ResetPressed'
}

export type MicroPythonExceptionType = 'AssertionError'
  | 'AttributeError'
  | 'Exception'
  | 'ImportError'
  | 'IndexError'
  | 'KeyboardInterrupt'
  | 'KeyError'
  | 'MemoryError'
  | 'NameError'
  | 'NotImplementedError'
  | 'OSError'
  | 'RuntimeError'
  | 'StopIteration'
  | 'SyntaxError'
  | 'SystemExit'
  | 'TypeError'
  | 'ValueError'
  | 'ZeroDivisionError'
  | 'IndentationError'

/**
 * A description of a runtime error that occured on micro:bit
 */
export interface ErrorMessage {
  readonly kind: 'ErrorMessage'
  /**
   * A integer indicating in which line of user code the error occurs
   */
  readonly line: number
  /**
   * A string indicating type of the exception
   * For full list of types, see
   * https://docs.micropython.org/en/latest/library/builtins.html#exceptions
   */
  readonly type: MicroPythonExceptionType
  /**
   * A *simple* explanation of the error
   */
  readonly message: string
}
