import { BaseWriteStrategy } from './base';

/**
 * Surge RULE-SET 格式（`.list`）。Loon、Shadowrocket 共用同一语法，
 * 只是输出到不同目录，因此复用本策略。
 */
export class SurgeListStrategy extends BaseWriteStrategy {
  readonly name: string;
  readonly outputPath: string;

  constructor(outputPath: string, name = 'Surge') {
    super();
    this.outputPath = outputPath;
    this.name = name;
  }

  writeDomainSuffix(domain: string): void {
    this.body.push(`DOMAIN-SUFFIX,${domain}`);
  }

  writeDomain(domain: string): void {
    this.body.push(`DOMAIN,${domain}`);
  }

  writeIpCidr(cidr: string, noResolve: boolean): void {
    this.body.push(`IP-CIDR,${cidr}${noResolve ? ',no-resolve' : ''}`);
  }

  protected bannerCountLabels() {
    return { suffix: 'DOMAIN-SUFFIX', domain: 'DOMAIN', ip: 'IP-CIDR' };
  }
}
