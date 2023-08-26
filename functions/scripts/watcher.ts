import fs from 'node:fs';
import { globbySync } from 'globby';

export interface WatchOptions {
  /**
   * Defines files/paths to The whole relative or absolute path is tested, not just filename.
   */
  ignored?: string | string[];

  /**
   * If set to `false` then events are also emitted for matching paths while
   * instantiating the watching as these file paths are discovered.
   */
  ignoreInitial?: boolean;

  /**
   * The base directory from which watch `paths` are to be derived. Paths emitted with events will
   * be relative to this.
   */
  cwd?: string;
}

export const watch = (
  paths: string | readonly string[],
  options?: WatchOptions,
  listener?: fs.WatchListener<string>,
): fs.FSWatcher => {
  const actualPaths = globbySync(paths, {
    cwd: options?.cwd,
    ...(options?.ignored && {
      ignore: Array.isArray(options.ignored)
        ? options.ignored
        : [options.ignored],
    }),
  });
  const watchers = actualPaths.map((path) => fs.watch(path, listener));
  // Return a proxy that calls the requested method on all watchers
  const proxy = new Proxy(
    {},
    {
      get(_, prop) {
        return (...args: unknown[]) => {
          watchers.forEach((watcher) => {
            (
              watcher as unknown as Record<
                typeof prop,
                (...args: unknown[]) => unknown
              >
            )[prop](...args);
          });
        };
      },
    },
  ) as fs.FSWatcher;

  if (!options?.ignoreInitial) {
    actualPaths.forEach((path) => {
      listener?.('rename', path);
    });
  }

  return proxy;
};
