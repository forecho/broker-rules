import { BaseWriteStrategy } from './base';

/**
 * QuantumultX filter 格式（`.list`）。每条规则结尾带策略名（默认 Broker）。
 */
export class QuantumultXStrategy extends BaseWriteStrategy {
  readonly name = 'QuantumultX';
  readonly outputPath: string;

  private readonly policy: string;

  constructor(outputPath: string, policy = 'Broker') {
    super();
    this.outputPath = outputPath;
    this.policy = policy;
  }

  writeDomainSuffix(domain: string): void {
    this.body.push(`HOST-SUFFIX,${domain},${this.policy}`);
  }

  writeDomain(domain: string): void {
    this.body.push(`HOST,${domain},${this.policy}`);
  }

  writeIpCidr(cidr: string, noResolve: boolean): void {
    this.body.push(`IP-CIDR,${cidr},${this.policy}${noResolve ? ',no-resolve' : ''}`);
  }

  protected bannerCountLabels() {
    return { suffix: 'HOST-SUFFIX', domain: 'HOST', ip: 'IP-CIDR' };
  }
}
