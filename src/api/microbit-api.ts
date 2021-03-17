import Stream from 'ts-stream';

export interface ConnectToMicrobit {
  /**
   * Get a connection to micro:bit by letting the user select connected devices.
   * 
   * The promise completes with a object holding a connection to micro:bit if successful.
   * Otherwise completes with a ConnectionFailure object.
   */
  connect: () => Promise<MicrobitConnection | FailedConnection>
}

/**
 * A description of connection failure
*/
export interface FailedConnection {
  kind: 'ConnectionFailure',
  type: 'Browser Not Supported' | 'Failed to Obtain Port' | 'Failed to Open Port' | 'Port No Response'
  reason: string
}

export interface MicrobitConnection {
  kind: 'MicrobitConnection'
  /**
   * An object that allows us to interact with the connected micro:bit.
   */
  interact: InteractWithConnectedMicrobit

  /**
   * A promise that completes when the micro:bit connection is no longer active.
   * This promise itself does not try to disconnect micro:bit.
   */
  disconnection: Promise<void>
}

export interface InteractWithConnectedMicrobit {
  /**
   * Flash ROM of the connected micro:bit.
   * 
   * The flashing consists of two stages of flashing the code followed by a reboot.
   * The promise completes when reboot is done, resulting in a stream of outputs from microbit.
   */
  flash: (code: string) => Promise<Stream<MicrobitOutput>>

  /**
   * Run code in REPL.
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
}

/**
 * Data that we expect to receive from micro:bit as a result of execututing the flashed code.
 */
export type MicrobitOutput = NormalOutput | ErrorMessage

/**
 * A piece of content that is output to the standard output of micro:bit.
 */
export interface NormalOutput {
  kind: 'NormalOutput'
  /**
   * outputChunk is a new piece of output we have obtained from micro:bit,
   * and may not correspond to a single print() executed on the device.
   */
  outputChunk: string
}

/**
 * A description of a runtime error that occured on micro:bit
 */
export interface ErrorMessage {
  kind: 'ErrorMessage'
  /**
   * A integer indicating in which line of user code the error occurs
   */
  line: number
  /**
   * A string indicating type of the exception
   * For full list of types, see
   * https://docs.micropython.org/en/latest/library/builtins.html#exceptions
   */
  type: string
  /**
   * A *simple* explanation of the error
   */
  message: string
}
