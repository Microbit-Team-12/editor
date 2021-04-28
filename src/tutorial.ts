/**
 * A module concerning tutorial definitions.
 */

/**
 * An object containing information about a single tutorial
 */
export interface Tutorial {
  /**
   * content of the tutorial; supposed to be in a Markdown format.
   */
  readonly raw_content: string

  /**
   * An optional field that, when set to true, prevents the Duck from popping up when encountering an error.
   */
  readonly disable_duck?: boolean
}

/**
 * An entry specifying the location of the tutorial along with its title.
 */
export interface TutorialLocation {
  /**
   * Title for the tutorial, to be shown on the side-menu
   */
  readonly title: string

  /**
   * Path of the tutorial response, relative to /public/tutorials/.
   */
  readonly path: string
}

/**
 * Collection of tutorials, along with a default tutorial to display next to the editor.
 */
export interface TutorialList {
  readonly default: TutorialLocation
  readonly list: TutorialLocation[]
}

export interface TutorialResolver {

  /**
   * Resolves a tutorial from the location.
   * The returned promise always succeeds, either with a valid tutorial content or a null (when not found etc.)
   */
  resolve(location: TutorialLocation): Promise<Tutorial | null>

}

/**
 * A default resolver for a tutorial that fetches tutorial from /public/tutorials.
 * 
 * This resolver assumes that the editor is at a parent directory of /public.
 */
export const publicTutorialResolver: TutorialResolver = {
  async resolve(location: TutorialLocation): Promise<Tutorial | null> {
    try {
      const response = await fetch(`./public/tutorials/${location.path}`);

      return response.ok ? {
        raw_content: await response.text(),
        disable_duck: location.path === 'ErrorTute.md'
      } : null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
};
