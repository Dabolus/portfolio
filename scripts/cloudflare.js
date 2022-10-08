import { pages } from './utils.js';

const {
  env: {
    REPORTER_BASE_URL: baseUrl,
    CLOUDFLARE_API_TOKEN: token,
    CLOUDFLARE_ZONE_ID: zoneId,
  },
} = process;

export default async () => {
  process.stdout.write('Purging CloudFlare cache...\n');
  const cloudflareRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        purge_everything: true,
      }),
    },
  );
  await cloudflareRes.text();

  process.stdout.write('Warming up new CloudFlare cache...\n');
  await Promise.all(
    pages.map(async ({ url }) => {
      const pageRes = await fetch(`${baseUrl}${url}`);
      await pageRes.text();
    }),
  );
};
