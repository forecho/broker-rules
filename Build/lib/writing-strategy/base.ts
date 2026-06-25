export interface BuildMeta {
  name: string;
  author: string;
  repo: string;
  date: Date;
  counts: {
    domainSuffix: number;
    domain: number;
    ipcidr: number;
    total: number;
  };
}

interface BannerCountLabels {
  suffix: string;
  domain: string;
  ip: string;
}

/**
 * 决定「同一份规则数据如何写成某种格式」。一个实例对应一个输出文件。
 */
export abstract class BaseWriteStrategy {
  /** 日志用的可读名字 */
  abstract readonly name: string;
  /** 输出文件相对仓库根目录的路径，如 rule/Surge/Broker.list */
  abstract readonly outputPath: string;

  protected body: string[] = [];

  abstract writeDomainSuffix(domain: string): void;
  abstract writeDomain(domain: string): void;
  abstract writeIpCidr(cidr: string, noResolve: boolean): void;

  /** 不同格式对统计项的叫法不同（DOMAIN-SUFFIX vs HOST-SUFFIX） */
  protected abstract bannerCountLabels(): BannerCountLabels;

  /** 规则正文前的引导行（如 Clash 的 payload:） */
  protected preamble(): string[] {
    return [];
  }

  private static formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  serialize(meta: BuildMeta): string[] {
    const labels = this.bannerCountLabels();
    const banner = [
      `# NAME: ${meta.name}`,
      `# AUTHOR: ${meta.author}`,
      `# REPO: ${meta.repo}`,
      `# UPDATED: ${BaseWriteStrategy.formatDate(meta.date)}`,
      `# ${labels.suffix}: ${meta.counts.domainSuffix}`,
      `# ${labels.domain}: ${meta.counts.domain}`,
      `# ${labels.ip}: ${meta.counts.ipcidr}`,
      `# TOTAL: ${meta.counts.total}`
    ];
    return [...banner, ...this.preamble(), ...this.body];
  }
}
