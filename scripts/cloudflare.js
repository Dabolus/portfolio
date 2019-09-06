const cloudflare = require('cloudflare');

const {
  env: { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ZONE_ID: zoneId },
} = process;

const cf = cloudflare({ token });

export const purgeCache = () =>
  cf.zones.purgeCache(zoneId, {
    purge_everything: true,
  });
