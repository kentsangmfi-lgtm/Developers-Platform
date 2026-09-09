import {copyFileSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dump, load} from 'js-yaml';

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

type SyncedFile = {
  source: string;
  destination: string;
  /** Operations dropped from the published spec; upstream still documents them internally. */
  ignoredOperationIds?: string[];
};

const sources: Array<{
  root: string;
  files: SyncedFile[];
}> = [
  {
    root: platformNextSourceRoot,
    files: [
      {
        source: 'openapi/fxserver-trader.yaml',
        destination: 'openapi/fxserver-trader.yaml',
      },
      {
        source: 'openapi/webproxy.yml',
        destination: 'openapi/webproxy.yml',
        ignoredOperationIds: [
          'deposit',
          'getCountries',
          'getProvince',
          'getChallenge',
          'registerDemo',
          'cancelDemo',
          'forgotPasswordLive',
          'downloadmF4Page',
          'getNewsList',
          'getSingleNews',
          'getNewsListWebview',
          'getNewsContentWebview',
          'getBuySellRatioByReportGroup',
          'getReportGroupContractSetting',
          'getReportGroupContractList',
          'getCompanySetting',
          'postSession',
          'patchSession',
          'getAllTokens',
          'generateToken',
          'editToken',
          'changeTokenStatus',
          'getTokenConfig',
          'deleteToken',
        ],
      },
    ],
  },
  {
    root: realtimeChartServerSourceRoot,
    files: [
      {
        source: 'openapi/openapi.yml',
        destination: 'openapi/realtime-chart-server.yml',
        ignoredOperationIds: ['putInstrumentTick'],
      },
    ],
  },
];

const httpMethods = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
]);

/** A path item also holds non-operation keys (summary, parameters), which we skip. */
type PathItem = Record<string, {operationId?: string}>;

// Redoc renders whatever the spec contains, so unpublished endpoints have to be
// stripped while syncing rather than hidden at render time.
function removeIgnoredOperations(
    specText: string,
    ignoredOperationIds: string[],
): string {
  const spec = load(specText) as {paths?: Record<string, PathItem>};
  const paths = spec.paths ?? {};
  const ignored = new Set(ignoredOperationIds);
  const removed = new Set<string>();

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const method of Object.keys(pathItem)) {
      if (!httpMethods.has(method)) continue;

      const operationId = pathItem[method]?.operationId;
      if (!operationId || !ignored.has(operationId)) continue;

      delete pathItem[method];
      removed.add(operationId);
    }

    const hasOperation = Object.keys(pathItem).some((key) =>
        httpMethods.has(key),
    );
    if (!hasOperation) delete paths[path];
  }

  const missing = ignoredOperationIds.filter((id) => !removed.has(id));
  if (missing.length > 0) {
    console.warn(`  Ignored operationId not found: ${missing.join(', ')}`);
  }

  return dump(spec, {lineWidth: -1, noRefs: true});
}

for (const {root, files} of sources) {
  for (const {source, destination, ignoredOperationIds} of files) {
    const sourcePath = resolve(root, source);
    const destinationPath = resolve(siteRoot, destination);
    mkdirSync(dirname(destinationPath), {recursive: true});

    if (ignoredOperationIds) {
      const specText = readFileSync(sourcePath, 'utf8');
      writeFileSync(
          destinationPath,
          removeIgnoredOperations(specText, ignoredOperationIds),
      );
    } else {
      copyFileSync(sourcePath, destinationPath);
    }

    console.info(`Synced ${destination}`);
  }
}
