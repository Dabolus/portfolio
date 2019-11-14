module.exports = {
  presets: [
    [
      '@babel/modules',
      {
        loose: true,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/syntax-dynamic-import',
    [
      '@babel/transform-runtime',
      {
        corejs: 3,
        useESModules: true,
      },
    ],
  ],
};
