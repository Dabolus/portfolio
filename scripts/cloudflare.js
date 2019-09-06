const fetch = require('node-fetch');

const {
  env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ZONE_ID: zoneId },
} = process;

module.exports = () =>
  fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      purge_everything: true,
    }),
  });
