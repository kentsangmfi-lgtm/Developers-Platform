import {copyFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));

const platformNextSourceRoot = resolve(
  process.env.PLATFORM_NEXT_DOCUMENT_DIR ??
    resolve(scriptDir, '../../platform-next/document'),
);
const realtimeChartServerSourceRoot = resolve(
  process.env.REALTIME_CHART_SERVER_DOCUMENT_DIR ??
    resolve(scriptDir, '../../realtimechartserver/document'),
);
const siteRoot = resolve(scriptDir, '..');

const sources: Array<{
  root: string;
  files: Array<[source: string, destination: string]>;
}> = [
  {
    root: platformNextSourceRoot,
    files: [
      ['openapi/fxserver-trader.yaml', 'openapi/fxserver-trader.yaml'],
      ['openapi/webproxy.yml', 'openapi/webproxy.yml'],
    ],
  },
  {
    root: realtimeChartServerSourceRoot,
    files: [
      ['openapi/openapi.yml', 'openapi/realtime-chart-server.yml'],
    ],
  },
];

for (const {root, files} of sources) {
  for (const [source, destination] of files) {
    const destinationPath = resolve(siteRoot, destination);
    mkdirSync(dirname(destinationPath), {recursive: true});
    copyFileSync(resolve(root, source), destinationPath);
    console.info(`Synced ${destination}`);
  }
}
