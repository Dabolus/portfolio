const { minify } = require('terser');

module.exports = () => (code) => minify(code);
