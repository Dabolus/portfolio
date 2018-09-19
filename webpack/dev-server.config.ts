/* tslint:disable */
// TODO: discover why we need these
/// <reference types="../typings/koa-connect" />

import { resolve } from 'path';
import compress from 'koa-compress';
import history from 'connect-history-api-fallback';
import convert from 'koa-connect';

const config = {
  content: resolve(__dirname, '../build', process.env.BUILD_NAME || 'default'),
  hot: true,
  port: 8888,
  dev: {
    publicPath: 'http://localhost:8888/',
  },
  open: {
    path: '/',
  },
  add: (app: any) => {
    // History API Fallback
    app.use(convert(history()));
    // Gzip compression
    app.use(compress());
  },
};

export default config;
