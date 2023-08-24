import path from 'node:path';
import fs from 'fs-extra';
import { globby } from 'globby';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

export interface CopyTarget {
  from: string;
  to: string;
}

const basePath = path.resolve(__dirname, '../..');

export const copyAssets = async (
  targets: readonly CopyTarget[],
): Promise<void> => {
  const resolvedTargets = await Promise.all(
    targets.map(async ({ from, to }) => ({
      files: await globby(path.resolve(basePath, from), {
        expandDirectories: false,
        onlyFiles: false,
      }),
      destination: path.resolve(basePath, to),
    })),
  );

  for (const { files, destination } of resolvedTargets) {
    for (const file of files) {
      await fs.copy(file, path.resolve(destination, path.basename(file)), {
        errorOnExist: false,
        overwrite: true,
      });
    }
  }
};

interface GitHubAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  uploader: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  content_type: string;
  state: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
}

export const downloadROMs = async (to: string) => {
  const resolvedTo = path.resolve(basePath, to);
  await fs.mkdirp(resolvedTo);
  const res = await fetch(
    'https://api.github.com/repos/Dabolus/portfolio-cartridge/releases?per_page=1',
    {
      headers: {
        accept: 'application/vnd.github+json',
      },
    },
  );
  const [{ assets }]: [{ assets: GitHubAsset[] }] = await res.json();
  await Promise.all(
    assets.map(async ({ name, browser_download_url }) => {
      const assetRes = await fetch(browser_download_url);
      const buffer = await assetRes.arrayBuffer();
      await fs.writeFile(
        path.resolve(basePath, resolvedTo, name),
        Buffer.from(buffer),
      );
    }),
  );
};
