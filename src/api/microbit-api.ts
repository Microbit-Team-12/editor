import Stream from 'ts-stream';

export interface ConnectToMicrobit {
  /**
   * Get a connection to micro:bit by letting the user select connected devices.
   * 
   * The promise completes with a object that allows interaction with micro:bit if connection is successful.
   * Otherwise completes with a ConnectionFailure object.
   */
  connect: () => Promise<InteractWithConnectedMicrobit|ConnectionFailure>
}

/**
 * A description of connection failure
*/

export interface ConnectionFailure{
  kind: 'ConnectionFailure',
  reason: string
}

export interface MicrobitConnection {
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
   * Reboots the connected micro:bit.
   */
  reboot: () => Promise<void>

  /**
   * Send an interrupt signal the connected micro:bit.
   * This will try to stop any python code running on the micro:bit.
   * 
   * The promise completes when the interruption is successful.
   */
  interrupt: () => Promise<void>
}

/**
 * Data that we expect to receive from micro:bit as a result of execututing the flashed code.
 */
export type MicrobitOutput = NormalOutput | ErrorMessage

/**
 * A piece of content that is output to the standard output of micro:bit.
 * 
 * outputChunk is a new piece of output we have obtained from micro:bit,
 * and may not correspond to a single print() executed on the device.
 */
export interface NormalOutput {
  kind: 'NormalOutput'
  outputChunk: string
}

/**
 * A description of a runtime error that occured on micro:bit
 */
export interface ErrorMessage {
  kind: 'ErrorMessage'
  line: number
  file: string
  reason: string
  message: string
}
