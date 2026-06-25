import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors';

import { isDomainAlive } from './lib/is-domain-alive';

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'Source', 'broker');
const CONCURRENCY = 16;

/**
 * 独立的域名存活校验工具（默认不参与 build）。
 * 跑 `pnpm validate:alive`，会逐个 DNS 解析 Source 里的域名，列出疑似失效的。
 * 仅报告，不修改任何文件、不让 CI 失败。
 */
function collectDomains(): string[] {
  const domains = new Set<string>();
  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.conf'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (line === '' || line.startsWith('#')) continue;
      const [type, value] = line.split(',');
      if ((type === 'DOMAIN-SUFFIX' || type === 'DOMAIN') && value) {
        domains.add(value.trim());
      }
    }
  }

  return Array.from(domains);
}

async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index++];
      await worker(current);
    }
  });
  await Promise.all(runners);
}

async function main(): Promise<void> {
  const domains = collectDomains();
  console.log(picocolors.cyan(`开始校验 ${domains.length} 个域名（并发 ${CONCURRENCY}）...\n`));

  const dead: string[] = [];
  let checked = 0;

  await runPool(domains, CONCURRENCY, async (domain) => {
    const alive = await isDomainAlive(domain);
    checked++;
    if (!alive) {
      dead.push(domain);
      console.log(picocolors.red(`  ✘ ${domain}`));
    }
  });

  console.log('');
  if (dead.length === 0) {
    console.log(picocolors.green(`全部 ${checked} 个域名解析正常。`));
  } else {
    console.log(picocolors.yellow(`疑似失效域名 ${dead.length} 个（请人工确认后再决定是否从 Source 移除）：`));
    for (const d of dead.sort()) {
      console.log(`  - ${d}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
