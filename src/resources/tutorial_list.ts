import { TutorialLocation } from '../tutorial';

/**
 * A module declaring the list of available tutorials.
 * 
 * All tutorials are supposed to be placed under the path /public/tutorials/,
 * and locations are to be specified relative to this path.
 */
export const tutorial_list: TutorialLocation[] = [
  { path: 'PythonTute.md', title: 'Python Language Features' },
  { path: 'ErrorTute.md', title: 'Python Errors' },
  { path: 'DisplayTute.md', title: 'Displaying Images on micro:bit' },
];
