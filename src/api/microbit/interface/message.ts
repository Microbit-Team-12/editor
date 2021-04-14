import { ConnectedMicrobitInteract } from '../impl/interact';

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
  readonly interact: ConnectedMicrobitInteract

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
