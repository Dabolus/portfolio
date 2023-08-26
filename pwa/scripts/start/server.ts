import fs from 'node:fs';
import path from 'node:path';
import { debounce } from 'lodash-es';
import serveStatic from 'serve-static-bun';
import type { Server, ServerWebSocket } from 'bun';

export interface CreateServerOptions {
  baseDir?: string;
  port?: number;
  serveStaticOptions?: Omit<
    Parameters<typeof serveStatic>[1],
    'middlewareMode' | 'handleErrors'
  >;
  reloadDebounce?: number;
}

export interface WatchServer {
  server: Server;
  watcher: fs.FSWatcher;
}

export const createServer = async ({
  baseDir = '.',
  port = 3000,
  serveStaticOptions,
  reloadDebounce = 0,
}: CreateServerOptions = {}): Promise<WatchServer> => {
  await fs.promises.mkdir(baseDir, { recursive: true });
  // Needed to workaround the fact that `serve-static-bun` computes the root as `${process.cwd()}/${root}`
  const root = path.isAbsolute(baseDir)
    ? path.relative(process.cwd(), baseDir)
    : baseDir;

  const sockets: ServerWebSocket<unknown>[] = [];
  const server = Bun.serve({
    async fetch(req, server) {
      if (req.url.endsWith('/updates')) {
        server.upgrade(req);
        return;
      }
      return serveStatic(root, serveStaticOptions)(req);
    },
    websocket: {
      message() {
        /* no-op */
      },
      open(ws) {
        sockets.push(ws);
      },
      close(ws) {
        sockets.splice(sockets.indexOf(ws), 1);
      },
      perMessageDeflate: true,
    },
    port,
  });

  let changedFilesQueue: string[] = [];
  const notifySockets = debounce(() => {
    console.log('Sending update to all clients...');
    const files = changedFilesQueue;
    changedFilesQueue = [];
    sockets.forEach((socket) => {
      socket.send(JSON.stringify({ type: 'update', files }));
    });
  }, reloadDebounce);
  const watcher = fs.watch(
    baseDir,
    { recursive: true },
    (event, changedPath) => {
      if (event !== 'change' && event !== 'rename') {
        return;
      }
      console.log(`\x1b[32m${changedPath}\x1b[0m changed, queueing reload...`);
      changedFilesQueue.push(changedPath);
      notifySockets();
    },
  );

  return { server, watcher };
};
