import { TutorialList } from '../tutorial';

/**
 * A module declaring the list of available tutorials.
 *
 * All tutorials are supposed to be placed under the path /public/tutorials/,
 * and locations are to be specified relative to this path.
 */

const pythonTute = { path: 'PythonTute.md', title: 'Python Language Features' };

export const defaultTutorialList: TutorialList = {
  default : pythonTute,
  list: [
    pythonTute,
    { path: 'ErrorTute.md', title: 'Python Errors' },
    { path: 'DisplayTute.md', title: 'Displaying Images on micro:bit' },
    { path: 'SoundTute.md', title: 'Playing sounds on micro:bit' },
  ]
};
