import path from 'node:path';
import picocolors from 'picocolors';
import type { BaseWriteStrategy, BuildMeta } from './writing-strategy/base';
import { compareAndWriteFile } from './create-file';

interface RuleOutputOptions {
  name: string;
  author: string;
  repo: string;
  date?: Date;
}

/**
 * 持有「与格式无关」的规则数据（域名后缀 / 域名 / IP-CIDR），负责去重，
 * 再交给各 WriteStrategy 输出成不同格式。参考 SukkaW/Surge 的 FileOutput 设计，
 * 但数据量小，用 Set/Map 即可，无需字典树。
 */
export class RuleOutput {
  private readonly name: string;
  private readonly author: string;
  private readonly repo: string;
  private readonly date: Date;

  /** 插入顺序保留，便于产物按券商分组、可读 */
  private readonly domainSuffixes = new Set<string>();
  private readonly domains = new Set<string>();
  /** cidr -> noResolve */
  private readonly ipcidrs = new Map<string, boolean>();

  constructor(options: RuleOutputOptions) {
    this.name = options.name;
    this.author = options.author;
    this.repo = options.repo;
    this.date = options.date ?? new Date();
  }

  addDomainSuffix(domain: string): this {
    this.domainSuffixes.add(domain);
    return this;
  }

  addDomain(domain: string): this {
    this.domains.add(domain);
    return this;
  }

  addIpCidr(cidr: string, noResolve: boolean): this {
    if (!this.ipcidrs.has(cidr)) {
      this.ipcidrs.set(cidr, noResolve);
    }
    return this;
  }

  /** 解析一行 Surge ruleset 语法 */
  addLine(line: string): this {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      return this;
    }

    const parts = trimmed.split(',');
    const type = parts[0].toUpperCase();
    const value = parts[1]?.trim();
    if (!value) {
      console.warn(picocolors.yellow(`[warn]  跳过缺少值的规则: ${trimmed}`));
      return this;
    }

    switch (type) {
      case 'DOMAIN-SUFFIX':
        return this.addDomainSuffix(value);
      case 'DOMAIN':
        return this.addDomain(value);
      case 'IP-CIDR':
      case 'IP-CIDR6': {
        const noResolve = parts.slice(2).some((p) => p.trim() === 'no-resolve');
        return this.addIpCidr(value, noResolve);
      }
      default:
        console.warn(picocolors.yellow(`[warn]  暂不支持的规则类型，已跳过: ${trimmed}`));
        return this;
    }
  }

  /** 批量喂入一个源文件的完整内容 */
  addSource(content: string): this {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      this.addLine(lines[i]);
    }
    return this;
  }

  private meta(): BuildMeta {
    return {
      name: this.name,
      author: this.author,
      repo: this.repo,
      date: this.date,
      counts: {
        domainSuffix: this.domainSuffixes.size,
        domain: this.domains.size,
        ipcidr: this.ipcidrs.size,
        total: this.domainSuffixes.size + this.domains.size + this.ipcidrs.size
      }
    };
  }

  get total(): number {
    return this.domainSuffixes.size + this.domains.size + this.ipcidrs.size;
  }

  /** 把数据灌进一个策略，返回该策略序列化后的完整文件内容 */
  private renderWith(strategy: BaseWriteStrategy): string[] {
    for (const suffix of this.domainSuffixes) {
      strategy.writeDomainSuffix(suffix);
    }
    for (const domain of this.domains) {
      strategy.writeDomain(domain);
    }
    for (const [cidr, noResolve] of this.ipcidrs) {
      strategy.writeIpCidr(cidr, noResolve);
    }
    return strategy.serialize(this.meta());
  }

  /** 用全部策略输出文件。每个策略实例对应一个文件。 */
  writeAll(strategies: BaseWriteStrategy[], rootDir: string): void {
    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];
      const lines = this.renderWith(strategy);
      compareAndWriteFile(lines, path.join(rootDir, strategy.outputPath));
    }
  }
}
