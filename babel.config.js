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
  plugins: ['@babel/syntax-dynamic-import'],
};
