import fs from 'node:fs';
import path from 'node:path';
import picocolors from 'picocolors';

import { RuleOutput } from './lib/rule-output';
import { SurgeListStrategy } from './lib/writing-strategy/surge';
import { ClashYamlStrategy } from './lib/writing-strategy/clash';
import { QuantumultXStrategy } from './lib/writing-strategy/quantumultx';

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT_DIR, 'Source', 'broker');

const META = {
  name: 'Broker',
  author: 'forecho',
  repo: 'https://github.com/forecho/broker-rules'
};

function main(): void {
  const date = new Date();
  const ruleOutput = new RuleOutput({ ...META, date });

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.endsWith('.conf'))
    .sort();

  if (files.length === 0) {
    throw new Error(`未在 ${SOURCE_DIR} 找到任何 .conf 源文件`);
  }

  for (const file of files) {
    const content = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
    ruleOutput.addSource(content);
    console.log(picocolors.cyan(`[read]  Source/broker/${file}`));
  }

  const strategies = [
    new SurgeListStrategy('rule/Surge/Broker.list', 'Surge'),
    new SurgeListStrategy('rule/Loon/Broker.list', 'Loon'),
    new SurgeListStrategy('rule/Shadowrocket/Broker.list', 'Shadowrocket'),
    new SurgeListStrategy('Broker.list', 'Surge (root)'),
    new ClashYamlStrategy('rule/Clash/Broker.yaml', 'Clash'),
    new ClashYamlStrategy('rule/Stash/Broker.yaml', 'Stash'),
    new QuantumultXStrategy('rule/QuantumultX/Broker.list')
  ];

  ruleOutput.writeAll(strategies, ROOT_DIR);

  console.log(
    picocolors.bold(picocolors.green(`\n构建完成：共 ${ruleOutput.total} 条规则，输出 ${strategies.length} 个文件。`))
  );
}

main();
