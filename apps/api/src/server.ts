import { buildApp } from './app';
import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch (error) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}

const mode = process.env.APP_MODE ?? 'demo';
const host = process.env.API_HOST ?? '127.0.0.1';
const port = Number(process.env.API_PORT ?? 4000);
if (!['127.0.0.1', '::1', 'localhost'].includes(host))
  throw new Error('The synthetic demo API can bind only to localhost.');
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('API_PORT must be a valid port number.');
const app = buildApp({ mode });
await app.listen({ host, port });
console.info(
  `Patient Touch synthetic demo API: http://${host}:${port}. In-memory data resets on restart. No production authentication, recording or AI.`,
);
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });
