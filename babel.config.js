module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        bugfixes: true,
        targets: {
          esmodules: true,
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    '@babel/typescript',
  ],
};
