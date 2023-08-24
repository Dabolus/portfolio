import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

export const resolveDependencyPath = async (dependency: string) =>
  fileURLToPath(await import.meta.resolve!(dependency));

export const computeDirname = (importMetaUrl: string) =>
  dirname(fileURLToPath(importMetaUrl));

const __dirname = computeDirname(import.meta.url);

export const cachePath = resolve(__dirname, '../../node_modules/.cache/pwa');

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export const logExecutionTime =
  <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    startLogTemplate: string | ((...args: Parameters<T>) => string),
    endLogTemplate: string | ((time: string, ...args: Parameters<T>) => string),
  ) =>
  async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    console.log(
      typeof startLogTemplate === 'string'
        ? startLogTemplate
        : startLogTemplate(...args),
    );
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    const diff = end - start;
    const prettyTime =
      diff < 1000
        ? `${numberFormat.format(diff)}ms`
        : `${numberFormat.format(diff / 1000)}s`;
    console.log(
      typeof endLogTemplate === 'string'
        ? endLogTemplate
        : endLogTemplate(prettyTime, ...args),
    );
    return result as Awaited<ReturnType<T>>;
  };

export const computeTargets = () => {
  // The idea here is to support ~3 years of old browsers.
  // If we don’t use the `target` option, esbuild will basically assume all the
  // latest features are supported, and might even “upgrade” our code to newer
  // syntax if it’s shorter as a form of minification. So it’s important to lock
  // this down somehow, so that we don’t update esbuild and accidentally make
  // many users unable to use the site.
  const thisYear = new Date().getFullYear();
  const maxYearsToSupport = 3;
  // Safari for iOS 13 was released in September 2019. Since then, Apple has released
  // a new major version in the middle of September every year. However, it’s
  // reasonable that it takes a few months for people to upgrade, so we remove 1
  // to not count the new version until January.
  // https://en.wikipedia.org/wiki/Safari_version_history
  const estimatedLatestIosVersion = thisYear - 2019 + 13 - 1;

  return [
    // For JavaScript you can specify an ECMAScript standard. A new standard is
    // usually set during spring, and becomes official around June. Removing 1
    // gives a year for browsers to implement the new features (but some are
    // already supported before the specification comes out).
    `es${thisYear - maxYearsToSupport - 1}`,

    // For CSS one has to specify browser versions. Note that this affects JS too.
    // Safari has the slowest release cycle so it felt the easiest to use that.
    `ios${estimatedLatestIosVersion - maxYearsToSupport}`,
  ];
};
