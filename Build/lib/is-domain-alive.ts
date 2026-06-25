import { Resolver } from 'node:dns/promises';

const DNS_SERVERS = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];
const TIMEOUT_MS = 5000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('dns-timeout')), ms);
    })
  ]);
}

/**
 * 判断一个域名是否还「活着」。只有在权威 DNS 明确返回 NXDOMAIN（域名不存在）时
 * 才判定为死域，其它错误（超时 / SERVFAIL / 网络问题）一律保守地当作存活，
 * 避免误删规则。
 */
export async function isDomainAlive(domain: string): Promise<boolean> {
  const resolver = new Resolver({ timeout: TIMEOUT_MS, tries: 2 });
  resolver.setServers(DNS_SERVERS);

  const lookups: Array<Promise<unknown>> = [
    resolver.resolve4(domain),
    resolver.resolve6(domain),
    resolver.resolveCname(domain)
  ];

  const results = await Promise.allSettled(
    lookups.map((p) => withTimeout(p, TIMEOUT_MS))
  );

  let sawNxdomain = false;
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value) && r.value.length > 0) {
      return true;
    }
    if (r.status === 'rejected') {
      const code = (r.reason as { code?: string } | null)?.code;
      if (code === 'ENOTFOUND' || code === 'ENODATA') {
        sawNxdomain = true;
      }
    }
  }

  // 三种记录都没解析到，且至少一次是 NXDOMAIN/ENODATA -> 判死
  // 否则（全是超时等不确定错误）-> 保守判活
  return !sawNxdomain;
}
