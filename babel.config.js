module.exports = {
  presets: [
    [
      '@babel/env',
      {
        loose: true,
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      {
        corejs: 3,
        sourceType: 'unambiguous',
      },
    ],
  ],
};
