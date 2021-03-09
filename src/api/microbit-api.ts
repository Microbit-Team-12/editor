import Stream from 'ts-stream';

/**
 * Data that we expect to receive from micro:bit as a result of execution/flash
 */
export type MicrobitOutput = NormalOutput | ErrorMessage

/**
 * A content that is output to the standard output of micro:bit
 */
export interface NormalOutput {
  kind: 'NormalOutput'
  outputLine: string
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

export interface InteractWithConnectedMicrobit {
  /**
   * Flash ROM of the connected micro:bit.
   * 
   * The promise completes when flashing is done,
   * and results in a stream of outputs from microbit.
   */
  flash: (code: string) => Promise<Stream<MicrobitOutput>>

  /**
   * Execute the given code on an isolated REPL interpreter on micro:bit.
   * 
   * The promise completes when we are done sending the code,
   * and results in a stream of outputs from microbit.
   */
  execute: (code: string) => Promise<Stream<MicrobitOutput>>

  /**
   * Reboots the connected micro:bit.
   */
  reboot: () => Promise<void>

  /**
   * Interrupt the connected micro:bit.
   * 
   * TODO: add more description here
   */
  interrupt: () => Promise<void>
}
