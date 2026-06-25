import { BaseWriteStrategy } from './base';

/**
 * Clash / Mihomo rule-provider YAML 格式（`.yaml`）。Stash 共用同一语法。
 */
export class ClashYamlStrategy extends BaseWriteStrategy {
  readonly name: string;
  readonly outputPath: string;

  constructor(outputPath: string, name = 'Clash') {
    super();
    this.outputPath = outputPath;
    this.name = name;
  }

  protected preamble(): string[] {
    return ['payload:'];
  }

  writeDomainSuffix(domain: string): void {
    this.body.push(`  - DOMAIN-SUFFIX,${domain}`);
  }

  writeDomain(domain: string): void {
    this.body.push(`  - DOMAIN,${domain}`);
  }

  writeIpCidr(cidr: string, noResolve: boolean): void {
    this.body.push(`  - IP-CIDR,${cidr}${noResolve ? ',no-resolve' : ''}`);
  }

  protected bannerCountLabels() {
    return { suffix: 'DOMAIN-SUFFIX', domain: 'DOMAIN', ip: 'IP-CIDR' };
  }
}
