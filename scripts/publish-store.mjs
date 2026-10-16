import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { setTimeout } from 'node:timers/promises';

// Chrome Web Store API v2. Keep credentials out of arguments, artifacts, and
// logs. HTTP success alone does not mean an upload or submission succeeded.
export async function publishStore({ env = process.env, version, archive, fetchImpl = fetch, sleep = setTimeout, log = console.log }) {
  for (const key of ['CWS_PUBLISHER_ID', 'CWS_EXTENSION_ID', 'CWS_CLIENT_ID', 'CWS_CLIENT_SECRET', 'CWS_REFRESH_TOKEN']) {
    if (!env[key]) throw new Error(`Missing ${key}. See RELEASING.md for one-time publishing setup.`);
  }
  if (!/^[a-p]{32}$/.test(env.CWS_EXTENSION_ID) || !/^[a-zA-Z0-9_-]+$/.test(env.CWS_PUBLISHER_ID)) {
    throw new Error('Invalid Chrome Web Store publisher or extension ID');
  }
  if (env.GITHUB_REF_TYPE === 'tag' && env.GITHUB_REF_NAME !== `v${version}`) {
    throw new Error(`Release tag must be v${version}`);
  }
  async function request(label, url, options) {
    const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(60000) });
    let data;
    try { data = await response.json(); } catch { throw new Error(`${label}: invalid JSON (HTTP ${response.status})`); }
    if (!response.ok || data.error) throw new Error(`${label} failed (HTTP ${response.status}); check the developer dashboard or OAuth configuration.`);
    return data;
  }
  const token = await request('Authentication', 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: env.CWS_CLIENT_ID,
      client_secret: env.CWS_CLIENT_SECRET,
      refresh_token: env.CWS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!token.access_token) throw new Error('Authentication returned no access token');
  const resource = `publishers/${env.CWS_PUBLISHER_ID}/items/${env.CWS_EXTENSION_ID}`;
  const base = `https://chromewebstore.googleapis.com/v2/${resource}`;
  const headers = { Authorization: `Bearer ${token.access_token}` };
  const upload = await request('Upload', `https://chromewebstore.googleapis.com/upload/v2/${resource}:upload`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/zip' }, body: archive,
  });
  if (upload.crxVersion && upload.crxVersion !== version) throw new Error('Uploaded version does not match the release');
  let state = upload.uploadState;
  for (let i = 0; ['IN_PROGRESS', 'UPLOAD_IN_PROGRESS'].includes(state) && i < 30; i += 1) {
    await sleep(2000);
    const status = await request('Upload status', `${base}:fetchStatus`, { headers });
    state = status.lastAsyncUploadState;
  }
  if (state !== 'SUCCEEDED') throw new Error('Upload did not succeed; publishing was not attempted. Check the developer dashboard.');
  log(`Uploaded version ${version}. Submitting for Chrome Web Store review.`);
  const result = await request('Publish', `${base}:publish`, {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ publishType: 'DEFAULT_PUBLISH', blockOnWarnings: true }),
  });
  if (!['PENDING_REVIEW', 'PUBLISHED'].includes(result.state)) {
    throw new Error('Submission was not accepted for automatic publication; check the developer dashboard.');
  }
  log(`Chrome Web Store version ${version}: ${result.state}.`);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { version } = JSON.parse(await readFile(new URL('../extension/manifest.json', import.meta.url), 'utf8'));
    const archive = await readFile(new URL(`../dist/youtube-comments-closed-${version}-webstore.zip`, import.meta.url));
    await publishStore({ version, archive });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
