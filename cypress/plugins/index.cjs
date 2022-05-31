const axe = require('axe-core/axe.js');

module.exports = (on, config) => {
  on('task', {
    getAxeSource: () => axe.source,
  });
};
